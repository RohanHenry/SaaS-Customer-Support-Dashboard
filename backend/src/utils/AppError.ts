/**
 * A custom error that carries an HTTP status code.
 *
 * Throwing `new AppError("Invalid credentials", 401)` anywhere in our code lets
 * the central error handler turn it into a clean JSON response with the right
 * status. This keeps controllers readable — they just throw, they don't build
 * error responses by hand.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    // Restores the prototype chain so `instanceof AppError` works after compile.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
