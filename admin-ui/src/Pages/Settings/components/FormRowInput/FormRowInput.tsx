import React, { MouseEvent, useEffect } from 'react';

import Button from 'Components/Button/Button';
import TextInput from 'Components/Form/TextInput/TextInput';
import { get } from 'lodash';
import styles from './FormRowInput.module.scss';
import { useForm } from 'react-hook-form';

type Props = {
  Icon: any;
  field: string;
  inputLabel: string;
  buttonLabel: string;
  valueValidator: Function;
  onAction: (e: MouseEvent<HTMLDivElement>) => void;
};
function FormRowInput({
  Icon,
  field,
  inputLabel,
  buttonLabel,
  valueValidator,
  onAction
}: Props) {
  const { handleSubmit, setValue, register, errors, watch } = useForm();

  useEffect(() => {
    register('item', {
      validate: value => valueValidator(value)
    });
    setValue('item', '');
  }, [register, setValue, valueValidator]);

  function handleOnSubmit(formData: any) {
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
          error={get(errors.item, 'message')}
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
