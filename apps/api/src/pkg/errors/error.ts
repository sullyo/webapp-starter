import { HTTPException } from "hono/http-exception";

export class NotFoundError extends HTTPException {
  constructor(message: string) {
    super(404, { message });
  }
}

export class BadRequestError extends HTTPException {
  constructor(message: string) {
    super(400, { message });
  }
}

export class UnauthorizedError extends HTTPException {
  constructor(message = "Unauthorized") {
    super(401, { message });
  }
}

export class ForbiddenError extends HTTPException {
  constructor(message = "Forbidden") {
    super(403, { message });
  }
}

export class ConflictError extends HTTPException {
  constructor(message: string) {
    super(409, { message });
  }
}

export class UnprocessableEntityError extends HTTPException {
  constructor(message: string) {
    super(422, { message });
  }
}

export class InternalServerError extends HTTPException {
  constructor(message = "Internal Server Error") {
    super(500, { message });
  }
}

export class TooManyRequestsError extends HTTPException {
  constructor(message = "Too Many Requests") {
    super(429, { message });
  }
}
