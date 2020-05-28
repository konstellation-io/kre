import React, { useEffect } from 'react';
import { get } from 'lodash';
import HorizontalBar from '../Layout/HorizontalBar/HorizontalBar';
import TextInput from '../../components/Form/TextInput/TextInput';
import * as CHECK from '../../components/Form/check';
import Button from '../Button/Button';
import { useForm } from 'react-hook-form';

import styles from './ConfirmationModal.module.scss';

function verifyComment(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}

type Props = {
  title: string;
  message: string;
  onAction?: Function;
  onClose?: Function;
};

function ConfirmationModal({
  title,
  message,
  onClose = function() {},
  onAction = function() {}
}: Props) {
  const { handleSubmit, setValue, register, errors } = useForm();
  useEffect(() => {
    register('comment', { validate: verifyComment });
    setValue('comment', '');
  }, [register, setValue]);

  function onSubmit(formData: any) {
    onAction(formData.comment);
  }

  function onCancelClick() {
    onClose();
  }

  return (
    <>
      <div className={styles.bg} />
      <div className={styles.container}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.comment}>
          <TextInput
            label="please, write your comment:  "
            error={get(errors.comment, 'message')}
            onChange={(value: string) => setValue('comment', value)}
            onEnterKeyPress={handleSubmit(onSubmit)}
            limits={{
              minWidth: 338,
              maxWidth: 338,
              minHeight: 105
            }}
            whiteColor
            showClearButton
            textArea
            autoFocus
          />
        </div>
        <HorizontalBar>
          <Button
            primary
            label={'YES'}
            onClick={handleSubmit(onSubmit)}
            height={30}
            style={{ width: '122px', padding: '0 0' }}
          />
          <Button
            label={'CANCEL'}
            onClick={onCancelClick}
            height={30}
            style={{ width: '122px', padding: '0 0' }}
          />
        </HorizontalBar>
      </div>
    </>
  );
}

export default ConfirmationModal;
