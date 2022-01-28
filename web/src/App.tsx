import { gql, useQuery } from "@apollo/client";
import React from "react";

const App: React.FC = () => {
  const { data, loading } = useQuery(gql`
    query Users {
      users {
        id
        email
      }
    }
  `);

  if (loading) {
    return <div>Loading ...</div>;
  }

  return <div>{JSON.stringify(data)}</div>;
};

export default App;
