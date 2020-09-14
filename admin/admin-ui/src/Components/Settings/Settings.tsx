import { BUTTON_ALIGN, Button, useClickOutside } from 'kwc';
import React, { memo, useEffect, useRef, useState } from 'react';

import AuditIcon from '@material-ui/icons/EventNote';
import { ENDPOINT } from 'Constants/application';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import ROUTE from 'Constants/routes';
import SettingsIcon from '@material-ui/icons/VerifiedUser';
import UsersIcon from '@material-ui/icons/SupervisorAccount';
import { checkPermission } from '../../rbac-rules';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './Settings.module.scss';
import useEndpoint from 'Hooks/useEndpoint';
import { useHistory } from 'react-router';
import useLogin from 'Graphql/hooks/useLogin';
import useUserAccess from 'Hooks/useUserAccess';

const BUTTON_HEIGHT = 40;
const buttonStyle = {
  paddingLeft: '20%'
};

type Props = {
  label: string;
};

function Settings({ label }: Props) {
  const { logout } = useLogin();
  const { accessLevel } = useUserAccess();
  const history = useHistory();
  const [opened, setOpened] = useState(false);
  const [logoutResponse, doLogout] = useEndpoint({
    endpoint: ENDPOINT.LOGOUT,
    method: 'POST'
  });
  const settingsRef = useRef(null);
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: settingsRef,
    action: close
  });

  useEffect(() => {
    if (logoutResponse.complete) {
      if (get(logoutResponse, 'status') === 200) {
        logout();
        history.push(ROUTE.LOGIN);
      } else {
        console.error(`Error sending logout request.`);
      }
    }
  }, [logoutResponse, history, logout]);

  function close() {
    setOpened(false);
    removeClickOutsideEvents();
  }

  function open() {
    if (!opened) {
      setOpened(true);
      addClickOutsideEvents();
    }
  }

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
  const usersButton = (
    <Button {...getBaseProps('Users')} to={ROUTE.USERS} Icon={UsersIcon} />
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
  if (checkPermission(accessLevel, 'settings:edit')) {
    buttons.push(settingsButton);
  }
  if (checkPermission(accessLevel, 'users:edit')) {
    buttons.push(usersButton);
  }
  if (checkPermission(accessLevel, 'audit:view')) {
    buttons.push(auditButton);
  }
  buttons.push(logoutButton);

  const nButtons = buttons.length;
  const optionsHeight = nButtons * BUTTON_HEIGHT;

  return (
    <div
      className={cx(styles.container, { [styles['is-open']]: opened })}
      onClick={open}
      data-testid="settingsContainer"
    >
      <div className={styles.label} data-testid="settings-label">
        {label}
      </div>
      <div
        ref={settingsRef}
        className={styles.options}
        style={{ maxHeight: opened ? optionsHeight : 0 }}
        data-testid="settingsContent"
      >
        {buttons}
      </div>
    </div>
  );
}

export default memo(Settings);
