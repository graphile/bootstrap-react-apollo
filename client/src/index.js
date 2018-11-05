import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { makeClient } from "./apolloClient";

const client = makeClient();

const rootComponent = (
  <ApolloProvider client={client}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>
);

ReactDOM.render(rootComponent, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
