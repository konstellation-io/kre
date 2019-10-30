import React from 'react';
import { withRouter } from 'react-router';
import {ICON} from '../../icons';
import * as ROUTE from '../../constants/routes';
import VerticalBar from '../Layout/VerticalBar/VerticalBar';
import SquaredButton from '../SquaredButton/SquaredButton';

const navigationButtons = [
  {
    id: 'dashboardRoute',
    path: ROUTE.HOME,
    icon: ICON.SQUARE
  },
  {
    id: 'settingsRoute',
    path: ROUTE.SETTINGS,
    icon: ICON.SETTINGS
  },
];

type Props = {
  history?: any;
  location?: any;
};
function NavigationBar ({ history, location }:Props = {}) {
  const buttons = navigationButtons.map(button => (
    <SquaredButton
      {...button}
      key={`navigationButton_${button.id}`}
      active={location.pathname === button.path}
      onButtonClick={() => history.push(button.path)}
    />
  ));
  return (
    <VerticalBar>
      { buttons }
    </VerticalBar>
  );
}

export default withRouter(NavigationBar);
