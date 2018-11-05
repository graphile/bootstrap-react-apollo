import React, { Component } from "react";
import { hot } from "react-hot-loader";
import HomePage from "./components/HomePage";

class App extends Component {
  render() {
    return <HomePage />;
  }
}

export default hot(module)(App);
