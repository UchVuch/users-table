<template>
  <div>
    <div class="top">
      <h1>Учётные записи</h1>
      <Button
        :disabled="addingUser"
        icon="pi pi-plus"
        severity="success"
        aria-label="Добавить пользователя"
        @click="createDefaultNewUser"
      />
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
          <template v-for="(user, index) in userList" v-else :key="user.id">
            <UsersTableRow
              :user
              :columns="tableColumns"
              :hidden-fields
              :disabled="disabledRow(index)"
              @add-user="handleAddUser"
              @update-user="handleUpdateUser"
              @delete-user="handleDeleteUser"
              @add-hidden-field="addHiddenField"
              @remove-hidden-field="removeHiddenField"
              @input-update-user="(e) => inputUpdateUser(e, index)"
              @select-update-user="(e) => selectUpdateUser(e, index)"
            />
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, UserId, UsersColumnKey } from '@/types/users';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableEmpty } from '@/components/ui/table';
import { Button } from 'primevue';
import { useUsersStore } from '@/stores/users';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import UsersTableRow, { type HiddenField, type InputUserData, type SelectUserData } from './UsersTableRow.vue';
import { generateUserId, getStringFromMarks } from '@/utils/users';

export interface UsersTableColumn {
  columnKey: UsersColumnKey;
  label: string;
}

export interface FormatedUser extends Omit<User, 'marks'> {
  marks: string;
}

export type StorageWithColumnKeyForIds = Partial<Record<UsersColumnKey, UserId[]>>;

const { users } = storeToRefs(useUsersStore());
const userStore = useUsersStore();

const disabledRow = (index: number) => addingUser.value && index !== userList.value.length - 1;

const hiddenFields = ref<StorageWithColumnKeyForIds>({
  password: []
});

const addHiddenField = ({ fieldKey, userId }: HiddenField) => hiddenFields.value[fieldKey]?.push(userId);
const removeHiddenField = ({ fieldKey, userId }: HiddenField) =>
  (hiddenFields.value.password = [...(hiddenFields.value[fieldKey]?.filter((id) => id !== userId) || [])]);

const userList = ref<FormatedUser[]>([]);

const inputUpdateUser = (userActionData: InputUserData, index: number) => {
  const { fieldKey, value } = userActionData;
  if (fieldKey === 'recordType') return;
  userList.value[index][fieldKey] = value;
};

const selectUpdateUser = (userActionData: SelectUserData, index: number) => {
  const { fieldKey, value } = userActionData;
  if (fieldKey !== 'recordType') return;
  userList.value[index][fieldKey] = value;
};

onMounted(() => {
  const formatedUsers = users.value.map((user) => {
    if (user.password === null) {
      hiddenFields.value.password?.push(user.id);
    }
    return { ...user, marks: getStringFromMarks(user.marks) };
  });
  userList.value = [...formatedUsers];
});

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

const addingUser = ref(false);

const handleDeleteUser = (userId: UserId) => {
  addingUser.value = false;
  userList.value = userList.value.filter((user) => user.id !== userId);
  userStore.deleteUser(userId);
};

const createDefaultNewUser = () => {
  addingUser.value = true;

  userList.value.push({
    id: generateUserId(),
    marks: '',
    recordType: 'Локальная',
    login: '',
    password: ''
  });
};

const handleAddUser = (userEmit: User) => {
  userStore.addUser({ ...userEmit });
  addingUser.value = false;
};
const handleUpdateUser = (userEmit: User) => {
  userStore.updateUser(userEmit.id, { ...userEmit });
  addingUser.value = false;
};
</script>

<style scoped>
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
</style>
