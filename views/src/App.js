import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './Main';
import SignIn from './users/pages/SignIn';

const App = () => {
  return (
      <Router>
          <Switch>
            <Route path="/signin" component={SignIn} />
            <Route path="/" component={() => <Main authorized={localStorage.getItem('logged_in_token') ? true : false} />} />
          </Switch>
      </Router>
  );
};

export default App;
