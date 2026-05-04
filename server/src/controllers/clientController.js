import {
  cleanEmail,
  cleanRequiredString,
  cleanString
} from '../utils/validators.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createClient,
  deleteClient,
  getClientById,
  listClients,
  updateClient
} from '../models/clientModel.js';

const buildClientPayload = (body, existing = null) => ({
  name:
    body.name !== undefined
      ? cleanRequiredString(body.name, 'Client name')
      : existing?.name,
  contactName:
    body.contactName !== undefined
      ? cleanRequiredString(body.contactName, 'Contact name')
      : existing?.contactName,
  email:
    body.email !== undefined ? cleanEmail(body.email) : existing?.email,
  phone:
    body.phone !== undefined ? cleanString(body.phone) : existing?.phone || null,
  billingAddress:
    body.billingAddress !== undefined
      ? cleanString(body.billingAddress)
      : existing?.billingAddress || null
});

export const getClients = asyncHandler(async (req, res) => {
  const clients = await listClients({
    search: cleanString(req.query.search)
  });

  res.json({ clients });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);

  if (!client) {
    throw new ApiError(404, 'Client not found.');
  }

  res.json({ client });
});

export const postClient = asyncHandler(async (req, res) => {
  const payload = buildClientPayload(req.body);
  const client = await createClient(payload);

  res.status(201).json({ client });
});

export const patchClient = asyncHandler(async (req, res) => {
  const existing = await getClientById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'Client not found.');
  }

  const payload = buildClientPayload(req.body, existing);
  const client = await updateClient(req.params.id, payload);

  res.json({ client });
});

export const removeClient = asyncHandler(async (req, res) => {
  const deleted = await deleteClient(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Client not found.');
  }

  res.status(204).send();
});
