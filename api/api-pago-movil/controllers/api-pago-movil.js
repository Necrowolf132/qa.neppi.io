'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    agregado: async function (ctx) {
        console.log(ctx.request.body);
        const  create = await strapi.services["service-consulta-pagomovil"].crearAsin(ctx.request.body);
        console.log(create);
        ctx.response.status = 200;
        ctx.response.body = JSON.stringify(create);
    }

};
