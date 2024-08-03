//* Environment Variables
export const PORT = process.env.PORT || 8000;
export const NODE_ENV = process.env.NODE_ENV || 'local';
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || '*';
