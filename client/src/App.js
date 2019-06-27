import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Switch, Route } from "react-router-dom";
import gql from "graphql-tag";
import GraphQLRoute from "./GraphQLRoute";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import VerifyUserEmailPage from "./components/VerifyUserEmailPage";
import NotFoundPage from "./components/NotFoundPage";

class App extends Component {
  render() {
    return (
      <Switch>
        <GraphQLRoute path="/" exact component={HomePage} />
        <GraphQLRoute path="/login" exact component={LoginPage} />
        <GraphQLRoute path="/register" exact component={RegisterPage} />
        <GraphQLRoute path="/verify-email/:token" exact component={VerifyUserEmailPage} />

        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

export default hot(module)(App);
