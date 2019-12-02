import useInput, { InputHookElement } from './useInput';
import { ApolloError } from 'apollo-client';

export type Form = {
  input: { [key: string]: InputHookElement };
  submit: Function;
  uploadProgress: number;
  isValid: Function;
  loading?: boolean;
  error?: ApolloError | undefined;
};

type InputElement = {
  defaultValue: any;
  verifier: Function;
  id: string;
};

type Params = {
  inputElements: InputElement[];
  fetchFunction: Function;
  additionalInputProps?: object;
  isQuery?: boolean;
};

const form: any = {};

function initializeForm(submit: Function, isValid: Function) {
  form.input = {};
  form.uploadProgress = 0;
  form.submit = submit;
  form.isValid = isValid;
}

export default function useForm({
  inputElements,
  fetchFunction,
  additionalInputProps = {},
  isQuery = false
}: Params) {
  function isValid() {
    let isFormValid = true;

    Object.keys(form.input).forEach(input => {
      isFormValid = isFormValid && form.input[input].isValid();
    });

    return isFormValid;
  }
  function submit() {
    if (form.isValid()) {
      const mutationVariables: { [key: string]: any } = {};
      Object.keys(form.input).forEach(input => {
        mutationVariables[input] = form.input[input].value;

        form.input[input].clear();
        form.input[input].clearError();
      });

      const input = {
        ...mutationVariables,
        ...additionalInputProps
      };
      const variables = isQuery ? input : { variables: input };

      fetchFunction(variables);
    }
  }

  initializeForm(submit, isValid);

  inputElements.forEach(inputElement => {
    // eslint-disable-next-line
    const input = useInput(inputElement.defaultValue, inputElement.verifier);

    form.input[inputElement.id] = input;
  });

  return form as Form;
}
