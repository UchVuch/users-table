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
              <template v-for="{ columnKey } in tableColumns" :key="columnKey">
                <TableCell v-if="isFieldVisible(columnKey, user.id)" :colspan="getColSpan(user.id, columnKey)">
                  <InputText
                    v-if="columnKey === 'marks'"
                    v-model="user[columnKey]"
                    maxlength="50"
                    type="text"
                    :name="`${columnKey}${user.id}`"
                    autocomplete="off"
                    :disabled="disabledTable(userListIndex)"
                    fluid
                    @blur="(e) => handleInputChange(e, { user, key: columnKey, defaultValue: user[columnKey] })"
                  />
                  <Select
                    v-if="columnKey === 'recordType'"
                    v-model="user[columnKey]"
                    :options="recordTypeOptions"
                    :disabled="disabledTable(userListIndex)"
                    fluid
                    @update:model-value="(e) => handleDropdownChange(e, { user, defaultValue: user[columnKey] })"
                  />
                  <InputText
                    v-if="columnKey === 'login'"
                    v-model="user[columnKey]"
                    maxlength="100"
                    type="text"
                    autocomplete="off"
                    :name="`${columnKey}${user.id}`"
                    :invalid="showInvalid(columnKey, user.id)"
                    :disabled="disabledTable(userListIndex)"
                    fluid
                    @blur="(e) => handleInputChange(e, { user, key: columnKey, defaultValue: user[columnKey] })"
                  />
                  <Password
                    v-if="columnKey === 'password'"
                    v-model="user[columnKey]"
                    maxlength="100"
                    toggle-mask
                    type="text"
                    :name="`${columnKey}${user.id}`"
                    :feedback="false"
                    :input-props="{ name: `${columnKey}${user.id}`, autocomplete: 'new-password' }"
                    autocomplete="new-password"
                    :invalid="showInvalid(columnKey, user.id)"
                    :disabled="disabledTable(userListIndex)"
                    fluid
                    @blur="(e) => handleInputChange(e, { user, key: columnKey, defaultValue: user[columnKey] })"
                  />
                </TableCell>
              </template>
              <TableCell class="delete-btn">
                <Button
                  :disabled="disabledTable(userListIndex)"
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
import { Button, InputText, Select, Password } from 'primevue';
import { useUsersStore } from '@/stores/users';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

interface UsersTableColumn {
  columnKey: UsersColumnKey;
  label: string;
}

interface InputUpdatedData {
  user: FormatedUser;
  key: UsersColumnKey;
  defaultValue: string | null;
}

interface DropdownUpdatedData {
  user: FormatedUser;
  defaultValue: RecordType;
}

interface FormatedUser extends Omit<User, 'marks'> {
  marks: string;
}

type StorageWithColumnKeyForIds = Partial<Record<UsersColumnKey, UserId[]>>;

const { users } = storeToRefs(useUsersStore());
const userStore = useUsersStore();

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

const hiddenFields = ref<StorageWithColumnKeyForIds>({
  password: []
});

const isFieldVisible = (key: UsersColumnKey, userId: UserId): boolean => {
  if (hiddenFields.value[key]) {
    return !hiddenFields.value[key]?.includes(userId);
  }

  return true;
};

const getColSpan = (userId: UserId, key: UsersColumnKey): number => {
  const currentIndex = tableColumns.findIndex((column) => column.columnKey === key);
  let colspan = 1;

  for (let i = currentIndex + 1; i < tableColumns.length; i++) {
    if (!isFieldVisible(tableColumns[i].columnKey, userId)) {
      colspan++;
    } else {
      break;
    }
  }

  return colspan;
};

const userList = ref<FormatedUser[]>([]);
watch(
  users,
  (newValue: User[]) => {
    const formatedUsers = newValue.map((user) => {
      if (user.password === null) {
        hiddenFields.value.password?.push(user.id);
      }
      return { ...user, marks: getStringFromMarks(user.marks) };
    });
    userList.value = [...formatedUsers];
  },
  { deep: true, immediate: true }
);

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
const disabledTable = (index: number) => addingUser.value && index !== userList.value.length - 1;
const generateUserId = () => Math.random().toString(36).slice(2, 9);
const addNewUser = () => {
  addingUser.value = true;

  userList.value.push({
    id: generateUserId(),
    marks: '',
    recordType: 'Локальная',
    login: '',
    password: ''
  });
};
const handleDeleteUser = (userId: UserId) => {
  addingUser.value = false;
  userStore.deleteUser(userId);
};

const inputErrors = ref<StorageWithColumnKeyForIds>({
  login: [],
  password: []
});
const showInvalid = (key: UsersColumnKey, userId: UserId) => inputErrors.value[key]?.includes(userId);

const validateUserData = (currentUser: FormatedUser) => {
  const { login, password, recordType, id: userId } = currentUser;
  if (!login || !login.trim()) {
    inputErrors.value.login?.push(userId);
    return false;
  } else {
    inputErrors.value.login = [...(inputErrors.value.login?.filter((id) => id !== userId) || [])];
  }

  if (recordType === 'Локальная') {
    if (!password || !password.trim()) {
      inputErrors.value.password?.push(currentUser.id);
      return false;
    } else {
      inputErrors.value.password = [...(inputErrors.value.password?.filter((id) => id !== userId) || [])];
    }
  }

  return true;
};

const handleInputChange = (e: FocusEvent, userData: InputUpdatedData) => {
  if (e.target instanceof HTMLInputElement) {
    const newValue = e.target.value;
    const { user, key, defaultValue } = userData;
    const userId = user.id;

    const isExsists = userStore.isUserExists(userId);
    // const isNewValue = newValue !== defaultValue;

    if (key === 'marks') {
      const marks = getMarksFromString(newValue);

      const isValid = validateUserData({ ...user });
      if (!isValid) return;

      if (!isExsists) {
        userStore.addUser({ ...user, marks });
        addingUser.value = false;
        return;
      }

      userStore.updateUser(userId, { ...user, marks });
      return;
    }

    // if (isNewValue) {
    const isValid = validateUserData({ ...user, [key]: newValue });
    if (!isValid) return;

    const marks = getMarksFromString(user.marks);
    if (!isExsists) {
      userStore.addUser({ ...user, marks, [key]: newValue });
      addingUser.value = false;
      return;
    }
    console.log('upddate');
    userStore.updateUser(userId, { ...user, marks, [key]: newValue });
    // }
  }
};

const handleDropdownChange = (recordType: RecordType, userData: DropdownUpdatedData) => {
  const { user, defaultValue } = userData;

  const isLdap = recordType === 'LDAP';

  const password = isLdap ? null : user.password;

  if (!password && isLdap) {
    hiddenFields.value.password?.push(user.id);
  } else {
    hiddenFields.value.password = [...(hiddenFields.value.password?.filter((id) => id !== user.id) || [])];
  }

  const isValid = validateUserData({ ...user, recordType });
  if (!isValid) return;
  // const isNewValue = recordType !== defaultValue;
  // if (!isNewValue) return;
  // console.log('e2');

  const marks = getMarksFromString(user.marks);

  const isExsists = userStore.isUserExists(user.id);
  if (!isExsists) {
    userStore.addUser({ ...user, marks, password, recordType });
    addingUser.value = false;
    return;
  }
  userStore.updateUser(user.id, { ...user, marks, password, recordType });
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
