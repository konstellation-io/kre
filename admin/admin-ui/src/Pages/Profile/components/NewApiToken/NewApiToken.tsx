import { Slide, ToastContainer, toast } from 'react-toastify';
import Tag, { TagTypes } from 'Components/Tag/Tag';

import { Button } from 'kwc';
import CopyIcon from '@material-ui/icons/FileCopy';
import React from 'react';
import { copyToClipboard } from 'Utils/clipboard';
import styles from './NewApiToken.module.scss';

type Props = {
  token: string;
};
function NewApiToken({ token }: Props) {
  function onCopy() {
    copyToClipboard(token);

    toast.info('Copied to clipboard');
    toast.clearWaitingQueue();
  }
  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>
          A new API Token has been successfuly generated.
        </p>
        <div className={styles.token}>
          <div className={styles.tokenValue}>{token}</div>
          <Button
            label="COPY"
            Icon={CopyIcon}
            onClick={onCopy}
            className={styles.button}
          />
        </div>
        <div className={styles.warning}>
          <Tag type={TagTypes.WARNING}>WARNING</Tag> API Token cannot be
          accessed after it has been generated, remember to store the token as
          soon as it is generated.
        </div>
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        closeButton={false}
        transition={Slide}
        limit={1}
      />
    </>
  );
}

export default NewApiToken;
