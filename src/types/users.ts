export type UserId = string;

export interface Mark {
  text: string;
}

export type RecordType = 'LDAP' | 'Локальная';

export interface User {
  id: UserId;
  marks: Mark[];
  recordType: RecordType;
  login: string;
  password: string | null;
}
