import React, { Component } from "react";
import { hot } from "react-hot-loader";
import "./HomePage.css";
import gql from "graphql-tag";
import logo from "../images/postgraphile.optimized.svg";

class HomePage extends Component {
  static QueryFragment = gql`
    fragment HomePage_QueryFragment on Query {
      nodeId
      currentUser {
        nodeId
      }
    }
  `;

  render() {
    const { data, loading, error } = this.props;
    const status = (() => {
      if (loading) return "Loading...";
      if (error) return `Error: ${error.message}`;
      if (data.currentUser) return "👋 Logged in";
      if (data.nodeId === "query") return "✅ Working";
      return "This should not happen";
    })();
    return (
      <div className="HomePage">
        <header className="HomePage-header">
          <img src={logo} className="HomePage-logo" alt="logo" />
          <h3>PostGraphile / React / Apollo bootstrap</h3>
          <p className="HomePage-p">
            Edit <code>src/components/HomePage.js</code> and save to hot-reload.
          </p>
          <p className="HomePage-p">GraphQL status check: {status}</p>
          <p className="HomePage-p">
            <a
              className="HomePage-link"
              href="/login/"
              rel="noopener noreferrer"
            >
              Log In
            </a>
            <br />
            <a
              className="HomePage-link"
              href="/graphiql"
              rel="noopener noreferrer"
            >
              View API in GraphiQL
            </a>
            <br />
            <br />
            <a
              className="HomePage-link"
              href="https://github.com/graphile/bootstrap-react-apollo/blob/master/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              View README for project structure
            </a>
            <br />
            <a
              className="HomePage-link"
              href="https://www.graphile.org/postgraphile/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn PostGraphile
            </a>
            <br />
          </p>
        </header>
      </div>
    );
  }
}

export default hot(module)(HomePage);
