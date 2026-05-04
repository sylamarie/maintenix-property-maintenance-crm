export const dashboardPathByRole = {
  admin: '/admin/dashboard',
  operative: '/operative/dashboard',
  client: '/client/dashboard'
};

export const getDashboardPathForRole = (role) => {
  return dashboardPathByRole[role] || '/login';
};
