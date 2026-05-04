export const getDatabaseErrorCode = (error) => {
  return error?.code || error?.errors?.find((item) => item?.code)?.code || null;
};

export const getDatabaseErrorMessage = (error) => {
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors
      .map((item) => item.message)
      .filter(Boolean)
      .join('; ');
  }

  return error?.message || 'PostgreSQL connection failed';
};
