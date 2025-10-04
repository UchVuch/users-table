import type { User, UserId } from '@/types/users';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([
    {
      id: '1',
      marks: [{ text: 'asdfsdf' }, { text: 'tututu' }],
      recordType: 'Локальная',
      login: 'User 1',
      password: 'admin'
    }
  ]);

  const isUserExists = (id: UserId) => {
    return users.value.find((user) => user.id === id);
  };
  const addUser = (user: User) => {
    users.value.push(user);
  };
  const deleteUser = (id: UserId) => {
    users.value = users.value.filter((user) => user.id !== id);
  };
  const updateUser = (id: UserId, updatedData: User) => {
    const index = users.value.findIndex((user) => user.id === id);
    if (index !== -1) {
      users.value[index] = { ...updatedData };
    }
  };

  return {
    users,
    isUserExists,
    addUser,
    deleteUser,
    updateUser
  };
});
