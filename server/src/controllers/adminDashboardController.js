import { getAdminDashboardMetrics } from '../models/adminDashboardModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getAdminDashboardMetrics();

  res.json(dashboard);
});
