'use strict';

/**
 * `service-consulta-pagomovil` service.
 */

module.exports = {
  // exampleService: (arg1, arg2) => {
  //   return isUserOnline(arg1, arg2);
  // }
   crearAsin: async function(arg1) {

    let devolucion = await strapi.query('pago-movil-modelo').create(arg1).then( (retorno) => {
      // Hace que .then() devuelva una promesa rechazada
       return retorno;
    })
    .catch( error => {
      console.error( 'función enRechazo invocada: ', error );
      return error;
    });

     return devolucion;
   }
};
