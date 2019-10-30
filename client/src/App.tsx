import React from 'react';
import { isUserAuthenticated } from './utils/auth';
import { HashRouter as Router } from 'react-router-dom';
import Login from './pages/Login/Login';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import MagicLink from './pages/MagicLink/MagicLink';
import Dashboard from './pages/Dashboard/Dashboard';
import Settings from './pages/Settings/Settings';
import Header from './components/Header/Header';
import { Route, Redirect } from 'react-router';
import './icons';
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
      <ProtectedRoute exact path={PAGES.SETTINGS} component={Settings} />
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Router>
        <Header />
        <Routes />
      </Router>
    </div>
  );
}

export default App;
