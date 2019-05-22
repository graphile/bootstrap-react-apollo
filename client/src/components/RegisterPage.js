import React from "react";
import { Redirect, Link } from "react-router-dom";
import gql from "graphql-tag";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";

export default class RegisterPage extends React.Component {
  static QueryFragment = gql`
    fragment RegisterPage_QueryFragment on Query {
      currentUser {
        nodeId
      }
    }
  `;

  getNext() {
    return "/";
  }

  render() {
    const { data, loading, error } = this.props;
    if (loading) return <LoadingPage />;
    if (error) {
      return (
        <ErrorPage>
          We failed talking to the server. Please reload the page.
        </ErrorPage>
      );
    }
    if (data.currentUser) {
      return <Redirect to={this.getNext()} />;
    }
    return (
      <div>
        <h3>Register</h3>
        <Link to="/login">Already have an account? Log in</Link>
        <p>
        <button onClick={() => (window.location = "/auth/github")}>
          Login with GitHub
        </button>
      </p>
      </div>
    );
  }
}
