import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import client from './apolloClient'
import { ApolloProvider } from "@apollo/client/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ApolloProvider client={client}>
<QueryClientProvider client={queryClient}>

    <App />
</QueryClientProvider>
      </ApolloProvider>
  </StrictMode>,
)
