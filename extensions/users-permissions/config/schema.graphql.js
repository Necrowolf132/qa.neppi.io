const _ = require('lodash');

/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
function checkBadRequest(contextBody) {
  if (_.get(contextBody, 'statusCode', 200) !== 200) {
    const message = _.get(contextBody, 'error', 'Bad Request');
    const exception = new Error(message);
    exception.code = _.get(contextBody, 'statusCode', 400);
    exception.data = contextBody;
    throw exception;
  }
}

module.exports = {
  definition: /* GraphQL */ `
    type UsersPermissionsRefreshTokenPayload {
      jwt: String!
    }
  `,
  mutation: `
    refreshToken(jwt: String!): UsersPermissionsRefreshTokenPayload!
  `,
  resolver: {
    Mutation: {
      refreshToken: {
        description: 'Refresh JWT Token',
        resolverOf: 'plugins::users-permissions.auth.refreshToken',
        resolver: async (obj, options, { context }) => {
          context.query = _.toPlainObject(options);

          await strapi.plugins['users-permissions'].controllers.auth.refreshToken(context);
          let output = context.body.toJSON ? context.body.toJSON() : context.body;

          checkBadRequest(output);

          return output;
        },
      },
    },
  },
};