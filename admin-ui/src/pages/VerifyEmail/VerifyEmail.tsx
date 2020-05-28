import React from 'react';

import Circle from '../../components/Shape/Circle/Circle';
import EmailIcon from '@material-ui/icons/Email';
import { STATES } from '../../constants/application';

import styles from './VerifyEmail.module.scss';
import cx from 'classnames';

function VerifyEmail() {
  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Check your email</h1>
          <Circle animation={STATES.SUCCESS} label="DONE">
            <EmailIcon className={cx(styles.emailIcon, 'icon-huge')} />
          </Circle>
          <p className={styles.subtitle}>
            Please, check your email inbox and open the login link included.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
