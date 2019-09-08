import '@babel/polyfill';
import blocked from 'blocked';
import express from 'express';
import 'graphql-import-node';

import { buildApolloServer } from './apollo';
import {
  cors,
  error,
  healthcheck,
  missingRoute,
  requestLogger,
  version,
} from './express';
import logger from './logger';
import RequestContext from './RequestContext';

const main = async () => {
  blocked((ms) => logger.warn(`event-loop-blocked: ${ms}ms`));

  const app = express();

  app.get('/_health', healthcheck);

  app.use(RequestContext.setup);
  app.use(requestLogger);
  app.use(cors);

  app.get('/_version', version);

  const apolloServer = buildApolloServer();
  apolloServer.applyMiddleware({ app, cors: false });

  app.use(missingRoute);
  app.use(error);

  const port = process.env.API_PORT || 4001;
  app.listen(port, () => logger.info(`server started on http://localhost:${port}`));
};

main();
