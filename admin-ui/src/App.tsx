import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import './styles/react-calendar.scss';

import React from 'react';
import { Router, Route } from 'react-router-dom';
import { Redirect, Switch } from 'react-router';
import history from './history';

import NotificationService from './components/NotificationService/NotificationService';
import Login from './pages/Login/Login';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import MagicLink from './pages/MagicLink/MagicLink';
import Dashboard from './pages/Dashboard/Dashboard';
import Runtime from './pages/Runtime/Runtime';
import Settings from './pages/Settings/Settings';
import UsersActivity from './pages/UsersActivity/UsersActivity';
import AddRuntime from './pages/AddRuntime/AddRuntime';
import AddVersion from './pages/AddVersion/AddVersion';
import NotFound from './pages/NotFound/NotFound';
import ROUTE from './constants/routes';
import Versions from './pages/Versions/Versions';

export function Routes() {
  return (
    <>
      <Switch>
        <Redirect exact from={ROUTE.SETTINGS} to={ROUTE.SETTINGS_GENERAL} />
        <Redirect
          exact
          from={ROUTE.RUNTIME_VERSION}
          to={ROUTE.RUNTIME_VERSION_STATUS}
        />
        <Redirect exact from={ROUTE.RUNTIME} to={ROUTE.RUNTIME_VERSIONS} />

        <Route exact path={ROUTE.LOGIN} component={Login} />
        <Route exact path={ROUTE.VERIFY_EMAIL} component={VerifyEmail} />
        <Route exact path={ROUTE.MAGIC_LINK} component={MagicLink} />

        <Route path={ROUTE.NEW_RUNTIME} component={AddRuntime} />
        <Route path={ROUTE.NEW_VERSION} component={AddVersion} />

        <Route exact path={ROUTE.HOME} component={Dashboard} />
        <Route exact path={ROUTE.RUNTIME_VERSIONS} component={Versions} />
        <Route path={ROUTE.RUNTIME_VERSION} component={Runtime} />

        <Route path={ROUTE.SETTINGS} component={Settings} />
        <Route path={ROUTE.AUDIT} component={UsersActivity} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Router history={history}>
        <NotificationService />
        <Routes />
      </Router>
    </div>
  );
}

export default App;
