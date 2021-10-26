'use strict';

/**
 * token-generator.js controller
 *
 * @description: A set of functions called "actions" of the `token-generator` plugin.
 */
const { v4: uuidv4 } = require('uuid');
module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    const {tableConfirm, field} = ctx.request.body
    let repetido = true;
    let idUnico ="";
  
    while(repetido){

        idUnico = uuidv4();

      let objectBusqueda = `{ "${field}" : "${idUnico}" }`;

      const result =  await strapi.query(tableConfirm).findOne(JSON.parse(objectBusqueda));

      if(!result){
        repetido =false;
      }

    }
    ctx.send({
      token: idUnico
    });
  }
};
