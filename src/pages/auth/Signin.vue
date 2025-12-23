<template>
  <h1 class="title">signin</h1>

  <Form @submit.prevent="onSubmit">
    <InputText v-model="name" v-bind="nameAttrs" name="login-my-unic-238" placeholder="login" autocomplete="off" />
    <Password
      v-model="password"
      v-bind="passwordAttrs"
      name="password-my-unic-238"
      placeholder="password"
      toggle-mask
      autocomplete="new-password"
      :input-props="{ name: `password-my-unic-238`, autocomplete: 'new-password' }"
      :invalid="!!errors.password"
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

interface SigninValues {
  name: string;
  password: string;
}

const signinSchema = z.object({
  name: z.string().nonempty({ message: 'Field is required' }),
  password: z.string().nonempty({ message: 'Field is required' })
});

const { values, errors, handleSubmit, defineField } = useForm<SigninValues>({
  validationSchema: toTypedSchema(signinSchema)
});

const [name, nameAttrs] = defineField('name');
const [password, passwordAttrs] = defineField('password');

const onSuccess = (values: SigninValues) => {
  console.error('values', values.name, values.password);
};

const onInvalid = ({ values, errors, results }: InvalidSubmissionContext<SigninValues>) => {
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
