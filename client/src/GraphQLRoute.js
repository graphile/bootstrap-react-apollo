import React from "react";
import { Route } from "react-router-dom";
import { Query } from "react-apollo";
import gql from "graphql-tag";

export function queryGenFromComponent(Component) {
  const componentName = Component.displayName || Component.name;
  const fragment = Component.QueryFragment;
  if (!fragment) {
    // eslint-disable-next-line no-console
    console.error(`${componentName} does not expose a QueryFragment`);
    return gql`
      query PlaceholderQuery {
        nodeId
      }
    `;
  }
  const routeName = `${componentName}Route`;
  const fragmentName = fragment.definitions[0].name.value; // TODO: add some asserts!
  return gql`
    query ${routeName} {
      ...${fragmentName /*eslint-disable-line*/}
    }
    ${fragment}
  `;
}

export default class GraphQLRoute extends React.Component {
  renderComponent = (routerProps) => {
    const {
      component: Component,
      variables,
      children: queryGen = queryGenFromComponent(Component),
    } = this.props;
    const query =
      typeof queryGen === "function" ? queryGen(this.props) : queryGen;
    return (
      <Query query={query} variables={variables}>
        {result => <Component {...result} {...routerProps} />}
      </Query>
    );
  };

  render() {
    const { path, exact } = this.props;
    return <Route path={path} render={this.renderComponent} exact={exact} />;
  }
}
