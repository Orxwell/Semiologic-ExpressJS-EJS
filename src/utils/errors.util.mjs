export class PersonalizedError extends Error {
  constructor (message) {
    super(message);
    this.name = 'PersonalizedError';
  }
}
