import React from 'react';
import useInput from '../../hooks/useInput';

import HorizontalBar from '../Layout/HorizontalBar/HorizontalBar';
import TextInput from '../../components/Form/TextInput/TextInput';
import * as CHECK from '../../components/Form/check';
import Button from '../Button/Button';

import styles from './ConfirmationModal.module.scss';

function verifyComment(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value)
  ]);
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
  const { value, isValid, onChange, error } = useInput('', verifyComment);

  function onSubmit() {
    if (isValid()) {
      onAction(value);
    }
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
            error={error}
            onChange={onChange}
            onSubmit={onSubmit}
            limits={{
              minWidth: 338,
              maxWidth: 338,
              minHeight: 105
            }}
            whiteColor
            showClearButton
            textArea
          />
        </div>
        <HorizontalBar>
          <Button
            primary
            label={'YES'}
            onClick={onSubmit}
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
