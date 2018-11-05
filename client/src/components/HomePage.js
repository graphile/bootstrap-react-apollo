import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import gql from "graphql-tag";
import logo from "../images/postgraphile.optimized.svg";

export default class HomePage extends React.Component {
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
            <Link
              // This is an "Link" tag because we can go there without
              // reloading the page
              className="HomePage-link"
              to="/login/"
              rel="noopener noreferrer"
            >
              Log In
            </Link>
            <br />
            <a
              // This is an "a" tag because we want a full page reload,
              // GraphiQL is not embedded into our React app
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
