import {
  cleanRequiredString,
  cleanString
} from '../utils/validators.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPaginationMeta, cleanSearch, parsePagination } from '../utils/pagination.js';
import {
  createProperty,
  deleteProperty,
  getPropertyById,
  listProperties,
  updateProperty
} from '../models/propertyModel.js';

const buildPropertyPayload = (body, existing = null) => ({
  clientId:
    body.clientId !== undefined
      ? cleanRequiredString(body.clientId, 'Client')
      : existing?.clientId,
  name:
    body.name !== undefined
      ? cleanRequiredString(body.name, 'Property name')
      : existing?.name,
  addressLine1:
    body.addressLine1 !== undefined
      ? cleanRequiredString(body.addressLine1, 'Address line 1')
      : existing?.addressLine1,
  addressLine2:
    body.addressLine2 !== undefined
      ? cleanString(body.addressLine2)
      : existing?.addressLine2 || null,
  city:
    body.city !== undefined
      ? cleanRequiredString(body.city, 'City')
      : existing?.city,
  postcode:
    body.postcode !== undefined
      ? cleanRequiredString(body.postcode, 'Postcode')
      : existing?.postcode,
  accessNotes:
    body.accessNotes !== undefined
      ? cleanString(body.accessNotes)
      : existing?.accessNotes || null
});

export const getProperties = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { items: properties, total } = await listProperties({
    pagination,
    search: cleanSearch(req.query.search),
    clientId: cleanString(req.query.clientId),
    postcode: cleanSearch(req.query.postcode)
  });

  res.json({
    properties,
    ...(pagination && { pagination: buildPaginationMeta(pagination, total) })
  });
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await getPropertyById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found.');
  }

  res.json({ property });
});

export const postProperty = asyncHandler(async (req, res) => {
  const payload = buildPropertyPayload(req.body);
  const property = await createProperty(payload);

  res.status(201).json({ property });
});

export const patchProperty = asyncHandler(async (req, res) => {
  const existing = await getPropertyById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'Property not found.');
  }

  const payload = buildPropertyPayload(req.body, existing);
  const property = await updateProperty(req.params.id, payload);

  res.json({ property });
});

export const removeProperty = asyncHandler(async (req, res) => {
  const deleted = await deleteProperty(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Property not found.');
  }

  res.status(204).send();
});
