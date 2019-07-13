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

const RESET_PASSWORD = gql`
  mutation ResetPassword(
    $userId: Int!
    $token: String!
    $newPassword: String!
  ) {
    resetPassword(
      input: { userId: $userId, token: $token, newPassword: $newPassword }
    ) {
      user {
        nodeId
        username
      }
    }
  }
`;

export default class ResetPasswordPage extends React.Component {
  static QueryFragment = gql`
    fragment ResetPasswordPage_QueryFragment on Query {
      currentUser {
        nodeId
      }
    }
  `;

  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  state = {
    newPassword: "",
    repeatNewPassword: "",
    error: null,
    settingPassword: false,
  };

  handleNewPasswordChange = e => {
    this.setState({ newPassword: e.target.value, error: null });
  };

  handleRepeatNewPasswordChange = e => {
    this.setState({ repeatNewPassword: e.target.value, error: null });
  };

  handleSubmitWith = resetPassword => async e => {
    e.preventDefault();
    const { history, match } = this.props;
    const { newPassword } = this.state;
    const { userId, token } = match.params;
    this.setState({ settingPassword: true });
    try {
      const { data } = await resetPassword({
        variables: { userId: parseInt(userId), token, newPassword },
      });
      if (data.resetPassword && data.resetPassword.user) {
        this.setState({ settingPassword: false, error: null });
        history.push(this.getNext());
      } else {
        throw new Error("Password reset failed");
      }
    } catch (e) {
      this.setState({
        settingPassword: false,
        error: "Password reset failed",
      });
    }
  };

  getNext() {
    return "/";
  }

  render() {
    const { loading, error } = this.props;
    const { newPassword, repeatNewPassword, settingPassword } = this.state;
    if (loading) return <LoadingPage />;
    if (error) {
      return (
        <ErrorPage>
          We failed talking to the server. Please reload the page.
        </ErrorPage>
      );
    }
    const mismatchedPasswords = newPassword !== repeatNewPassword;
    return (
      <Layout>
        <h1>Reset Password</h1>
        <Mutation mutation={RESET_PASSWORD}>
          {resetPassword => (
            <form onSubmit={this.handleSubmitWith(resetPassword)}>
              <table className="form-table">
                <tbody>
                  <tr>
                    <th>New password:</th>
                    <td>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={this.handleNewPasswordChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Repeat new password:</th>
                    <td>
                      <input
                        type="password"
                        value={repeatNewPassword}
                        onChange={this.handleRepeatNewPasswordChange}
                      />
                      {mismatchedPasswords && (
                        <span className="error">Passwords must match</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {this.state.error ? <p>{this.state.error}</p> : null}
              <button
                type="submit"
                disabled={
                  !newPassword ||
                  !repeatNewPassword ||
                  mismatchedPasswords ||
                  settingPassword
                }
              >
                Set Password
              </button>
              <Link to="/register">Don't have an account? Create one</Link>
            </form>
          )}
        </Mutation>
      </Layout>
    );
  }
}
