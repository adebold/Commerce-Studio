import { authHandlers } from './handlers/auth';
import { reportsHandlers } from './handlers/reports';
import { userHandlers } from './handlers/user';

export const handlers = [
  ...authHandlers,
  ...reportsHandlers,
  ...userHandlers
];
