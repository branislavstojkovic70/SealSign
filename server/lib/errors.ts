export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Safe, status-code-appropriate messages to send to the client. */
export function clientMessage(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'Bad request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not found';
    case 429: return 'Too many requests';
    case 502: return 'Upstream service error';
    case 503: return 'Service temporarily unavailable';
    default:  return 'Internal server error';
  }
}
