import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Login from './pages/Login/Login';
import { Route } from 'react-router';
import * as PAGES from './constants/routes';

function App() {
  return (
    <div className="app">
      <Router>
        <Route exact path={PAGES.HOME} component={Login} />
      </Router>
    </div>
  );
}

export default App;
