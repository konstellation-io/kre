import { useState } from 'react';
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
  getInputVariables: Function;
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
  clearInputs: Function,
  getInputVariables: Function
) {
  form.input = {};
  form.uploadProgress = 0;
  form.submit = submit;
  form.isValid = isValid;
  form.clearInputs = clearInputs;
  form.getInputVariables = getInputVariables;
}

export default function useForm({
  inputElements,
  fetchFunction,
  additionalInputProps = {},
  isQuery = false,
  clearOnSubmit = true
}: Params) {
  const [previousVariables, setPreviousVariables] = useState(
    getQueryVariables(getDefaultVariables())
  );

  function isValid() {
    let isFormValid = true;

    Object.keys(form.input).forEach(input => {
      isFormValid = isFormValid && form.input[input].isValid();
    });

    return isFormValid;
  }

  function getDefaultVariables() {
    const defaultVariables: { [key: string]: any } = {};
    inputElements.forEach((input: InputElement) => {
      defaultVariables[input.id] = input.defaultValue;
    });

    return defaultVariables;
  }

  function getQueryVariables(inputVariables: object) {
    const input = {
      ...inputVariables,
      ...additionalInputProps
    };
    const variables = isQuery ? input : { variables: input };

    return variables;
  }

  function variablesAreDifferent(queryVariables: object) {
    return JSON.stringify(previousVariables) !== JSON.stringify(queryVariables);
  }

  function makeQuery(queryVariables: object) {
    if (variablesAreDifferent(queryVariables)) {
      fetchFunction(queryVariables);
      setPreviousVariables(queryVariables);
    }
  }

  function getInputVariables() {
    const mutationVariables: { [key: string]: any } = {};
    Object.keys(form.input).forEach(input => {
      mutationVariables[input] = form.input[input].value;

      if (clearOnSubmit) {
        clearInputs();
      }
    });

    return mutationVariables;
  }

  function submit() {
    if (form.isValid()) {
      const mutationVariables = getInputVariables();

      const queryVariables = getQueryVariables(mutationVariables);
      makeQuery(queryVariables);
    }
  }

  function clearInputs(submitOnClear = false) {
    Object.keys(form.input).forEach(input => {
      form.input[input].clear();
      form.input[input].clearError();
    });

    if (submitOnClear) {
      const defaultVariables = getDefaultVariables();
      const variables = getQueryVariables(defaultVariables);

      makeQuery(variables);
    }
  }

  initializeForm(submit, isValid, clearInputs, getInputVariables);

  inputElements.forEach(inputElement => {
    // eslint-disable-next-line
    const input = useInput(inputElement.defaultValue, inputElement.verifier);

    form.input[inputElement.id] = input;
  });

  return form as Form;
}
