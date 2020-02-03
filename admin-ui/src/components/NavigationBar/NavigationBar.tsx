import React from 'react';
import { useLocation, useHistory } from 'react-router';

import DashboardIcon from '@material-ui/icons/ChangeHistory';
import SecurityIcon from '@material-ui/icons/VerifiedUser';
import AuditIcon from '@material-ui/icons/SupervisorAccount';

import ROUTE from '../../constants/routes';
import VerticalBar from '../Layout/VerticalBar/VerticalBar';
import SquaredButton from '../SquaredButton/SquaredButton';

export const navigationButtons = [
  {
    id: 'dashboardRoute',
    path: ROUTE.HOME,
    Icon: DashboardIcon
  },
  {
    id: 'settingsRoute',
    path: ROUTE.SETTINGS,
    Icon: SecurityIcon
  },
  {
    id: 'auditRoute',
    path: ROUTE.AUDIT,
    Icon: AuditIcon
  }
];

function NavigationBar() {
  const history = useHistory();
  const location = useLocation();

  const buttons = navigationButtons.map(button => (
    <SquaredButton
      {...button}
      key={`navigationButton_${button.id}`}
      active={location.pathname.startsWith(button.path)}
      onButtonClick={() => {
        history.push(button.path);
      }}
    />
  ));
  return <VerticalBar>{buttons}</VerticalBar>;
}

export default NavigationBar;
