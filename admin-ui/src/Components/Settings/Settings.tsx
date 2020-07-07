import Button, { BUTTON_ALIGN } from '../Button/Button';
import React, { memo, useEffect, useRef, useState } from 'react';

import AuditIcon from '@material-ui/icons/SupervisorAccount';
import { ENDPOINT } from 'Constants/application';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import ROUTE from 'Constants/routes';
import SettingsIcon from '@material-ui/icons/VerifiedUser';
import { checkPermission } from '../../rbac-rules';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './Settings.module.scss';
import { useApolloClient } from '@apollo/react-hooks';
import useClickOutside from 'Hooks/useClickOutside';
import useEndpoint from 'Hooks/useEndpoint';
import { useHistory } from 'react-router';
import useUserAccess from 'Hooks/useUserAccess';

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
  const settingsRef = useRef(null);
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: settingsRef,
    action: close
  });

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
