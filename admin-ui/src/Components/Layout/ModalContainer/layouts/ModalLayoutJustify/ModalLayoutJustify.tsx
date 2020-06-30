import React from 'react';
import TextInput from '../../../../Form/TextInput/TextInput';
import cx from 'classnames';
import styles from './ModalLayoutJustify.module.scss';

type Props = {
  onUpdate: (value: string) => void;
  submit: () => void;
  error: string;
  className?: string;
  label?: string;
};
function ModalLayoutJustify({
  onUpdate,
  submit,
  error,
  label = 'please, write your comment:  ',
  className = ''
}: Props) {
  return (
    <>
      <div className={cx(className, styles.comment)}>
        <TextInput
          label={label}
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
