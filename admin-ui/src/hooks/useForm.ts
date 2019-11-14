import useInput, { InputHookElement } from './useInput';

type InputElement = {
  defaultValue: any;
  verifier: Function;
  id: string;
};

export default function useForm(inputElements: InputElement[]) {
  const form: { [key: string]: InputHookElement } = {};

  inputElements.forEach(inputElement => {
    // eslint-disable-next-line
    const input = useInput(inputElement.defaultValue, inputElement.verifier);

    form[inputElement.id] = input;
  });

  return form;
}
