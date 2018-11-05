import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Switch, Route } from "react-router-dom";
import GraphQLRoute from "./GraphQLRoute";
import HomePage from "./components/HomePage";
import NotFoundPage from "./components/NotFoundPage";

class App extends Component {
  render() {
    return (
      <Switch>
        <GraphQLRoute path="/" exact component={HomePage} />
        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

export default hot(module)(App);
