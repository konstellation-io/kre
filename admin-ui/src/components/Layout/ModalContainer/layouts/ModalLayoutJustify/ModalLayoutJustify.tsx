import React from 'react';
import TextInput from '../../../../Form/TextInput/TextInput';
import styles from './ModalLayoutJustify.module.scss';

type Props = {
  onUpdate: (value: string) => void;
  submit: () => void;
  error: string;
};
function ModalLayoutJustify({ onUpdate, submit, error }: Props) {
  return (
    <>
      <div className={styles.comment}>
        <TextInput
          label="why are you doing that?  "
          error={error}
          onChange={onUpdate}
          limits={{
            minWidth: 338,
            maxWidth: 338,
            minHeight: 105
          }}
          onEnterKeyPress={submit}
          whiteColor
          showClearButton
          textArea
          autoFocus
        />
      </div>
    </>
  );
}

export default ModalLayoutJustify;
