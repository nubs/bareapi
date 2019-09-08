import serializeError from 'serialize-error';

import logger from '../logger';

const isClientError = () => false;

const formatError = (err) => {
  const logError = (level, error) => {
    logger[level](`graphql-error: ${error.message}`, { error: serializeError(error) });
  };

  if (isClientError) {
    logError('warn', err);
    return err;
  }

  logError('error', err);

  if (process.env.API_RETURN_ERRORS === 'true') {
    logger.warn('Returning hidden error to user');
    return err;
  }

  return {
    ...serializeError(err),
    message: 'An unexpected error occurred. Please try again.',
  };
};

export default formatError;
