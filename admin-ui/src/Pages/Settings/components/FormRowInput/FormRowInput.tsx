import React, { useEffect } from 'react';

import Button from 'Components/Button/Button';
import TextInput from 'Components/Form/TextInput/TextInput';
import { get } from 'lodash';
import styles from './FormRowInput.module.scss';
import { useForm } from 'react-hook-form';

export type FormData = {
  item: string;
};

type Props = {
  Icon: any;
  field: string;
  inputLabel: string;
  buttonLabel: string;
  valueValidator: Function;
  onAction: (formData: FormData) => void;
};
function FormRowInput({
  Icon,
  field,
  inputLabel,
  buttonLabel,
  valueValidator,
  onAction
}: Props) {
  const {
    handleSubmit,
    setValue,
    unregister,
    register,
    errors,
    watch
  } = useForm<FormData>({
    defaultValues: {
      item: ''
    }
  });

  useEffect(() => {
    register('item', {
      validate: value => valueValidator(value)
    });

    return () => unregister('item');
  }, [register, unregister, setValue, valueValidator]);

  function handleOnSubmit(formData: FormData) {
    onAction(formData);
    setValue('item', '');
  }

  return (
    <div className={styles.container}>
      <Icon className="icon-regular" />
      <div className={styles.field}>{field}</div>
      <div className={styles.input}>
        <TextInput
          whiteColor
          label={inputLabel}
          onEnterKeyPress={handleSubmit(handleOnSubmit)}
          error={get(errors.item, 'message') as string}
          onChange={(value: string) => setValue('item', value)}
          formValue={watch('item', '')}
        />
      </div>
      <div className={styles.button}>
        <Button
          border
          label={buttonLabel}
          onClick={handleSubmit(handleOnSubmit)}
        />
      </div>
    </div>
  );
}

export default FormRowInput;
