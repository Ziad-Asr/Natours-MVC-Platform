// Utility function to filter allowed fields from request body
const allowedFields = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

module.exports = allowedFields;
