import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import 'Styles/react-calendar.scss';
import 'Styles/app.global.scss';
import 'markdown-navbar/dist/navbar.css';
import 'react-tabs/style/react-tabs.css';
import 'Styles/markdown-navbar.scss';
import 'Styles/react-tabs.scss';

import { Redirect, Switch } from 'react-router';
import { Route, Router } from 'react-router-dom';
import { useApolloClient, useQuery } from '@apollo/react-hooks';

import AccessDenied from 'Pages/AccessDenied/AccessDenied';
import AddRuntime from 'Pages/AddRuntime/AddRuntime';
import AddUser from 'Pages/AddUser/AddUser';
import AddVersion from 'Pages/AddVersion/AddVersion';
import Dashboard from 'Pages/Dashboard/Dashboard';
import ErrorMessage from 'Components/ErrorMessage/ErrorMessage';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { GlobalHotKeys } from 'react-hotkeys';
import Login from 'Pages/Login/Login';
import Logs from 'Pages/Logs/Logs';
import LogsPanel from 'Pages/Version/pages/Status/LogsPanel/LogsPanel';
import MagicLink from 'Pages/MagicLink/MagicLink';
import NotFound from 'Pages/NotFound/NotFound';
import NotificationService from 'Components/NotificationService/NotificationService';
import ROUTE from 'Constants/routes';
import React from 'react';
import Runtime from 'Pages/Runtime/Runtime';
import Settings from 'Pages/Settings/Settings';
import SpinnerCircular from 'Components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import UsersActivity from 'Pages/UsersActivity/UsersActivity';
import VerifyEmail from 'Pages/VerifyEmail/VerifyEmail';
import { getNotAllowedRoutes } from './accessLevelRoutes';
import history from './browserHistory';
import keymaps from './keymaps';
import { loader } from 'graphql.macro';

const GetMeQuery = loader('./Graphql/queries/getMe.graphql');

function ProtectedRoutes() {
  const { data, error, loading } = useQuery<GetMe>(GetMeQuery);
  const client = useApolloClient();

  if (loading) {
    return (
      <div className="splash">
        <SpinnerCircular />
      </div>
    );
  }

  if (error || !data || !data.me) {
    return <ErrorMessage />;
  }

  client.writeData({ data: { loggedIn: true } });
  const protectedRoutes: string[] = getNotAllowedRoutes(data.me.accessLevel);

  return (
    <>
      <div className="page-with-logs-wrapper">
        <Switch>
          <Route path={protectedRoutes} component={AccessDenied} />
          <Redirect exact from={ROUTE.SETTINGS} to={ROUTE.SETTINGS_GENERAL} />
          <Redirect
            exact
            from={ROUTE.RUNTIME_VERSION}
            to={ROUTE.RUNTIME_VERSION_STATUS}
          />
          <Redirect exact from={ROUTE.RUNTIME} to={ROUTE.RUNTIME_VERSIONS} />

          <Route path={ROUTE.NEW_RUNTIME} component={AddRuntime} />
          <Route path={ROUTE.NEW_USER} component={AddUser} />
          <Route path={ROUTE.NEW_VERSION} component={AddVersion} />

          <Route exact path={ROUTE.HOME} component={Dashboard} />
          <Route exact path={ROUTE.LOGS} component={Logs} />
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
        <LogsPanel />
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
  const client = useApolloClient();

  function openLogs() {
    client.writeData({ data: { logsOpened: true } });
  }

  function closeLogs() {
    client.writeData({ data: { logsOpened: false } });
  }

  const handlers = {
    CLOSE_LOGS: closeLogs,
    OPEN_LOGS: openLogs
  };

  return (
    <GlobalHotKeys keyMap={keymaps} handlers={handlers}>
      <div className="app">
        <Router history={history}>
          <NotificationService />
          <Routes />
        </Router>
      </div>
      <div id="chartjs-tooltip">
        <table />
      </div>
    </GlobalHotKeys>
  );
}

export default App;
