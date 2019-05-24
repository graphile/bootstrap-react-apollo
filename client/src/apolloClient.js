import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { withClientState } from "apollo-link-state";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";

export function makeClient() {
  const cache = new InMemoryCache({
    dataIdFromObject: object => object.nodeId,
  });

  const stateLink = withClientState({
    defaults: {
      isConnected: true,
    },
    resolvers: {
      Mutation: {
        // eslint-disable-next-line no-shadow
        updateNetworkStatus: (_, { isConnected }, { cache }) => {
          cache.writeData({ data: { isConnected } });
          return null;
        },
      },
    },
    cache,
  });
  const logoutOn401ErrorLink = onError(({ networkError }) => {
    if (networkError && networkError.status === 401) {
      // Logout
    }
  });
  const csrfMiddlewareLink = new ApolloLink((operation, forward) => {
    if (typeof window.CSRF_TOKEN === "string") {
      operation.setContext({
        headers: {
          "X-Token": window.CSRF_TOKEN,
        },
      });
    }
    return forward(operation);
  });
  const httpLink = new HttpLink({
    uri: "/graphql",
    credentials: "same-origin",
  });
  const link = ApolloLink.from([
    stateLink,
    logoutOn401ErrorLink,
    csrfMiddlewareLink,
    httpLink,
  ]);

  return new ApolloClient({
    link,
    cache,
  });
}
