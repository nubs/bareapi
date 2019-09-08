import { createNamespace, getNamespace } from 'cls-hooked';
import os from 'os';
import { v4 as uuid } from 'uuid';

const SESSION_NAMESPACE = 'api-request';
const requestSession = createNamespace(SESSION_NAMESPACE);

class RequestContext {
  static async setup(req, res, next) {
    requestSession.bindEmitter(req);
    requestSession.bindEmitter(res);

    await requestSession.runPromise(async () => {
      requestSession.set('context', new RequestContext(req));
    });

    next();
  }

  static getNamespace() {
    return getNamespace(SESSION_NAMESPACE);
  }

  static requireNamespace() {
    const namespace = RequestContext.getNamespace();
    if (!namespace || !namespace.active) {
      throw new Error('No active CLS namespace.');
    }

    return namespace;
  }

  static current() {
    const namespace = RequestContext.getNamespace();
    return namespace ? namespace.get('context') : undefined;
  }

  setRequestEndpoint(requestEndpoint) {
    this.requestEndpoint = requestEndpoint;
  }

  getAuditInformation() {
    return {
      baseRequestApplication: this.baseRequestApplication,
      baseRequestId: this.baseRequestId,
      hostname: os.hostname(),
      madeAt: this.requestDate,
      requestEndpoint: this.requestEndpoint,
      requestId: this.requestId,
      userIp: this.requestIp,
    };
  }

  constructor(req) {
    this.requestDate = new Date();
    this.requestIp = req.ip;
    this.baseRequestApplication = req.header('x-base-request-application') || 'MANUAL';
    this.requestId = uuid();
    this.parentRequestId = req.header('x-parent-request-id') || undefined;
    this.baseRequestId = req.header('x-base-request-id')
      || this.parentRequestId
      || this.requestId;
    this.startTime = process.hrtime();
    this.requestEndpoint = 'unknown';
  }
}

export default RequestContext;
