import { get } from 'lodash';

import React, { useState, useRef } from 'react';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import Button from '../../Button/Button';

import cx from 'classnames';
import styles from './FileUpload.module.scss';

type Props = {
  onChange?: Function;
  placeholder?: string;
  label?: string;
  height?: number;
  error?: string;
};

function FileUpload({
  onChange = function() {},
  placeholder = '',
  label = '',
  height = 40,
  error = ''
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File>();
  const fileButton = useRef<HTMLInputElement>(null);

  function onFileUpload() {
    const fileButtonEl = fileButton.current;
    if (fileButtonEl !== null && fileButtonEl.files !== null) {
      const file = fileButtonEl.files[0];
      setSelectedFile(file);
      onChange(file);
    }
  }

  const inputText = get(selectedFile, 'name', placeholder);

  return (
    <div className={styles.container}>
      <InputLabel text={label} />
      <div className={styles.inputContainer}>
        <div
          className={cx(styles.input, {
            [styles.placeholder]: !selectedFile,
            [styles.error]: error !== ''
          })}
          style={{ height }}
          data-testid="input"
          title={inputText}
        >
          {inputText}
        </div>
        <Button
          label="BROWSE"
          onClick={() => {
            const submitButton = fileButton.current;
            if (submitButton !== null) {
              submitButton.click();
            }
          }}
          border
        />
      </div>
      <input type="file" ref={fileButton} onChange={onFileUpload} hidden />
      <InputError message={error} />
    </div>
  );
}

export default FileUpload;
