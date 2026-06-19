import { DEMO_ACCOUNTS } from './config';
import { DEMO_USERS } from './mockData';

export function demoLoginWithCredentials(email, password) {
  const normalized = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === normalized && a.password === password
  );
  if (!account) {
    return { success: false, message: 'Use the demo credentials shown below.' };
  }
  return { success: true, user: DEMO_USERS[account.key] };
}

export function demoLoginAsRole(roleKey) {
  const user = DEMO_USERS[roleKey];
  if (!user) return { success: false, message: 'Invalid demo role.' };
  return { success: true, user };
}
