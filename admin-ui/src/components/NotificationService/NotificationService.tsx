import React from 'react';
import RuntimeCreated from './Services/RuntimeCreated/RuntimeCreated';

import { connect } from 'react-redux';
import { AppState } from '../../reducers/appReducer';

import styles from './Notification.module.scss';

type Props = {
  loggedIn: boolean;
};

function NotificationService({ loggedIn }: Props) {
  let notificationServices: any = [];

  if (loggedIn) {
    notificationServices = [<RuntimeCreated key="createRuntimeService" />];
  }

  return (
    <div className={styles.notificationsContainer}>{notificationServices}</div>
  );
}

const mapStateToProps = (state: { app: AppState }) => ({
  loggedIn: state.app.loggedIn
});

export default connect(mapStateToProps)(NotificationService);
