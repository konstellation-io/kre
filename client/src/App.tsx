import React from 'react';
import { isUserAuthenticated } from './utils/auth';
import { HashRouter as Router } from 'react-router-dom';
import Login from './pages/Login/Login';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import MagicLink from './pages/MagicLink/MagicLink';
import Dashboard from './pages/Dashboard/Dashboard';
import { Route, Redirect } from 'react-router';
import * as PAGES from './constants/routes';


function ProtectedRoute({ component: Component, ...params }: any) {
  return <Route
    {...params}
    render={
      props => isUserAuthenticated()
        ? <Component {...props} />
        : <Redirect to={ PAGES.LOGIN } />
    }
  />;
}

export function Routes() {
  return (
    <>
      <ProtectedRoute exact path={PAGES.HOME} component={Dashboard} />
      <Route exact path={PAGES.LOGIN} component={Login} />
      <Route exact path={PAGES.VERIFY_EMAIL} component={VerifyEmail} />
      <Route exact path={PAGES.MAGIC_LINK} component={MagicLink} />
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Router>
        <Routes />
      </Router>
    </div>
  );
}

export default App;
