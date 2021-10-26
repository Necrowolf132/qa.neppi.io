'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */


module.exports = {
    lifecycles: {
        // Called after an entry is created
        /*async afterCreate(result) {
            let escritura
            if(typeof strapi?.services['registro-de-transacciones']?.register === 'function') {
                 escritura = await strapi.services['registro-de-transacciones'].register(result);
            }
            if ( escritura?.status == 'none') {
                console.log("operacion no necesita ser registrada en la tabla de transacciones");
            } else if(!escritura) {
                console.log("error al registrar la operaciones en la tabla de transacciones");
            } else {
                console.log("operacion registrada en la tabla de transacciones");
            }
            return escritura
        },*/
      },
};