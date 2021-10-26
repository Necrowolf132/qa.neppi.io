'use strict';

const _ = require('lodash');
const { yup, formatYupErrors } = require('strapi-utils');

const createModelConfigurationSchema = require('strapi-plugin-content-manager/controllers/validation/model-configuration');

const TYPES = ['singleType', 'collectionType'];

const handleError = error => {
  throw strapi.errors.badRequest('ValidationError', formatYupErrors(error));
};

/**
 * Validates type kind
 */
const validateKind = kind => {
  return yup
    .string()
    .oneOf(TYPES)
    .nullable()
    .validate(kind)
    .catch(error => Promise.reject(formatYupErrors(error)));
};

const validateBulkDeleteInput = (data = {}) => {
  return yup
    .object({
      ids: yup
        .array()
        .of(yup.strapiID())
        .min(1)
        .required(),
    })
    .required()
    .validate(data, {
      strict: true,
      abortEarly: false,
    })
    .catch(handleError);
};

const validateGenerateTokenInput = data => {
  return yup
    .object({
      contentTypeUID: yup.string().required(),
      field: yup.string().required(),
      data: yup.object().required(),
    })
    .validate(data, {
      strict: true,
      abortEarly: false,
    })
    .catch(handleError);
};

const validateCheckTokenAvailabilityInput = data => {
  return yup
    .object({
      contentTypeUID: yup.string().required(),
      field: yup.string().required(),
      value: yup
        .string()
        .matches(new RegExp('^[A-Za-z0-9-_.~]*$'))
        .required(),
    })
    .validate(data, {
      strict: true,
      abortEarly: false,
    })
    .catch(handleError);
};

const validateTokenField = (contentTypeUID, field) => {
  const model = strapi.contentTypes[contentTypeUID];

  if (!model) {
    throw strapi.errors.badRequest('ValidationError', ['ContentType not found']);
  }

  /*if (
    _.has(model, ['attributes', field]) ||
    _.get(model, ['attributes', field, 'type']) !== 'uid'
  ) {
    throw strapi.errors.badRequest('ValidationError', {
      field: ['field must be a valid `uid` attribute'],
    });
  }*/
};

const validatePagination = ({ page, pageSize }) => {
  const pageNumber = parseInt(page);
  const pageSizeNumber = parseInt(pageSize);

  if (isNaN(pageNumber) || pageNumber < 1) {
    throw strapi.errors.badRequest('invalid pageNumber param');
  }
  if (isNaN(pageSizeNumber) || pageSizeNumber < 1) {
    throw strapi.errors.badRequest('invalid pageSize param');
  }
};

module.exports = {
  createModelConfigurationSchema,
  validateKind,
  validateBulkDeleteInput,
  validateGenerateTokenInput,
  validateCheckTokenAvailabilityInput,
  validateTokenField,
  validatePagination,
};
