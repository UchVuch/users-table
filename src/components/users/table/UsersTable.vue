<template>
  <div>
    <div class="top">
      <h1>Учётные записи</h1>
      <Button :disabled="addingUser" icon="pi pi-plus" severity="success" aria-label="Добавить пользователя" @click="addNewUser" />
    </div>

    <p class="informer">Для указания нескольких меток пары логин/пароль используйте разделитель ;</p>

    {{ users }}
    <div class="users-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="column in tableColumns" :key="column.columnKey">
              {{ column.label }}
            </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty v-if="!userList.length" :colspan="tableColumns.length">Нет пользователей, добавьте нового пользователя.</TableEmpty>
          <template v-else>
            <TableRow v-for="(user, userListIndex) in userList" :key="user.id">
              <TableCell v-for="{ columnKey } in tableColumns" :key="columnKey" :collspan="getCollspan(columnKey)">
                <InputText
                  v-if="columnKey === 'marks'"
                  :default-value="getStringFromMarks(user[columnKey])"
                  type="text"
                  maxlength="50"
                  @blur="(e) => handleInputChange(e, { user, key: columnKey, defaultValue: getStringFromMarks(user[columnKey]) })"
                />
                <Select
                  v-if="columnKey === 'recordType'"
                  :default-value="user[columnKey]"
                  :options="recordTypeOptions"
                  @value-change="(e) => handleDropdownChange(e, { user, defaultValue: user[columnKey] })"
                />
                <InputText
                  v-if="columnKey === 'login'"
                  :default-value="user[columnKey]"
                  type="text"
                  maxlength="100"
                  :invalid="showInvalid(columnKey, user.id)"
                  @blur="(e) => handleInputChange(e, { user, key: columnKey, defaultValue: user[columnKey] })"
                />
                <InputText
                  v-if="columnKey === 'password'"
                  :default-value="user[columnKey]"
                  type="text"
                  maxlength="100"
                  :invalid="showInvalid(columnKey, user.id)"
                  @blur="(e) => handleInputChange(e, { user, key: columnKey, defaultValue: user[columnKey] })"
                />
              </TableCell>
              <TableCell class="delete-btn">
                <Button
                  :disabled="addingUser && userListIndex !== userList.length - 1"
                  label="Удалить"
                  icon="pi pi-trash"
                  severity="danger"
                  aria-label="Удалить пользователя"
                  @click="handleDeleteUser(user.id)"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mark, RecordType, User, UserId, UsersColumnKey } from '@/types/users';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Button, InputText, Select } from 'primevue';
import { useUsersStore } from '@/stores/users';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

interface UsersTableColumn {
  columnKey: UsersColumnKey;
  label: string;
}

interface InputUpdatedData {
  user: User;
  key: UsersColumnKey;
  defaultValue: string | null;
}

interface DropdownUpdatedData {
  user: User;
  defaultValue: RecordType;
}

const { users } = storeToRefs(useUsersStore());
const userStore = useUsersStore();

const userList = ref<User[]>([]);
watch(users, (newValue: User[]) => (userList.value = [...newValue]), { deep: true, immediate: true });

const getCollspan = (key: UsersColumnKey) => 1;

const tableColumns: UsersTableColumn[] = [
  {
    columnKey: 'marks',
    label: 'Метки'
  },
  {
    columnKey: 'recordType',
    label: 'Тип записи'
  },
  {
    columnKey: 'login',
    label: 'Логин'
  },
  {
    columnKey: 'password',
    label: 'Пароль'
  }
];
const recordTypeOptions: RecordType[] = ['LDAP', 'Локальная'];

const addingUser = ref(false);
const generateUserId = () => Math.random().toString(36).slice(2, 9);
const addNewUser = () => {
  addingUser.value = true;

  userList.value.push({
    id: generateUserId(),
    marks: [],
    recordType: 'Локальная',
    login: '',
    password: ''
  });
};
const handleDeleteUser = (userId: UserId) => {
  addingUser.value = false;
  userStore.deleteUser(userId);
};

const getStringFromMarks = (marks: Mark[]): string => marks?.map((mark) => mark.text).join('; ');
const getMarksFromString = (marksString: string): Mark[] => {
  if (!marksString || marksString.trim() !== '') {
    return marksString
      .split(';')
      .map((label) => label.trim())
      .filter((label) => label !== '')
      .map((label) => ({ text: label }));
  }

  return [];
};

const inputErrors = ref<Record<string, UserId[]>>({
  login: [],
  password: []
});
const showInvalid = (key: UsersColumnKey, userId: UserId) => inputErrors.value[key].includes(userId);

const validateUserData = (currentUser: User) => {
  const { login, password, recordType } = currentUser;

  if (!login || !login.trim()) {
    inputErrors.value.login.push(currentUser.id);
    return false;
  }

  if (recordType === 'Локальная') {
    if (!password || !password.trim()) {
      inputErrors.value.password.push(currentUser.id);
      return false;
    }
  }

  return true;
};

const handleInputChange = (e: FocusEvent, userData: InputUpdatedData) => {
  if (e.target instanceof HTMLInputElement) {
    const newValue = e.target.value;
    const { user, key, defaultValue } = userData;
    const userId = user.id;

    const isValid = validateUserData(user);
    if (!isValid) return;

    const isExsists = userStore.isUserExists(userId);

    if (!isExsists) {
      userStore.addUser({ ...user });
      addingUser.value = false;
      return;
    }

    const isNewValue = newValue !== defaultValue;

    if (key === 'marks' && isNewValue) {
      const marks = getMarksFromString(newValue);
      userStore.updateUser(userId, { ...user, marks });
      return;
    }

    if (isNewValue) {
      userStore.updateUser(userId, { ...user, [key]: newValue });
    }
  }
};

const handleDropdownChange = (recordType: RecordType, userData: DropdownUpdatedData) => {
  const { user, defaultValue } = userData;

  const isValid = validateUserData(user);
  if (!isValid) return;

  const isNewValue = recordType !== defaultValue;
  if (!isNewValue) return;

  const password = recordType === 'LDAP' ? null : user.password;
  userStore.updateUser(user.id, { ...user, password, recordType });
};
</script>

<style lang="css" scoped>
.top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.informer {
  font-size: 18px;
  margin-bottom: 20px;
}

.users-table {
  border-radius: 20px;
  border: solid 1px #979797;
  max-width: 70vw;
  overflow-x: auto;
  padding: 10px;
  background-color: #2d2d2d;
}

.delete-btn {
  display: flex;
}
</style>
