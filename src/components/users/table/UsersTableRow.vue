<template>
  <TableRow>
    <template v-for="{ columnKey } in columns" :key="columnKey">
      <TableCell v-if="isFieldVisible(columnKey, user.id)" :colspan="getColSpan(user.id, columnKey)">
        <InputText
          v-if="columnKey === 'marks'"
          :default-value="user[columnKey]"
          maxlength="50"
          type="text"
          :name="`${columnKey}${user.id}`"
          autocomplete="off"
          :disabled
          fluid
          @update:model-value="(e) => updateInputUser({ columnKey, value: e })"
          @focus="(e) => setCurrentInputFocusValue(e)"
          @blur="(e) => handleInputChange(e, { user, key: columnKey })"
        />
        <Select
          v-if="columnKey === 'recordType'"
          :default-value="user[columnKey]"
          :options="recordTypeOptions"
          :disabled
          fluid
          @focus="setCurrentSelectFocusValue(user[columnKey])"
          @update:model-value="(e) => handleDropdownChange(e, { user }, columnKey)"
        />
        <InputText
          v-if="columnKey === 'login'"
          :default-value="user[columnKey]"
          maxlength="100"
          type="text"
          autocomplete="off"
          :name="`${columnKey}${user.id}`"
          :invalid="showInvalid(columnKey, user.id)"
          :disabled
          fluid
          @update:model-value="(e) => updateInputUser({ columnKey, value: e })"
          @focus="(e) => setCurrentInputFocusValue(e)"
          @blur="(e) => handleInputChange(e, { user, key: columnKey })"
        />
        <Password
          v-if="columnKey === 'password'"
          :default-value="user[columnKey]"
          maxlength="100"
          toggle-mask
          type="text"
          :name="`${columnKey}${user.id}`"
          :feedback="false"
          :input-props="{ name: `${columnKey}${user.id}`, autocomplete: 'new-password' }"
          autocomplete="new-password"
          :invalid="showInvalid(columnKey, user.id)"
          :disabled
          fluid
          @update:model-value="(e) => updateInputUser({ columnKey, value: e })"
          @focus="(e) => setCurrentInputFocusValue(e)"
          @blur="(e) => handleInputChange(e, { user, key: columnKey })"
        />
      </TableCell>
    </template>
    <TableCell class="delete-btn" colspan="1">
      <Button
        :disabled
        label="Удалить"
        icon="pi pi-trash"
        severity="danger"
        aria-label="Удалить пользователя"
        @click="handleDeleteUser(user.id)"
      />
    </TableCell>
  </TableRow>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useUsersStore } from '@/stores/users';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button, InputText, Select, Password } from 'primevue';
import type { FormatedUser, UsersTableColumn, StorageWithColumnKeyForIds } from './UsersTable.vue';
import type { RecordType, User, UserId, UsersColumnKey } from '@/types/users';
import { getMarksFromString } from '@/utils/users';

export interface InputUpdatedData {
  user: FormatedUser;
  key: UsersColumnKey;
}

export interface DropdownUpdatedData {
  user: FormatedUser;
}

interface UsersTableRowProps {
  user: FormatedUser;
  columns: UsersTableColumn[];
  hiddenFields: StorageWithColumnKeyForIds;
  disabled: boolean;
}

export interface HiddenField {
  fieldKey: UsersColumnKey;
  userId: UserId;
}

export interface InputUserData {
  fieldKey: UsersColumnKey;
  value: string;
}

export interface SelectUserData extends InputUserData {
  value: RecordType;
}

interface InputUpdate {
  columnKey: UsersColumnKey;
  value: string | undefined;
}

interface UsersTableRowEmits {
  deleteUser: [userId: UserId];
  addUser: [userEmit: User];
  updateUser: [userEmit: User];
  addHiddenField: [HiddenField];
  removeHiddenField: [HiddenField];
  inputUpdateUser: [InputUserData];
  selectUpdateUser: [SelectUserData];
}

const { columns, hiddenFields } = defineProps<UsersTableRowProps>();
const emit = defineEmits<UsersTableRowEmits>();

const userStore = useUsersStore();

const recordTypeOptions: RecordType[] = ['LDAP', 'Локальная'];

const updateInputUser = (data: InputUpdate) => {
  if (data.value !== undefined) emit('inputUpdateUser', { fieldKey: data.columnKey, value: data.value });
};

const updateSelectUser = (userSelectData: SelectUserData) => emit('selectUpdateUser', userSelectData);

const inputErrors = ref<StorageWithColumnKeyForIds>({
  login: [],
  password: []
});

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

const showInvalid = (key: UsersColumnKey, userId: UserId) => inputErrors.value[key]?.includes(userId);

const isFieldVisible = (key: UsersColumnKey, userId: UserId): boolean => {
  if (hiddenFields[key]) {
    return !hiddenFields[key]?.includes(userId);
  }

  return true;
};

const getColSpan = (userId: UserId, key: UsersColumnKey): number => {
  const currentIndex = columns.findIndex((column) => column.columnKey === key);
  let colspan = 1;

  for (let i = currentIndex + 1; i < columns.length; i++) {
    if (!isFieldVisible(columns[i].columnKey, userId)) {
      colspan++;
    } else {
      break;
    }
  }

  return colspan;
};

const handleDeleteUser = (userId: UserId) => {
  emit('deleteUser', userId);
};

let currentInputFocusValue: string = '';
const setCurrentInputFocusValue = (e: FocusEvent) => {
  if (e.target instanceof HTMLInputElement) {
    currentInputFocusValue = e.target.value;
  }
};

let currentSelectFocusValue: string = '';
const setCurrentSelectFocusValue = (value: string) => (currentSelectFocusValue = value);

const handleInputChange = (e: FocusEvent, userData: InputUpdatedData) => {
  if (e.target instanceof HTMLInputElement) {
    const newValue = e.target.value;
    if (newValue === currentInputFocusValue) return;
    const { user, key } = userData;
    const userId = user.id;

    const isExsists = userStore.isUserExists(userId);

    if (key === 'marks') {
      const marks = getMarksFromString(newValue);

      const isValid = validateUserData({ ...user });
      if (!isValid) return;

      if (!isExsists) {
        emit('addUser', { ...user, marks });
        return;
      }

      emit('updateUser', { ...user, marks });
      return;
    }

    const isValid = validateUserData({ ...user, [key]: newValue });
    if (!isValid) return;

    const marks = getMarksFromString(user.marks);
    if (!isExsists) {
      emit('addUser', { ...user, marks, [key]: newValue });
      return;
    }

    emit('updateUser', { ...user, marks, [key]: newValue });
  }
};

const handleDropdownChange = (recordType: RecordType, userData: DropdownUpdatedData, columnKey: UsersColumnKey) => {
  updateSelectUser({ fieldKey: columnKey, value: recordType });

  if (recordType === currentSelectFocusValue) return;
  const { user } = userData;

  const isLdap = recordType === 'LDAP';

  const password = isLdap ? null : user.password;

  if (!password && isLdap) {
    emit('addHiddenField', { fieldKey: 'password', userId: user.id });
  } else {
    emit('removeHiddenField', { fieldKey: 'password', userId: user.id });
  }

  const isValid = validateUserData({ ...user, recordType });
  if (!isValid) return;

  const marks = getMarksFromString(user.marks);

  const isExsists = userStore.isUserExists(user.id);
  if (!isExsists) {
    emit('addUser', { ...user, marks, password, recordType });
    return;
  }

  emit('updateUser', { ...user, marks, password, recordType });
};
</script>

<style scoped>
.delete-btn {
  display: flex;
}
</style>
