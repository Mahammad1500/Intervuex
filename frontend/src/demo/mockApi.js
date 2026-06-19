import {
  demoCompanies,
  demoUsers,
  demoInterviews,
  demoAuditLogs,
  demoTrends,
  demoDashboardStats,
  demoNotifications,
  demoFunnel,
  demoFeedbackStats,
  demoInterviewerPerformance,
  demoWorkspace,
  DEMO_COMPANY_ID,
} from './mockData';

const DEMO_BLOCK = {
  success: false,
  message: 'Preview mode — sample data only. Changes are not saved.',
  code: 'UI_DEMO_READ_ONLY',
};

function ok(data, message) {
  return { success: true, message: message || 'OK', data };
}

function getPath(config) {
  const url = config.url || '';
  if (url.startsWith('http')) {
    try {
      return new URL(url).pathname.replace(/^\/api/, '') || '/';
    } catch {
      return url;
    }
  }
  return url.startsWith('/') ? url : `/${url}`;
}

function isMutation(method) {
  return ['post', 'put', 'patch', 'delete'].includes(String(method).toLowerCase());
}

export function handleDemoRequest(config) {
  const method = String(config.method || 'get').toLowerCase();
  const path = getPath(config).replace(/\?.*$/, '');

  if (isMutation(method)) {
    if (path.startsWith('/auth/login') || path.startsWith('/auth/logout') || path.startsWith('/auth/refresh')) {
      if (path.startsWith('/auth/login')) {
        return ok({ user: demoUsers[0], accessToken: 'demo-token', refreshToken: 'demo-refresh' });
      }
      return ok({});
    }
    const err = new Error(DEMO_BLOCK.message);
    err.response = { status: 403, data: DEMO_BLOCK, config };
    throw err;
  }

  if (path.startsWith('/auth/google/status')) {
    return ok({ enabled: false });
  }

  if (path.startsWith('/analytics/dashboard')) {
    return ok(demoDashboardStats);
  }
  if (path.startsWith('/analytics/trends')) {
    return ok(demoTrends);
  }
  if (path.startsWith('/analytics/funnel')) {
    return ok(demoFunnel);
  }
  if (path.startsWith('/analytics/feedback')) {
    return ok(demoFeedbackStats);
  }
  if (path.startsWith('/analytics/interviewer-performance')) {
    return ok(demoInterviewerPerformance);
  }

  if (path === '/companies' || path.startsWith('/companies?')) {
    return ok({
      companies: demoCompanies,
      pagination: { total: demoCompanies.length, page: 1, limit: 100, pages: 1 },
    });
  }
  if (path.startsWith('/companies/workspace')) {
    return ok(demoWorkspace);
  }
  if (path.match(/^\/companies\/[^/]+$/)) {
    const id = path.split('/')[2];
    const company = demoCompanies.find((c) => c._id === id) || demoCompanies[0];
    return ok({ company });
  }

  if (path.startsWith('/users')) {
    return ok({
      users: demoUsers,
      pagination: { total: demoUsers.length, page: 1, limit: 50, pages: 1 },
    });
  }

  if (path.startsWith('/interviews/upcoming')) {
    const upcoming = demoInterviews.filter((i) => ['scheduled', 'confirmed'].includes(i.status));
    return ok({ interviews: upcoming });
  }
  if (path.match(/^\/interviews\/[^/]+$/)) {
    const id = path.split('/')[2];
    const interview = demoInterviews.find((i) => i._id === id) || demoInterviews[0];
    return ok({ interview });
  }
  if (path.startsWith('/interviews')) {
    return ok({
      interviews: demoInterviews,
      pagination: { total: demoInterviews.length, page: 1, limit: 100, pages: 1 },
    });
  }

  if (path.startsWith('/audit')) {
    return ok({ logs: demoAuditLogs, pagination: { total: demoAuditLogs.length } });
  }

  if (path.startsWith('/notifications')) {
    return ok({ notifications: demoNotifications, unreadCount: demoNotifications.filter((n) => !n.read).length });
  }

  if (path.startsWith('/feedback')) {
    return ok({ feedback: null, reviews: [] });
  }

  if (path.startsWith('/calendar')) {
    return ok({ connected: false, google: false, microsoft: false });
  }

  if (path.startsWith('/health')) {
    return ok({ status: 'ok', service: 'Intervuex UI Demo', database: 'mock' });
  }

  return ok({ message: 'Demo preview', companyId: DEMO_COMPANY_ID });
}

export function createDemoAdapter(originalAdapter) {
  return (config) => {
    try {
      const data = handleDemoRequest(config);
      return Promise.resolve({
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    } catch (err) {
      if (err.response) {
        return Promise.reject(err);
      }
      return Promise.reject(err);
    }
  };
}
