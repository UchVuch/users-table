import type { User } from '@/types/users';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([
    // {
    //   id: '1',
    //   marks: [],
    //   recordType: 'LDAP',
    //   login: 'User 1',
    //   password: 'admin'
    // }
  ]);

  const addUser = (user: User) => {};
  const deleteUser = (user: User) => {};

  return {
    users,
    addUser,
    deleteUser
  };
});
