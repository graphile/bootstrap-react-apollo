import React from "react";
import PropTypes from "prop-types";
import { Redirect, Link } from "react-router-dom";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { queryGenFromComponent } from "../GraphQLRoute";
import HomePage from "./HomePage";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import Layout from "./Layout";
import "./form-table.css";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      user {
        nodeId
        username
      }
    }
  }
`;

export default class LoginPage extends React.Component {
  static QueryFragment = gql`
    fragment LoginPage_QueryFragment on Query {
      currentUser {
        nodeId
      }
    }
  `;

  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  state = {
    username: "",
    password: "",
    error: null,
    loggingIn: false,
  };

  handleUsernameChange = e => {
    this.setState({ username: e.target.value, error: null });
  };

  handlePasswordChange = e => {
    this.setState({ password: e.target.value, error: null });
  };

  handleSubmitWith = login => async e => {
    e.preventDefault();
    const { history } = this.props;
    const { username, password } = this.state;
    this.setState({ loggingIn: true });
    try {
      const { data } = await login({ variables: { username, password } });
      if (data.login && data.login.user) {
        this.setState({ loggingIn: false, error: null });
        history.push(this.getNext());
      } else {
        throw new Error("Login failed");
      }
    } catch (e) {
      this.setState({
        loggingIn: false,
        error: "Login failed",
      });
    }
  };

  getNext() {
    return "/";
  }

  render() {
    const { data, loading, error } = this.props;
    const { username, password, loggingIn } = this.state;
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
      <Layout>
        <h1>Log in</h1>
        <button onClick={() => (window.location = "/auth/github")}>
          Login with GitHub
        </button>
        <h3>Log in with email</h3>
        <Mutation
          mutation={LOGIN}
          update={(
            cache,
            {
              data: {
                login: { user },
              },
            }
          ) => {
            const query = queryGenFromComponent(HomePage);
            const cacheData = cache.readQuery({ query });
            const data = {
              ...cacheData,
              currentUser: user,
            };
            cache.writeQuery({ query, data });
          }}
        >
          {login => (
            <form onSubmit={this.handleSubmitWith(login)}>
              <table className="form-table">
                <tbody>
                  <tr>
                    <th>Username / email:</th>
                    <td>
                      <input
                        type="text"
                        value={username}
                        onChange={this.handleUsernameChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Password:</th>
                    <td>
                      <input
                        type="password"
                        value={password}
                        onChange={this.handlePasswordChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              {this.state.error ? <p>{this.state.error}</p> : null}
              <button
                type="submit"
                disabled={!username || !password || loggingIn}
              >
                Log in
              </button>
              <ul>
                <li>
                  <Link to="/register">Don't have an account? Create one</Link>
                </li>
                <li>
                  <Link to="/forgot-password">Forgot your password? Reset it</Link>
                </li>
              </ul>
            </form>
          )}
        </Mutation>
      </Layout>
    );
  }
}
