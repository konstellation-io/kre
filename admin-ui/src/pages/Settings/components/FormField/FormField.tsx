import React, { MouseEvent, ReactElement } from 'react';
import styles from './FormField.module.scss';
import TextInput from '../../../../components/Form/TextInput/TextInput';
import Button from '../../../../components/Button/Button';

type FormFieldProps = {
  fieldName: string;
  value?: string;
  error: string;
  onChange: Function;
  onSubmit: (e: MouseEvent<HTMLDivElement>) => void;
  icon: ReactElement;
};

function FormField({
  fieldName,
  value,
  error,
  onChange,
  onSubmit,
  icon
}: FormFieldProps) {
  return (
    <div className={styles.formField}>
      {icon}
      <p className={styles.label}>{fieldName} whitelist</p>
      <div className={styles.input}>
        <TextInput
          whiteColor
          label={fieldName}
          error={error}
          onChange={onChange}
          onEnterKeyPress={onSubmit}
          formValue={value}
        />
      </div>
      <div className={styles.button}>
        <Button
          label={`ADD ${fieldName.toUpperCase()}`}
          onClick={onSubmit}
          border
        />
      </div>
    </div>
  );
}

export default FormField;
