'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {CreateSchemeValidate} = require("./lib/validationsSchemas")


module.exports = {
    getComercioFromToken: async (ctx) => {
        const objetoDevolucion = new Object()
        const schemaValidateSingle = await CreateSchemeValidate()
        try {
            const validations = schemaValidateSingle.validateSync(ctx.request.body,{abortEarly:false})
            const generateToken = validations.tokenTerminal
            let respuestaData = false
            if(generateToken && typeof strapi.query('asociados-a-comercio.terminales').findOne == 'function') {
                respuestaData =  await strapi.query("asociados-a-comercio.terminales").findOne({generateToken});
                if(respuestaData?.id_sucursal && typeof strapi.query('asociados-a-comercio.sucursales').findOne == 'function') {
                    const respuestaComercial =  await strapi.query('asociados-a-comercio.sucursales').findOne({id:respuestaData?.id_sucursal});
                        if(respuestaComercial?.id_comercio && typeof strapi.query('comercio').findOne == 'function') {
                            const respuestaComercio =  await strapi.query('comercio').findOne({id:respuestaComercial?.id_comercio});
                            if(respuestaComercio?.bank_sheme && respuestaComercio?.account_number && respuestaComercio?.name_titular_bank){
                                objetoDevolucion.status = "Success"
                                objetoDevolucion.mensaje = "datos recuperados satisfactoriamente"
                                objetoDevolucion.dataEnvio =  respuestaComercio
                                objetoDevolucion.id_sucursal_preticion = respuestaComercial?.id
                                objetoDevolucion.id_terminal_preticion = respuestaData?.id
                            } else {
                                objetoDevolucion.status = "error"
                                objetoDevolucion.mensaje = "los parameros de informacion bancaria no se encuentran completamente configurados"
                                objetoDevolucion.dataEnvio =  respuestaComercio 
                                objetoDevolucion.id_sucursal_preticion = respuestaComercial?.id
                                objetoDevolucion.id_terminal_preticion = respuestaData?.id
                            }
                    }
            } else if(!respuestaData && typeof strapi.query('asociados-a-comercio.sucursales').findOne == 'function'){
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje = "no se logro recupera una tienda para el token dado"
                objetoDevolucion.dataEnvio =  ctx.request.body 
            } else if(respuestaData && !typeof strapi.query('asociados-a-comercio.sucursales').findOne == 'function') {
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje = "Error con la funcion sucursales del lado del backend"
                objetoDevolucion.dataEnvio =  ctx.request.body 
            }
        }

        } catch(error) {
            console.log(error)
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = error.errors
            objetoDevolucion.dataEnvio =  ctx.request.body 
        }
        return objetoDevolucion

    },

}
