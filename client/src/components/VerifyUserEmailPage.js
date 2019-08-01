import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

const VERIFY_USER_EMAIL = gql`
  mutation VerifyUserEmail($token: String!) {
    verifyUserEmail(input: { token: $token }) {
      userEmail {
        nodeId
        isVerified
      }
    }
  }
`;

class VerifyUserEmailPage extends React.Component {
  static propTypes = {
    verifyUserEmail: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        token: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  state = {
    error: false,
  };

  componentDidMount() {
    const { verifyUserEmail, history } = this.props;
    verifyUserEmail()
      .then(() => {
        history.push("/");
      })
      .catch(() => {
        this.setState({ error: true });
      });
  }

  render() {
    const { loading } = this.props;
    const { error } = this.state;
    if (loading) {
      return <div>Verifying email...</div>;
    }
    if (error) {
      return <div>whoops</div>;
    }
    return <div>email verified!</div>;
  }
}

export default compose(
  graphql(VERIFY_USER_EMAIL, {
    name: "verifyUserEmail",
    options: props => ({
      variables: { token: props.match.params.token },
    }),
  })
)(VerifyUserEmailPage);
