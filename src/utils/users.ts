import type { Mark } from '@/types/users';

export const getStringFromMarks = (marks: Mark[]): string => marks?.map((mark) => mark.text).join('; ');
export const getMarksFromString = (marksString: string): Mark[] => {
  if (!marksString || marksString.trim() !== '') {
    return marksString
      .split(';')
      .map((label) => label.trim())
      .filter((label) => label !== '')
      .map((label) => ({ text: label }));
  }

  return [];
};
export const generateUserId = () => Math.random().toString(36).slice(2, 9);
