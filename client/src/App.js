import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Switch, Route } from "react-router-dom";
import gql from "graphql-tag";
import GraphQLRoute from "./GraphQLRoute";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import NotFoundPage from "./components/NotFoundPage";

class App extends Component {
  render() {
    return (
      <Switch>
        <GraphQLRoute path="/" exact component={HomePage}>{gql`
          query HomePageRoute {
            ...HomePage_QueryFragment
          }
          ${HomePage.QueryFragment}
        `}</GraphQLRoute>

        <GraphQLRoute path="/login" exact component={LoginPage}>{gql`
          query LoginPageRoute {
            ...LoginPage_QueryFragment
          }
          ${LoginPage.QueryFragment}
        `}</GraphQLRoute>

        <GraphQLRoute path="/register" exact component={RegisterPage}>{gql`
          query RegisterPageRoute {
            ...RegisterPage_QueryFragment
          }
          ${RegisterPage.QueryFragment}
        `}</GraphQLRoute>

        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

export default hot(module)(App);
