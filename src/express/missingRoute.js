import logger from '../logger';

const missingRoute = (req, res) => {
  const requestStr = `${req.method} ${req.url}`;
  logger.warn(`missing-route: ${requestStr}`);
  res.status(404).send({ error: `No route found for ${requestStr}` });
};

export default missingRoute;
