export const isUiDemoMode = () => import.meta.env.VITE_UI_DEMO_MODE === 'true';

export const isDemoSite = () =>
  isUiDemoMode()
  || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true'
  || import.meta.env.DEV;

export const DEMO_ACCOUNTS = [
  { role: 'Admin', key: 'admin', email: 'admin@intervuex.com', password: '12345678' },
  { role: 'HR', key: 'hr', email: 'hr@intervuex.com', password: '12345678' },
];
