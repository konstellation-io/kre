import React from 'react';
import TextInput from '../../../../Form/TextInput/TextInput';

import styles from './ModalLayoutJustify.module.scss';

type Props = {
  onUpdate: (value: string) => void;
  error: string;
};
function ModalLayoutJustify({ onUpdate, error }: Props) {
  return (
    <>
      <div className={styles.comment}>
        <TextInput
          label="please, write your comment:  "
          error={error}
          onChange={onUpdate}
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
    </>
  );
}

export default ModalLayoutJustify;
