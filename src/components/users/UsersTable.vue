<template>
  <div>
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
        <TableEmpty v-if="!users.length" :colspan="tableColumns.length">Нет пользователей, добавьте нового пользователя.</TableEmpty>
        <template v-else>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell v-for="{ columnKey } in tableColumns" :key="columnKey">
              {{ user[columnKey] }}
            </TableCell>
            <TableCell> <Button label="Удалить" icon="pi pi-trash" /> </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import type { RecordType, User, UserId } from '@/types/users';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import Button from 'primevue/button';
import { useUsersStore } from '@/stores/users';
import { storeToRefs } from 'pinia';

interface UsersTableColumn {
  columnKey: keyof User;
  label: string;
}

const { users } = storeToRefs(useUsersStore());

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

const addNewUser = () => {};
const removeUser = (id: UserId) => {};

const handleUserData = (user: User) => {};

const handleDropdownChange = (user: User) => {
  handleUserData(user);
};
const handleBlur = (user: User) => {
  handleUserData(user);
};
</script>
