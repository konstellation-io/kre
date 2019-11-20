import React from 'react';
import cx from 'classnames';
import styles from './UploadProgress.module.scss';

type Props = {
  fileName: string;
  progress: number;
};

function UploadProgress({ fileName, progress }: Props) {
  const fileUploaded = progress === 100;

  return (
    <>
      <div className={styles.header}>
        <span>PROGRESS</span>
        <span className={cx(styles.uploaded, { [styles.show]: fileUploaded })}>
          UPLOADED
        </span>
      </div>
      <div className={styles.progressContainer}>
        <div className={styles.progress} style={{ width: `${progress}%` }} />
      </div>
      <div className={cx(styles.ack, { [styles.show]: fileUploaded })}>
        {`The file "${fileName}" its ok, have no errors.`}
      </div>
    </>
  );
}

export default UploadProgress;
