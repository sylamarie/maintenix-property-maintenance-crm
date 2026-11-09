import { cleanString } from './validators.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

// Pagination is opt-in: if the request has no `page` or `limit`, we return
// null and the list endpoints behave exactly as before (full list). This keeps
// dropdowns that need every client/operative working.
export const parsePagination = (query = {}) => {
  if (query.page === undefined && query.limit === undefined) {
    return null;
  }

  const page = Math.max(1, Math.floor(Number(query.page)) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(Number(query.limit)) || DEFAULT_LIMIT)
  );

  return { page, limit, offset: (page - 1) * limit };
};

// The extra fields the browser needs to draw "Page 2 of 7".
export const buildPaginationMeta = (pagination, total) => ({
  page: pagination.page,
  limit: pagination.limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / pagination.limit))
});

// Search text is trimmed and capped so a huge string cannot slow the database.
export const cleanSearch = (value) => cleanString(value)?.slice(0, MAX_SEARCH_LENGTH) || null;
