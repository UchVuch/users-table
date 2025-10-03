<template>
  <div>
    <div class="top">
      <h1>Учётные записи</h1>
      <Button icon="pi pi-plus" severity="success" aria-label="Добавить пользователя" />
    </div>

    <p class="informer">Для указания нескольких меток пары логин/пароль используйте разделитель ;</p>

    {{ users }}
    <Table class="users-table">
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
              <InputText
                v-if="columnKey === 'marks'"
                :value="user[columnKey]"
                type="text"
                @update:model-value="
                  (e) => {
                    console.log(e);
                  }
                "
              />
              <Select v-else-if="columnKey === 'recordType'" v-model="user[columnKey]" :options="recordTypeOptions" />
              <InputText
                v-else
                v-model="user[columnKey]"
                type="text"
                @update:model-value="
                  (e) => {
                    console.log(e);
                  }
                "
              />
              <Message severity="error" size="small" variant="simple">ошибка</Message>
            </TableCell>
            <TableCell class="delete-btn">
              <Button label="Удалить" icon="pi pi-trash" severity="danger" aria-label="Удалить пользователя" />
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import type { RecordType, User, UserId } from '@/types/users';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Message, Button, InputText, Select } from 'primevue';
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
  width: 60vw;
}

.delete-btn {
  display: flex;
}
</style>
