'use strict';

const { getService } = require('strapi-plugin-content-manager/utils');
const {
  validateGenerateTokenInput,
  validateCheckTokenAvailabilityInput,
  validateTokenField,
} = require('./validation');

module.exports = {
  async generateToken(ctx) {
    const { contentTypeUID, field, data } = await validateGenerateTokenInput(ctx.request.body);

    await validateTokenField(contentTypeUID, field);

    const uidService = getService('tokengenerator');

    ctx.body = {
      data: await uidService.generateTokenField({ contentTypeUID, field, data }),
    };
  },

  async checkUIDAvailability(ctx) {
    const { contentTypeUID, field, value } = await validateCheckTokenAvailabilityInput(
      ctx.request.body
    );

    await validateTokenField(contentTypeUID, field);

    const uidService = getService('tokenGenerator');

    const isAvailable = await uidService.checkUIDAvailability({ contentTypeUID, field, value });

    ctx.body = {
      isAvailable,
      suggestion: !isAvailable
        ? await uidService.findUniqueUID({ contentTypeUID, field, value })
        : null,
    };
  },
};
