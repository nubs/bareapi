import convertHrtime from 'convert-hrtime';

import logger from '../logger';
import RequestContext from '../RequestContext';

const requestLogger = (req, res, next) => {
  const requestStr = `${req.method} ${req.url}`;
  logger.info(`express-request: ${requestStr}`);

  const logResponse = () => {
    res.removeListener('finish', logResponse);
    res.removeListener('close', logResponse);

    const context = RequestContext.current();
    const startTime = context && context.startTime;

    const elapsed = convertHrtime(process.hrtime(startTime)).milliseconds;
    logger.info(`express-request-end: ${requestStr} ${res.statusCode} [${elapsed}ms]`);
  };

  res.on('finish', logResponse);
  res.on('close', logResponse);
  next();
};

export default requestLogger;
