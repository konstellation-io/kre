import React from 'react';
import { Router } from 'react-router-dom';
import { Route, Redirect } from 'react-router';
import history from './history';
import * as PAGES from './constants/routes';

import Login from './pages/Login/Login';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import MagicLink from './pages/MagicLink/MagicLink';
import Dashboard from './pages/Dashboard/Dashboard';
import Runtime from './pages/Runtime/Runtime';
import Settings from './pages/Settings/Settings';
import AddRuntime from './pages/AddRuntime/AddRuntime';

function Redirection({ from, to }: any) {
  return (
    <Route exact path={from}>
      <Redirect to={to} />
    </Route>
  );
}

export function Routes() {
  return (
    <>
      <Redirection from={PAGES.HOME} to={PAGES.DASHBOARD} />
      <Redirection from={PAGES.SETTINGS} to={PAGES.SETTINGS_GENERAL} />

      <Route exact path={PAGES.LOGIN} component={Login} />
      <Route exact path={PAGES.VERIFY_EMAIL} component={VerifyEmail} />
      <Route exact path={PAGES.MAGIC_LINK} component={MagicLink} />

      <Route exact path={PAGES.DASHBOARD} component={Dashboard} />
      <Route path={PAGES.RUNTIME} component={Runtime} />
      <Route path={PAGES.SETTINGS} component={Settings} />
      <Route path={PAGES.NEW_RUNTIME} component={AddRuntime} />
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Router history={history}>
        <Routes />
      </Router>
    </div>
  );
}

export default App;
