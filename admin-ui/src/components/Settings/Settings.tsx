import { get } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import useEndpoint from '../../hooks/useEndpoint';
import { useApolloClient } from '@apollo/react-hooks';
import { ENDPOINT } from '../../constants/application';
import Button, { BUTTON_ALIGN } from '../Button/Button';
import SettingsIcon from '@material-ui/icons/VerifiedUser';
import AuditIcon from '@material-ui/icons/SupervisorAccount';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import cx from 'classnames';
import styles from './Settings.module.scss';
import ROUTE from '../../constants/routes';
import useClickOutsideListener from '../../hooks/useClickOutsideListener';
import useUserAccess from '../../hooks/useUserAccess';
import { AccessLevel } from '../../graphql/client/typeDefs';

const BUTTON_HEIGHT = 40;
const buttonStyle = {
  paddingLeft: '20%'
};

type Props = {
  label: string;
};

function Settings({ label }: Props) {
  const { accessLevel } = useUserAccess();
  const client = useApolloClient();
  const history = useHistory();
  const [opened, setOpened] = useState(false);
  const [logoutResponse, doLogout] = useEndpoint({
    endpoint: ENDPOINT.LOGOUT,
    method: 'POST'
  });
  const ref = useRef(null);
  useClickOutsideListener({ ref, onClickOutside: () => setOpened(false) });

  useEffect(() => {
    if (logoutResponse.complete) {
      if (get(logoutResponse, 'status') === 200) {
        client.writeData({ data: { loggedIn: false } });
        history.push(ROUTE.LOGIN);
      } else {
        console.error(`Error sending logout request.`);
      }
    }
  }, [logoutResponse, history, client]);

  function getBaseProps(label: string) {
    return {
      label: label.toUpperCase(),
      key: `button${label}`,
      align: BUTTON_ALIGN.LEFT,
      style: buttonStyle
    };
  }

  const settingsButton = (
    <Button
      {...getBaseProps('Settings')}
      to={ROUTE.SETTINGS}
      Icon={SettingsIcon}
    />
  );
  const auditButton = (
    <Button {...getBaseProps('Audit')} to={ROUTE.AUDIT} Icon={AuditIcon} />
  );
  const logoutButton = (
    <Button
      {...getBaseProps('Logout')}
      onClick={() => doLogout()}
      Icon={LogoutIcon}
    />
  );

  const buttons: JSX.Element[] = [];
  switch (accessLevel) {
    case AccessLevel.ADMINISTRATOR:
    case AccessLevel.MANAGER:
      buttons.push(settingsButton, auditButton);
    /* falls through */
    case AccessLevel.VIEWER:
    default:
      buttons.push(logoutButton);
  }

  const nButtons = buttons.length;
  const optionsHeight = nButtons * BUTTON_HEIGHT;

  return (
    <div
      className={cx(styles.container, { [styles['is-open']]: opened })}
      onClick={() => setOpened(!opened)}
      data-testid="settingsContainer"
      ref={ref}
    >
      <div className={styles.label} data-testid="settings-label">
        {label}
      </div>
      <div
        className={styles.options}
        style={{ maxHeight: opened ? optionsHeight : 0 }}
        data-testid="settingsContent"
      >
        {buttons}
      </div>
    </div>
  );
}

export default Settings;
