import React from 'react';
import { withRouter } from 'react-router';
import { History, Location} from 'history';

import {ICON} from '../../icons';

import * as ROUTE from '../../constants/routes';
import VerticalBar from '../Layout/VerticalBar/VerticalBar';
import SquaredButton from '../SquaredButton/SquaredButton';


export const navigationButtons = [
  {
    id: 'dashboardRoute',
    path: ROUTE.DASHBOARD,
    icon: ICON.SQUARE
  },
  {
    id: 'settingsRoute',
    path: ROUTE.SETTINGS,
    icon: ICON.SETTINGS
  },
];

type Props = {
  history: History;
  location: Location;
};
function NavigationBar ({ history, location }: Props) {
  const buttons = navigationButtons.map(button => (
    <SquaredButton
      {...button}
      key={`navigationButton_${button.id}`}
      active={location.pathname.startsWith(button.path)}
      onButtonClick={() => history.push(button.path, { prevLocation: location.pathname })}
    />
  ));
  return (
    <VerticalBar>
      { buttons }
    </VerticalBar>
  );
}

export default withRouter(NavigationBar);
