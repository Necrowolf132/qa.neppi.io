'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { v4: uuidv4 } = require('uuid');
const {CreateSchemeValidate} = require("./lib/validationsSchemas")
const axios = require('axios').default

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
                            } else {
                                objetoDevolucion.status = "error"
                                objetoDevolucion.mensaje = "los parameros de informacion bancaria no se encuentran completamente configurados"
                                objetoDevolucion.dataEnvio =  respuestaComercio 
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

    generateConcentID: async (ctx) => {
        const objetoDevolucion = new Object()
        const {amount, infoComercio, jwtCIBC} = ctx.request.body
        if(!infoComercio?.account_number || !infoComercio?.bank_sheme || !infoComercio?.name_titular_bank || !jwtCIBC || !amount ) {
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Parametros faltantes"
            objetoDevolucion.dataEnvio =  ctx.request.body 
        }
            const data = JSON.stringify({
            "Data": {
                "Initiation": {
                "InstructionIdentification": "instr-identification",
                "EndToEndIdentification": "e2e-identification",
                "InstructedAmount": {
                    "Amount": amount,
                    "Currency": "CAD"
                },
                "DebtorAccount": null,
                "CreditorAccount": {
                    "SchemeName": infoComercio?.bank_sheme,
                    "Identification": infoComercio?.account_number,
                    "Name":  infoComercio?.name_titular_bank,
                    "SecondaryIdentification": "secondary-identif"
                },
                "RemittanceInformation": {
                    "Unstructured": "Tools",
                    "Reference": "Tools"
                }
                }
            },
            "Risk": {
                "PaymentContextCode": "EcommerceGoods",
                "MerchantCategoryCode": null,
                "MerchantCustomerIdentification": null,
                "DeliveryAddress": null
            }
            });

    const config = {
        method: 'post',
        url: 'https://api.cibc.useinfinite.io/open-banking/v3.1/pisp/bnpl-payment-consents',
        headers: { 
            'Authorization': 'Bearer '+ jwtCIBC, 
            'x-fapi-financial-id': 'TBD', 
            'Content-Type': 'application/json', 
            'x-jws-signature': 'DUMMY_SIG', 
            'x-idempotency-key': uuidv4()
        },
        data : data
    }
    try {
        
        console.log(config)
        const response = await axios(config)
        console.log(response)
         objetoDevolucion.status = "Success"
         objetoDevolucion.mensaje = "Generacion satisfactoria"
         objetoDevolucion.dataEnvio = response?.data 
    } 
    catch (error) {
        console.log(error)
        objetoDevolucion.status = "Error"
        objetoDevolucion.mensaje = "error al generar la consulta http hacia https://api.cibc.useinfinite.io/open-banking/v3.1/pisp/bnpl-payment-consents"
        objetoDevolucion.dataEnvio = {} 

    }
        return objetoDevolucion
    }
};
