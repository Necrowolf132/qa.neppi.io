'use strict';
const { sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { generateSignatureAndHeadersBancos} = require("./utils/helpers")
const axios = require('axios').default;
const {CONFIG} = require("./utils/dataApiBpConfig");
const {generateSinglePagoUSD, generateSinglePagoBs} = require("./lib/functionsEndpoints")
const {CreateSchemeValidate} = require("./lib/validationsSchemas")


module.exports = {

    generateSinglePago: async(ctx) => {
        const objetoDevolucion = new Object()
        const  {moneda_principal_transaccion} = ctx.request.body
        ctx.request.body.ip = ctx.request.ip ? ctx.request.ip : "N/A"
        const schemaValidateSingle = await CreateSchemeValidate()
        try {
            const validations = schemaValidateSingle.validateSync(ctx.request.body,{abortEarly:false})
            ctx.request.body = validations
            if(moneda_principal_transaccion) {
                if(moneda_principal_transaccion.toUpperCase().trim() == 'BS') {
                    return await generateSinglePagoBs(ctx)
                } else if(moneda_principal_transaccion.toUpperCase().trim() == 'USD') {
                    return await generateSinglePagoUSD(ctx)
                } else {
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje = "El parametro 'moneda_principal_transaccion' no es un valor valido"
                    objetoDevolucion.dataEnvio =  ctx.request.body
                }
            } else {
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje = "El parametro 'moneda_principal_transaccion' es obligatorio y requerido"
                objetoDevolucion.dataEnvio =  ctx.request.body
    
            }
        } catch(error) {
            console.log(error)
            console.log(error.errors)
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = error.errors
            objetoDevolucion.dataEnvio =  ctx.request.body 
        }
        return objetoDevolucion
    }, 

    find: async(ctx) => {
        // The `where` and `data` parameters passed as arguments
        // of the GraphQL mutation are available via the `context` object.

        let entities;
        if (ctx.query._q) {
        entities = await strapi.api["operaciones-pago-movil-p2p"].services["operaciones-pago-movil-p2p"].search(ctx.query);
        } else {
        entities = await strapi.api["operaciones-pago-movil-p2p"].services["operaciones-pago-movil-p2p"].find(ctx.query);
        }
        const atributos = strapi.api["operaciones-pago-movil-p2p"].models["operaciones-pago-movil-p2p"].attributes
        const ARRAYCAMPOS = Object.entries(atributos).filter(atributo => {
            if(atributo[1].type == "relationall") {
                return atributo
            }
        })

        const eso = entities.map(entity => sanitizeEntity(entity, { model: strapi.models["operaciones-pago-movil-p2p"] }))
        const  devolucion = [];
        for(let Auxi of eso) {
            for (let campo of ARRAYCAMPOS) {
                if(Auxi[campo[0]]){
                    let paso = await strapi.query(campo[1].model).find({id: Auxi[campo[0]]})
                    Auxi[campo[0]] = paso[0]
                    devolucion.push(Auxi)
                }
            }
        }
        return devolucion 
},
getBancosValidos: async(ctx) => {
    const headers = generateSignatureAndHeadersBancos();
    var objetoDevolucion = {};
    let error = false;
    var response = {}
       try {
            response = await axios({
            method: 'get',
            url: CONFIG.API_HOST+CONFIG.API_PATH_BANCOS,
            headers: {
             'api-key': headers.apikey,
             'api-signature': headers.apisignature,
             'nonce': headers.nonce,
             'Content-Type': headers.ContentType
            }
          });
        } catch(error)  {
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = error?.response?.headers?.descripcioncliente
            objetoDevolucion.INFO = { headers: error?.response?.headers, body: error?.response?.data}
            error = true; 

        }
          if( response?.data && !error) {
            if ( response?.headers?.codigorespuesta == '0000' ) { 
                objetoDevolucion.status = "Success"
                objetoDevolucion.mensaje = response?.headers?.descripcioncliente
                objetoDevolucion.INFO =  { headers: response?.headers, body: response?.data}
            } else {
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje =  response?.headers?.descripcioncliente
                objetoDevolucion.INFO = { headers: response?.headers, body: response?.data}

            }
          }

          return objetoDevolucion 
}
};
