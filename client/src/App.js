import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Switch, Route } from "react-router-dom";
import GraphQLRoute from "./GraphQLRoute";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import VerifyUserEmailPage from "./components/VerifyUserEmailPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import NotFoundPage from "./components/NotFoundPage";

class App extends Component {
  render() {
    return (
      <Switch>
        <GraphQLRoute path="/" exact component={HomePage} />
        <GraphQLRoute path="/login" exact component={LoginPage} />
        <GraphQLRoute path="/register" exact component={RegisterPage} />
        <GraphQLRoute
          path="/verify-email/:token"
          exact
          component={VerifyUserEmailPage}
        />
        <GraphQLRoute
          path="/forgot-password"
          exact
          component={ForgotPasswordPage}
        />
        <GraphQLRoute
          path="/reset-password/:userId(\d+)/:token"
          exact
          component={ResetPasswordPage}
        />

        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

export default hot(module)(App);
