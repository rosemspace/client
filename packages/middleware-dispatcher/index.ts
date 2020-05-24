interface RequestHandler<Request, Response> {
  handle(request: Request): Response
}

interface Middleware<Request, Response> {
  process(request: Request, next: RequestHandler<Request, Response>): Response
}

abstract class AbstractMiddleware<Request, Response>
  implements Middleware<Request, Response> {
  private successor: RequestHandler<Request, Response>

  constructor(successor: RequestHandler<Request, Response>) {
    this.successor = successor
  }

  process(request: Request, next: RequestHandler<Request, Response>): Response {
    return this.successor.handle(request)
  }
}

class MiddlewareDispatcher {}
