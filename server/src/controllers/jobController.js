import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPaginationMeta, cleanSearch, parsePagination } from '../utils/pagination.js';
import {
  cleanDate,
  cleanEnum,
  cleanOptionalEnum,
  cleanRequiredString,
  cleanString
} from '../utils/validators.js';
import {
  assignJob,
  createJob,
  deleteJob,
  getJobById,
  getPropertyClientId,
  isActiveOperative,
  jobPriorities,
  jobStatuses,
  listJobs,
  updateJob,
  updateJobStatus
} from '../models/jobModel.js';

const normaliseNullableId = (value) => cleanString(value) || null;

const assertDateOrder = ({ scheduledDate, dueDate, completionDate }) => {
  if (scheduledDate && dueDate && dueDate < scheduledDate) {
    throw new ApiError(400, 'Due date cannot be before the scheduled date.');
  }

  if (scheduledDate && completionDate && completionDate < scheduledDate) {
    throw new ApiError(400, 'Completion date cannot be before the scheduled date.');
  }
};

const ensureJobRelations = async ({ clientId, propertyId, assignedOperativeId }) => {
  const propertyClientId = await getPropertyClientId(propertyId);

  if (!propertyClientId) {
    throw new ApiError(400, 'Selected property does not exist.');
  }

  if (propertyClientId !== clientId) {
    throw new ApiError(400, 'Selected property does not belong to the client.');
  }

  if (assignedOperativeId) {
    const validOperative = await isActiveOperative(assignedOperativeId);

    if (!validOperative) {
      throw new ApiError(400, 'Selected operative is not active or does not exist.');
    }
  }
};

const buildJobPayload = (body, existing = null, currentUser = null) => {
  let status =
    body.status !== undefined
      ? cleanEnum(body.status, jobStatuses, 'Status')
      : existing?.status || 'pending';
  const assignedOperativeId =
    body.assignedOperativeId !== undefined
      ? normaliseNullableId(body.assignedOperativeId)
      : existing?.assignedOperativeId || null;

  if (assignedOperativeId && status === 'pending') {
    status = 'assigned';
  }

  const completionDate =
    status === 'completed'
      ? cleanDate(body.completionDate, 'Completion date') ||
        existing?.completionDate ||
        new Date().toISOString().slice(0, 10)
      : null;

  return {
    clientId:
      body.clientId !== undefined
        ? cleanRequiredString(body.clientId, 'Client')
        : existing?.clientId,
    propertyId:
      body.propertyId !== undefined
        ? cleanRequiredString(body.propertyId, 'Property')
        : existing?.propertyId,
    assignedOperativeId,
    title:
      body.title !== undefined
        ? cleanRequiredString(body.title, 'Job title')
        : existing?.title,
    description:
      body.description !== undefined
        ? cleanRequiredString(body.description, 'Description')
        : existing?.description,
    status,
    priority:
      body.priority !== undefined
        ? cleanEnum(body.priority, jobPriorities, 'Priority')
        : existing?.priority || 'medium',
    scheduledDate:
      body.scheduledDate !== undefined
        ? cleanDate(body.scheduledDate, 'Scheduled date')
        : existing?.scheduledDate || null,
    dueDate:
      body.dueDate !== undefined
        ? cleanDate(body.dueDate, 'Due date')
        : existing?.dueDate || null,
    completionDate,
    createdBy: existing?.createdBy || currentUser?.id || null
  };
};

export const getJobs = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { items: jobs, total } = await listJobs({
    pagination,
    search: cleanSearch(req.query.search),
    status: cleanOptionalEnum(req.query.status, jobStatuses, 'Status'),
    priority: cleanOptionalEnum(req.query.priority, jobPriorities, 'Priority'),
    clientId: cleanString(req.query.clientId),
    operativeId: cleanString(req.query.operativeId),
    scheduledDate: cleanDate(req.query.scheduledDate, 'Scheduled date')
  });

  res.json({
    jobs,
    ...(pagination && { pagination: buildPaginationMeta(pagination, total) })
  });
});

export const getJob =asyncHandler(async (req, res) => {
  const job = await getJobById(req.params.id);

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  res.json({ job });
});

export const postJob = asyncHandler(async (req, res) => {
  const payload = buildJobPayload(req.body, null, req.user);
  assertDateOrder(payload);
  await ensureJobRelations(payload);

  const job = await createJob(payload);

  res.status(201).json({ job });
});

export const patchJob = asyncHandler(async (req, res) => {
  const existing = await getJobById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'Job not found.');
  }

  const payload = buildJobPayload(req.body, existing, req.user);
  assertDateOrder(payload);
  await ensureJobRelations(payload);

  const job = await updateJob(req.params.id, payload);

  res.json({ job });
});

export const patchJobStatus = asyncHandler(async (req, res) => {
  const status = cleanEnum(req.body.status, jobStatuses, 'Status');
  const job = await updateJobStatus(req.params.id, status);

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  res.json({ job });
});

export const patchJobAssignment = asyncHandler(async (req, res) => {
  const operativeId = normaliseNullableId(req.body.assignedOperativeId);

  if (operativeId) {
    const validOperative = await isActiveOperative(operativeId);

    if (!validOperative) {
      throw new ApiError(400, 'Selected operative is not active or does not exist.');
    }
  }

  const job = await assignJob(req.params.id, operativeId);

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  res.json({ job });
});

export const removeJob = asyncHandler(async (req, res) => {
  const deleted = await deleteJob(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Job not found.');
  }

  res.status(204).send();
});
