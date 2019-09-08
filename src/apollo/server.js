import { ApolloServer } from 'apollo-server-express';

import AppModule from '../modules';
import formatError from './errors';

const { schema, context } = AppModule;

const buildApolloServer = () => (
  new ApolloServer({
    context: ({ req, res }) => ({ ...context, req, res }),
    formatError,
    introspection: process.env.API_ENABLE_INTROSPECTION === 'true',
    playground: process.env.API_ENABLE_PLAYGROUND === 'true',
    schema,
    tracing: process.env.API_ENABLE_TRACING === 'true',
  })
);

export default buildApolloServer;
