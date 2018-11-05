import React, { Component } from "react";
import { hot } from "react-hot-loader";
import "./App.css";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import logo from "./images/postgraphile.optimized.svg";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h3>PostGraphile / React / Apollo bootstrap</h3>
          <p className="App-p">
            Edit <code>src/App.js</code> and save to hot-reload.
          </p>
          <p className="App-p">
            GraphQL status check:{" "}
            <Query
              query={gql`
                query PostGraphileConnectionQuery {
                  nodeId
                }
              `}
            >
              {({ data, loading, error }) => {
                if (loading) return "Loading...";
                if (error) return `Error: ${error.message}`;
                if (data.nodeId === "query") return "✅ Working";
                return "This should not happen";
              }}
            </Query>
          </p>
          <p className="App-p">
            <a className="App-link" href="/graphiql" rel="noopener noreferrer">
              View API in GraphiQL
            </a>
            <br />
            <a
              className="App-link"
              href="https://www.graphile.org/postgraphile/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn PostGraphile
            </a>
            <br />
            <a
              className="App-link"
              href="https://github.com/graphile/bootstrap-react-apollo/blob/master/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read README
            </a>
            <br />
          </p>
        </header>
      </div>
    );
  }
}

export default hot(module)(App);
