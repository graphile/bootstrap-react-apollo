import React from "react";
import { Route } from "react-router-dom";

export default class GraphQLRoute extends React.Component {
  render() {
    const { path, component, exact } = this.props;
    return <Route path={path} component={component} exact={exact} />;
  }
}
