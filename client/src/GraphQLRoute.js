import React from "react";
import { Route } from "react-router-dom";
import { Query } from "react-apollo";

export default class GraphQLRoute extends React.Component {
  renderComponent = () => {
    const { component: Component, variables, children: queryGen } = this.props;
    const query =
      typeof queryGen === "function" ? queryGen(this.props) : queryGen;
    return (
      <Query query={query} variables={variables}>
        {result => <Component {...result} />}
      </Query>
    );
  };

  render() {
    const { path, exact } = this.props;
    return <Route path={path} render={this.renderComponent} exact={exact} />;
  }
}
