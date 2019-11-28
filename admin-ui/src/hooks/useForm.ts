import useInput, { InputHookElement } from './useInput';
import { useMutation } from '@apollo/react-hooks';
import { DocumentNode } from 'graphql';
import { ApolloError } from 'apollo-client';

type InputElement = {
  defaultValue: any;
  verifier: Function;
  id: string;
};

export default function useForm(
  inputElements: InputElement[],
  query: DocumentNode,
  onCompleted: (data: any) => void,
  additionalInputProps?: object
) {
  const [makeMutation, { loading, error }] = useMutation(query, {
    onCompleted
  });

  function isValid() {
    let isFormValid = true;

    Object.keys(form.input).forEach(input => {
      isFormValid = isFormValid && form.input[input].isValid();
    });

    return isFormValid;
  }
  function submit() {
    const mutationVariables: { [key: string]: any } = {};
    Object.keys(form.input).forEach(input => {
      mutationVariables[input] = form.input[input].value;
    });

    makeMutation({
      variables: {
        input: {
          ...mutationVariables,
          ...additionalInputProps
        }
      }
    });
  }

  const form: {
    input: { [key: string]: InputHookElement };
    submit: Function;
    uploadProgress: number;
    isValid: Function;
    loading?: boolean;
    error?: ApolloError | undefined;
  } = {
    input: {},
    uploadProgress: 0,
    submit,
    loading,
    error,
    isValid
  };

  inputElements.forEach(inputElement => {
    // eslint-disable-next-line
    const input = useInput(inputElement.defaultValue, inputElement.verifier);

    form.input[inputElement.id] = input;
  });

  return form;
}
