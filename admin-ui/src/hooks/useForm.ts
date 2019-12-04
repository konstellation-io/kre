import useInput, { InputHookElement } from './useInput';
import { ApolloError } from 'apollo-client';

export type Form = {
  input: { [key: string]: InputHookElement };
  submit: Function;
  uploadProgress: number;
  isValid: Function;
  loading?: boolean;
  error?: ApolloError | undefined;
  clearInputs: Function;
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
  clearOnSubmit?: boolean;
};

const form: any = {};

function initializeForm(
  submit: Function,
  isValid: Function,
  clearInputs: Function
) {
  form.input = {};
  form.uploadProgress = 0;
  form.submit = submit;
  form.isValid = isValid;
  form.clearInputs = clearInputs;
}

export default function useForm({
  inputElements,
  fetchFunction,
  additionalInputProps = {},
  isQuery = false,
  clearOnSubmit = true
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

        if (clearOnSubmit) {
          clearInputs();
        }
      });

      const input = {
        ...mutationVariables,
        ...additionalInputProps
      };
      const variables = isQuery ? input : { variables: input };

      fetchFunction(variables);
    }
  }
  function clearInputs() {
    Object.keys(form.input).forEach(input => {
      form.input[input].clear();
      form.input[input].clearError();
    });
  }

  initializeForm(submit, isValid, clearInputs);

  inputElements.forEach(inputElement => {
    // eslint-disable-next-line
    const input = useInput(inputElement.defaultValue, inputElement.verifier);

    form.input[inputElement.id] = input;
  });

  return form as Form;
}
