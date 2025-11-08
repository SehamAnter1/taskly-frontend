import { GraphQLClient } from "graphql-request";

const graphqlClient = new GraphQLClient("http://localhost:8000/graphql", {
  headers: {
    // If you add auth later, put token here
    // Authorization: `Bearer ${token}`,
  },
});

export default graphqlClient;
