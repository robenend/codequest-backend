const parseError = (schema, data) => {
  const { error } = schema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    const validationErrors = [];
    error.details.map((detail) => {
      validationErrors.push(detail.message);
    });

    return validationErrors;
  }

  return null;
};

export default parseError;
