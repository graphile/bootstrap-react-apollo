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

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(input: { email: $email }) {
      success
    }
  }
`;

export default class ForgotPasswordPage extends React.Component {
  static QueryFragment = gql`
    fragment ForgotPasswordPage_QueryFragment on Query {
      currentUser {
        nodeId
      }
    }
  `;

  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  state = {
    email: "",
    error: null,
    submitting: false,
  };

  handleEmailChange = e => {
    this.setState({ email: e.target.value, error: null });
  };

  handleSubmitWith = forgotPassword => async e => {
    e.preventDefault();
    const { history } = this.props;
    const { email } = this.state;
    this.setState({ submitting: true });
    try {
      const { data } = await forgotPassword({ variables: { email } });
      if (data.forgotPassword && data.forgotPassword.success) {
        this.setState({ submitting: false, error: null });
        history.push(this.getNext());
      } else {
        throw new Error("Failed to request password reset");
      }
    } catch (e) {
      this.setState({
        submitting: false,
        error: "Failed to request password reset",
      });
    }
  };

  getNext() {
    return "/";
  }

  render() {
    const { data, loading, error } = this.props;
    const { email, submitting } = this.state;
    if (loading) return <LoadingPage />;
    if (error) {
      return (
        <ErrorPage>
          We failed talking to the server. Please reload the page.
        </ErrorPage>
      );
    }
    return (
      <Layout>
        <h1>Forgot Password</h1>
        <p>Type in your email address, and we'll send you a link to reset your password.</p>
        <Mutation
          mutation={FORGOT_PASSWORD}
        >
          {forgotPassword => (
            <form onSubmit={this.handleSubmitWith(forgotPassword)}>
              <table className="form-table">
                <tbody>
                  <tr>
                    <th>Email:</th>
                    <td>
                      <input
                        type="text"
                        value={email}
                        onChange={this.handleEmailChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              {this.state.error ? <p>{this.state.error}</p> : null}
              <button
                type="submit"
                disabled={!email || submitting }
              >
                Send password reset link
              </button>
            </form>
          )}
        </Mutation>
      </Layout>
    );
  }
}
