import { getJobReport } from '../models/reportModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const assertReportAccess = (report, user) => {
  if (user.role === 'admin') {
    return;
  }

  if (
    user.role === 'operative' &&
    report.job.assignedOperativeId === user.id
  ) {
    return;
  }

  if (user.role === 'client' && report.job.client.clientUserId === user.id) {
    return;
  }

  throw new ApiError(403, 'You do not have access to this job report.');
};

export const getJobReportById = asyncHandler(async (req, res) => {
  const report = await getJobReport(req.params.jobId);

  if (!report) {
    throw new ApiError(404, 'Job report not found.');
  }

  assertReportAccess(report, req.user);

  res.json({ report });
});
