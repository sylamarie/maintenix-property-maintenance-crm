import fs from 'fs';

import { isJobAssignedToOperative } from '../models/operativeModel.js';
import {
  createVariation,
  decideVariation,
  getVariationById,
  listVariations,
  reviewVariation,
  variationStatuses
} from '../models/variationModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  cleanEnum,
  cleanOptionalEnum,
  cleanRequiredString,
  cleanString
} from '../utils/validators.js';

const adminReviewStatuses = ['pending_client_approval', 'rejected'];
const clientDecisionStatuses = ['approved', 'rejected'];

const cleanupUploadedFile = (file) => {
  if (file?.path) {
    fs.rmSync(file.path, { force: true });
  }
};

const firstProvided = (...values) => {
  return values.find((value) => value !== undefined && value !== null);
};

const cleanOptionalAmount = (value, fieldName) => {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const amount = Number(cleaned);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, `${fieldName} must be a valid positive amount.`);
  }

  return amount.toFixed(2);
};

const getReviewStatus = (body) => {
  const requested = cleanRequiredString(
    body.status || body.action,
    'Review status'
  );

  if (requested === 'send_to_client') {
    return 'pending_client_approval';
  }

  return cleanEnum(requested, adminReviewStatuses, 'Review status');
};

const assertVariationAccess = (variation, user) => {
  if (user.role === 'admin') {
    return;
  }

  if (
    user.role === 'operative' &&
    variation.job.assignedOperativeId === user.id
  ) {
    return;
  }

  if (user.role === 'client' && variation.job.client.clientUserId === user.id) {
    return;
  }

  throw new ApiError(403, 'You do not have access to this variation.');
};

export const getVariations = asyncHandler(async (req, res) => {
  const variations = await listVariations({
    search: cleanString(req.query.search),
    status: cleanOptionalEnum(req.query.status, variationStatuses, 'Status')
  });

  res.json({ variations });
});

export const getVariation = asyncHandler(async (req, res) => {
  const variation = await getVariationById(req.params.id);

  if (!variation) {
    throw new ApiError(404, 'Variation not found.');
  }

  assertVariationAccess(variation, req.user);

  res.json({ variation });
});

export const postVariation = asyncHandler(async (req, res) => {
  try {
    const jobId = cleanRequiredString(req.body.jobId, 'Job');
    const description = cleanRequiredString(req.body.description, 'Description');
    const reason = cleanRequiredString(req.body.reason, 'Reason');
    const estimatedAmount = cleanOptionalAmount(
      firstProvided(req.body.estimatedAmount, req.body.estimated_amount),
      'Estimated amount'
    );

    const isAssigned = await isJobAssignedToOperative(jobId, req.user.id);

    if (!isAssigned) {
      throw new ApiError(404, 'Assigned job not found.');
    }

    const photoUrl = req.file ? `/uploads/variations/${req.file.filename}` : null;
    const variation = await createVariation({
      jobId,
      raisedBy: req.user.id,
      description,
      reason,
      estimatedAmount,
      photoUrl
    });

    res.status(201).json({ variation });
  } catch (error) {
    cleanupUploadedFile(req.file);
    throw error;
  }
});

export const getOperativeJobVariations = asyncHandler(async (req, res) => {
  const isAssigned = await isJobAssignedToOperative(req.params.id, req.user.id);

  if (!isAssigned) {
    throw new ApiError(404, 'Assigned job not found.');
  }

  const variations = await listVariations({
    jobId: req.params.id,
    operativeId: req.user.id
  });

  res.json({ variations });
});

export const patchAdminReview = asyncHandler(async (req, res) => {
  const existing = await getVariationById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'Variation not found.');
  }

  if (existing.status !== 'pending_admin_review') {
    throw new ApiError(400, 'Only variations pending admin review can be reviewed.');
  }

  const status = getReviewStatus(req.body);
  const adminPrice = cleanOptionalAmount(
    firstProvided(req.body.adminPrice, req.body.admin_price),
    'Admin price'
  );

  if (status === 'pending_client_approval' && adminPrice === null) {
    throw new ApiError(400, 'Admin price is required before client approval.');
  }

  const variation = await reviewVariation({
    id: req.params.id,
    reviewedBy: req.user.id,
    adminPrice,
    status
  });

  res.json({ variation });
});

export const getClientVariations = asyncHandler(async (req, res) => {
  const variations = await listVariations({
    search: cleanString(req.query.search),
    status: cleanOptionalEnum(req.query.status, variationStatuses, 'Status'),
    clientUserId: req.user.id
  });

  res.json({ variations });
});

export const patchClientDecision = asyncHandler(async (req, res) => {
  const existing = await getVariationById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'Variation not found.');
  }

  if (existing.job.client.clientUserId !== req.user.id) {
    throw new ApiError(403, 'You do not have access to this variation.');
  }

  if (existing.status !== 'pending_client_approval') {
    throw new ApiError(
      400,
      'Only variations pending client approval can be decided.'
    );
  }

  const status = cleanEnum(
    req.body.decision || req.body.status,
    clientDecisionStatuses,
    'Decision'
  );
  const variation = await decideVariation({
    id: req.params.id,
    status,
    clientDecisionNote: cleanString(
      firstProvided(req.body.clientDecisionNote, req.body.client_decision_note)
    )
  });

  res.json({ variation });
});
