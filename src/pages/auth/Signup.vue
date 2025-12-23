<template>
  <h1 class="title">signup</h1>

  <Form @submit.prevent="onSubmit">
    <InputText v-model="email" v-bind="emailAttrs" name="email" placeholder="email" type="email" autocomplete="off" />
    <Password
      v-model="password"
      v-bind="passwordAttrs"
      name="password"
      placeholder="password"
      toggle-mask
      autocomplete="new-password"
      :input-props="{ name: `password-my-unic-238`, autocomplete: 'new-password' }"
      :invalid="!!errors.password"
    />
    <Password
      v-model="confirmPassword"
      v-bind="confirmPasswordAttrs"
      name="password-confirm"
      placeholder="confirm password"
      toggle-mask
      autocomplete="new-password"
      :input-props="{ name: `confirm-password-my-unic-238`, autocomplete: 'new-password' }"
      :invalid="!!errors.confirmPassword"
    />
    <Button type="submit" label="Submit" />
  </Form>

  {{ values }}
  {{ errors }}
</template>

<script setup lang="ts">
import Form from '@/components/ui/form/Form.vue';
import { InputText, Password, Button } from 'primevue';

import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { InvalidSubmissionContext } from 'vee-validate';

interface SignupValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const signupSchema = z
  .object({
    email: z
      .string()
      .nonempty({ message: 'Field is required' })
      .regex(/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/, { message: 'Invalid email format' }),
    password: z
      .string()
      .nonempty({ message: 'Field is required' })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
        message: 'Password must be at least 8 characters, include letters, numbers, and a special character'
      }),
    confirmPassword: z.string().nonempty({ message: 'Field is required' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match'
  });

const { values, errors, handleSubmit, defineField } = useForm<SignupValues>({ validationSchema: toTypedSchema(signupSchema) });
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const onSuccess = (values: SignupValues) => {
  console.error('values', values.email, values.password, values.confirmPassword);
};

const onInvalid = ({ values, errors, results }: InvalidSubmissionContext<SignupValues>) => {
  console.error(values);
  console.error(errors);
  console.error(results);
};

const onSubmit = handleSubmit(onSuccess, onInvalid);
</script>

<style scoped>
.title {
  margin-bottom: 20px;
}
</style>
