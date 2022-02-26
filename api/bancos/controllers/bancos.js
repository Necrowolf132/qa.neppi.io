'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    getBancosForCountry: async(ctx) => {
        const arrayDevolucion = []
        if ( typeof strapi.query('bancos').find == 'function' && typeof strapi.query('paises').find == 'function') {
            const bancosSinArreglar =  await strapi.query('bancos').find({estatus: "activo"})

            const paises =  await strapi.query('paises').find()

            for (let Pais of paises) {
               let arrayBancosPais = bancosSinArreglar.filter(banco => banco?.pais_id?.id == Pais?.id);
               if(arrayBancosPais.length > 0 ){
                arrayDevolucion.push({...Pais, Bancos: arrayBancosPais})
               }
            }
            return { status: true, dataEnvio: arrayDevolucion}
        } else {
            return { status: false, dataEnvio: arrayDevolucion}
        }
    }

};
