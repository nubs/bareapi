import safe from 'colors/safe';
import partition from 'lodash/partition';
import pick from 'lodash/pick';
import { createLogger, format, transports } from 'winston';

import RequestContext from './RequestContext';

const useColor = process.env.LOG_COLORS === 'true';
if (useColor) {
  safe.enable();
}

const formats = [
  format.timestamp(),
  format.splat(),
  format.printf(
    ({
      timestamp,
      level,
      message,
      ...meta
    }) => {
      let stringifiedMeta = JSON.stringify(meta);
      if (useColor) {
        stringifiedMeta = safe.gray(stringifiedMeta);
      }

      return `${timestamp} [${level}] ${message} ${stringifiedMeta}`;
    },
  ),
];

if (useColor) {
  formats.unshift(format.colorize());
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(...formats),
  transports: [new transports.Console()],
});

const log = (level, message, ...meta) => {
  const [objectMeta, rest] = partition(meta, (arg) => typeof arg === 'object');
  const combinedMessage = [message, ...rest].join(' ');

  const context = RequestContext.current();

  logger.log(
    level,
    combinedMessage,
    Object.assign(
      {},
      ...objectMeta,
      { ...pick(context, ['basRequestId', 'parentRequestId', 'requestId']) },
    ),
  );

  return logger;
};

export default {
  silly: (...args) => log('silly', ...args),
  debug: (...args) => log('debug', ...args),
  verbose: (...args) => log('verbose', ...args),
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
};
