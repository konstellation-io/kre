import { get } from 'lodash';
import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router';
import Button, { BUTTON_TYPES, BUTTON_ALIGN } from '../Button/Button';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import useEndpoint from '../../hooks/useEndpoint';
import * as PAGES from '../../constants/routes';
import { ENDPOINT } from '../../constants/application';

import { connect } from 'react-redux';
import { logout } from '../../actions/appActions';

import styles from './Settings.module.scss';

const BUTTON_HEIGHT = 40;
const buttonStyle = {
  paddingLeft: '20%'
};

type Props = {
  label: string;
  reduxLogout: Function;
};

function Settings({ label, reduxLogout }: Props) {
  const history = useHistory();
  const [opened, setOpened] = useState(false);
  const [logoutResponse, logout] = useEndpoint({
    endpoint: ENDPOINT.LOGOUT,
    method: 'POST'
  });

  useEffect(() => {
    if (logoutResponse.complete) {
      if (get(logoutResponse, 'status') === 200) {
        reduxLogout();
        history.push(PAGES.LOGIN);
      } else {
        console.error(`Error sending logout request.`);
      }
    }
  }, [logoutResponse, history, reduxLogout]);

  const buttons = [
    <Button
      label={'LOGOUT'}
      type={BUTTON_TYPES.GREY}
      onClick={() => logout()}
      Icon={LogoutIcon}
      align={BUTTON_ALIGN.LEFT}
      style={buttonStyle}
      key={'buttonLogout'}
    />
  ];
  const nButtons = buttons.length;
  const optionsHeight = nButtons * BUTTON_HEIGHT;

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setOpened(true)}
      onMouseLeave={() => setOpened(false)}
      data-testid="settingsContainer"
    >
      <div className={styles.label}>
        {label}
        <div className={styles.arrow} />
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

const mapDispatchToProps = {
  reduxLogout: logout
};

export default connect(null, mapDispatchToProps)(Settings);
