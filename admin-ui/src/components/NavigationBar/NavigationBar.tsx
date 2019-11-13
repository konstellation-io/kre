import React from 'react';
import { withRouter } from 'react-router';
import { History, Location } from 'history';

import DashboardIcon from '@material-ui/icons/ChangeHistory';
import SecurityIcon from '@material-ui/icons/VerifiedUser';

import * as ROUTE from '../../constants/routes';
import VerticalBar from '../Layout/VerticalBar/VerticalBar';
import SquaredButton from '../SquaredButton/SquaredButton';

export const navigationButtons = [
  {
    id: 'dashboardRoute',
    path: ROUTE.DASHBOARD,
    Icon: DashboardIcon
  },
  {
    id: 'settingsRoute',
    path: ROUTE.SETTINGS,
    Icon: SecurityIcon
  }
];

type Props = {
  history: History;
  location: Location;
};
function NavigationBar({ history, location }: Props) {
  const buttons = navigationButtons.map(button => (
    <SquaredButton
      {...button}
      key={`navigationButton_${button.id}`}
      active={location.pathname.startsWith(button.path)}
      onButtonClick={() =>
        history.push(button.path, { prevLocation: location.pathname })
      }
    />
  ));
  return <VerticalBar>{buttons}</VerticalBar>;
}

export default withRouter(NavigationBar);
