import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import './styles/react-calendar.scss';
import './styles/app.global.scss';
import 'markdown-navbar/dist/navbar.css';
import './styles/markdown-navbar.scss';

import React from 'react';
import { Router, Route } from 'react-router-dom';
import { Redirect, Switch, useHistory } from 'react-router';
import history from './history';

import SpinnerCircular from './components/LoadingComponents/SpinnerCircular/SpinnerCircular';
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

import { loader } from 'graphql.macro';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { GetUserEmail } from './graphql/queries/types/GetUserEmail';
import Logs from './pages/Version/pages/Status/Logs/Logs';

const GetUserEmailQuery = loader('./graphql/queries/getUserEmail.graphql');

function ProtectedRoutes() {
  const { data, error, loading } = useQuery<GetUserEmail>(GetUserEmailQuery);
  const client = useApolloClient();
  const history = useHistory();

  if (loading) {
    return (
      <div className="splash">
        <SpinnerCircular />
      </div>
    );
  }
  if (error) {
    history.push(ROUTE.LOGIN);
  }

  // Checks if the user is logged in
  if (data && data.me) {
    client.writeData({ data: { loggedIn: true } });
  }

  return (
    <>
      <div className="page-with-logs-wrapper">
        <Switch>
          <Redirect exact from={ROUTE.SETTINGS} to={ROUTE.SETTINGS_GENERAL} />
          <Redirect
            exact
            from={ROUTE.RUNTIME_VERSION}
            to={ROUTE.RUNTIME_VERSION_STATUS}
          />
          <Redirect exact from={ROUTE.RUNTIME} to={ROUTE.RUNTIME_VERSIONS} />

          <Route path={ROUTE.NEW_RUNTIME} component={AddRuntime} />
          <Route path={ROUTE.NEW_VERSION} component={AddVersion} />

          <Route exact path={ROUTE.HOME} component={Dashboard} />
          <Route
            path={[
              ROUTE.RUNTIME_VERSION_CONFIGURATION,
              ROUTE.RUNTIME_VERSION_METRICS,
              ROUTE.RUNTIME_VERSION_DOCUMENTATION,
              ROUTE.RUNTIME_VERSION_STATUS
            ]}
            component={Runtime}
          />
          <Route path={ROUTE.RUNTIME_VERSIONS} component={Runtime} />

          <Route path={ROUTE.SETTINGS} component={Settings} />
          <Route path={ROUTE.AUDIT} component={UsersActivity} />
          <Route component={NotFound} />
        </Switch>
        <Logs />
      </div>
    </>
  );
}

export function Routes() {
  return (
    <Switch>
      <Route exact path={ROUTE.LOGIN} component={Login} />
      <Route exact path={ROUTE.VERIFY_EMAIL} component={VerifyEmail} />
      <Route exact path={ROUTE.MAGIC_LINK} component={MagicLink} />

      <Route component={ProtectedRoutes} />
    </Switch>
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
