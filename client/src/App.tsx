import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Login from './pages/Login/Login';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import MagicLink from './pages/MagicLink/MagicLink';
import { Route } from 'react-router';
import * as PAGES from './constants/routes';

function App() {
  return (
    <div className="app">
      <Router>
        <Route exact path={PAGES.HOME} component={Login} />
        <Route exact path={PAGES.VERIFY_EMAIL} component={VerifyEmail} />
        <Route exact path={PAGES.MAGIC_LINK} component={MagicLink} />
      </Router>
    </div>
  );
}

export default App;
