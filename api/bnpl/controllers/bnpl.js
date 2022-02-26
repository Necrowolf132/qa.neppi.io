'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default
const qs = require('qs');
const {CreateTransaccionRegisterForCIBC} = require('./lib/metodos.js')
const {SaveNeppiBnpl} =  require('./NeppiBnpl/NeppiBnpl.js')
const MyFormatNumber =  new Intl.NumberFormat('en-EN', {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })

module.exports = {

    CIBCgenerateConcentID: async (ctx) => {
        const objetoDevolucion = new Object()
        const {amount, infoComercio, jwtCIBC} = ctx.request.body
        if(!infoComercio?.account_number || !infoComercio?.bank_sheme || !infoComercio?.name_titular_bank || !jwtCIBC || !amount ) {
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Parametros faltantes"
            objetoDevolucion.dataEnvio =  ctx.request.body 
            return objetoDevolucion
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
        
        const response = await axios(config)
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
    },

    CIBCverificarEstado: async (ctx) => {
        const objetoDevolucion = new Object()
        let contador = 0
        if(!ctx?.contador) {
            contador = ctx?.contador
        }
        if(contador > 5) {
            objetoDevolucion.status = "Error"
            objetoDevolucion.mensaje = "Se excedio el maximo de intentos de verificacion"
            objetoDevolucion.dataEnvio = {} 
            return objetoDevolucion
        }
        const {fecha_realizacion_operacion, access_token_CIBC, referenceUrl, proveedor, monto, userComprador, id_terminal, id_comercio, id_sucursal, producto_id, pais, objectTasaComisiones} = ctx.request.body
        if(!access_token_CIBC || !referenceUrl || !proveedor || !monto || !userComprador || !id_terminal || !id_comercio || !id_sucursal || !fecha_realizacion_operacion || !producto_id || !pais || !objectTasaComisiones) {
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Parametros faltantes"
            objetoDevolucion.dataEnvio =  ctx.request.body 
            return objetoDevolucion
        }
        const montoFinal = parseFloat(Math.round((parseFloat(monto) + Number.EPSILON) * 100) / 100)
        var config = {
            method: 'get',
            url: referenceUrl,
            headers: { 
              'Authorization': 'Bearer ' + access_token_CIBC, 
              'x-fapi-financial-id': 'TBD'
            }
          };
    try {
        

        const response = await axios(config)

        if(response.data?.Data?.Status == "AcceptedSettlementCompleted"){
            if(typeof strapi.query('bnpl').create == 'function') {
                const objetoGuardadoBNPL = {
                    adquiriente_bnpl_id: proveedor,
                    data_operacion_origen:  JSON.stringify(response.data),
                    monto_compra_real: montoFinal,
                    monto_completo_compra_cuotas: montoFinal,
                    user_comprador_id: userComprador,
                    id_terminal: id_terminal,
                    comercio_id: id_comercio,
                    id_sucursal,
                    fecha_realizacion_operacion,
                    status_bnpl: "pagado",
                    producto_id,
                    pais
                } 
                const dataGuardadaDevolver1 = await strapi.query('bnpl').create(objetoGuardadoBNPL)
                if(dataGuardadaDevolver1?.id){
                    const JsonFacturadoObject = [
                        {valor: "Proveedor de pago",  campo :dataGuardadaDevolver1?.adquiriente_bnpl_id?.nombre},
                        {valor: "Metodo de pago",  campo :dataGuardadaDevolver1?.producto_id?.nombre},
                        {valor: "Monto total del prestamo",  campo : MyFormatNumber.format(dataGuardadaDevolver1?.monto_compra_real)+" $"},
                        {valor: "Nombre de usuario pagador",  campo :dataGuardadaDevolver1?.user_comprador_id?.nombre+" "+dataGuardadaDevolver1?.user_comprador_id?.apellido},
                        {valor: "Email de usuario pagador",  campo :dataGuardadaDevolver1?.user_comprador_id?.email},
                        {valor: "Comercio receptor de la opración",  campo :dataGuardadaDevolver1?.comercio_id?.razon_social},
                        {valor: "Identificador del comercio receptor",  campo :dataGuardadaDevolver1?.comercio_id?.numero_de_documento_de_identificaion_fiscal},
                        {valor: "Estatus de opración",  campo : "Aprobado"},
                    ]
                    const JsonFacturado = JSON.stringify(JsonFacturadoObject)
                    const dataGuardadaDevolver2 = await CreateTransaccionRegisterForCIBC(dataGuardadaDevolver1, objectTasaComisiones, JsonFacturado)

                    if(dataGuardadaDevolver2?.id && dataGuardadaDevolver2?.JsonFactura){
                        objetoDevolucion.status = "Success"
                        objetoDevolucion.mensaje = "Generacion satisfactoria"
                        objetoDevolucion.dataEnvio = {data: dataGuardadaDevolver1, id_factura_info: dataGuardadaDevolver2?.id }
                    } else {
                        objetoDevolucion.status = "Error"
                        objetoDevolucion.mensaje = "Creacion de registro en tabla de trasaccione fallido"
                        objetoDevolucion.dataEnvio = {}
                    }

                  } else {
                    objetoDevolucion.status = "Error"
                    objetoDevolucion.mensaje = "Operacion no logro ser actializada en base de datos "
                    objetoDevolucion.dataEnvio = {} 
                  }

            } else {
                objetoDevolucion.status = "Error"
                objetoDevolucion.mensaje = "Funcion de guardado para la tabla BNPL no existente"
                objetoDevolucion.dataEnvio = {} 
            }
        } else {
            contador ++
            ctx.contador = contador
            objetoDevolucion = await CIBCverificarEstado(ctx)
        }
    } 
    catch (error) {
        console.log(error)
        if(error?.response?.data){
            objetoDevolucion.dataError = error?.response?.data
        } else {
            objetoDevolucion.dataError = "error al generar la consulta http hacia " + referenceUrl
        }
        objetoDevolucion.status = "Error"
        objetoDevolucion.mensaje = "error al generar la consulta http hacia " + referenceUrl
        objetoDevolucion.dataEnvio = {} 

    }
        return objetoDevolucion
    },


    CIBCconfirmacionOperation: async (ctx) => {
        const objetoDevolucion = new Object()
        const {idoperation, idconcentimiento, urlenvio} = ctx.request.body
        if(!idoperation || !idconcentimiento || !urlenvio ) {
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Parametros faltantes"
            objetoDevolucion.dataEnvio =  ctx.request.body 
            return objetoDevolucion
        }

            const dataCanje = qs.stringify({
                'client_id': strapi.config.get('sistemDefault.CLIENT_ID_CIBC', ""),
                'client_secret': strapi.config.get('sistemDefault.CLIENT_SECRET_CIBC', ""),
                'redirect_uri': urlenvio,
                'grant_type': 'authorization_code',
                'code': idconcentimiento 
            });

    const config1 = {
        method: 'post',
        url: 'https://api.cibc.useinfinite.io/token',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : dataCanje
      };
    try {

        const response = await axios(config1)

        if(response.data?.access_token){
            if(typeof strapi.query('redireccion-de-ordenes').find == 'function'){
                const respuestaOrdenRedirect =  await strapi.query("redireccion-de-ordenes").find({id: idoperation , utilizada: false});
                const ValorArrayCero = respuestaOrdenRedirect[0]
                if(ValorArrayCero?.data_original_encriptada){
                    const generalData = await JSON.parse(ValorArrayCero.generalData)
    

                    const dataFirma = JSON.stringify({
                        Data: {
                          ConsentId: generalData?.Data?.ConsentId,
                          Initiation: generalData?.Data?.Initiation
                        },
                        Risk: generalData?.Risk
                      });
                      
                      const config2 = {
                        method: 'post',
                        url: 'https://api.cibc.useinfinite.io/open-banking/v3.1/pisp/bnpl-payments',
                        headers: { 
                          'Authorization': 'Bearer ' + response.data?.access_token, 
                          'x-fapi-financial-id': 'TBD', 
                          'Content-Type': 'application/json', 
                          'x-jws-signature': 'DUMMY_SIG', 
                          'x-idempotency-key':  uuidv4()
                        },
                        data : dataFirma
                      };
                   try {
                        const responseFirma = await axios(config2)
                        if(responseFirma.data?.Data?.DomesticPaymentId && responseFirma.data?.Data?.Status == "AcceptedSettlementInProcess" && responseFirma.data?.Links?.Self){
                            
                            const DataRedirectUpdate = await strapi.query("redireccion-de-ordenes").update(
                                {id:idoperation},
                                {
                                    utilizada: true,
                                    generalData: JSON.stringify(responseFirma.data)
                                }
                              )
                            
                              if(DataRedirectUpdate?.id){
                                objetoDevolucion.status = "Success"
                                objetoDevolucion.mensaje = "Generacion satisfactoria"
                                objetoDevolucion.dataEnvio = {DataRedirectUpdate, access_token_CIBC: response.data?.access_token} 
                              } else {
                                objetoDevolucion.status = "Error"
                                objetoDevolucion.mensaje = "Operacion no logro ser actializada en base de datos "
                                objetoDevolucion.dataEnvio = {} 
                              }

                        } else {
                            objetoDevolucion.status = "Error"
                            objetoDevolucion.mensaje = "Operacion no logro ser autorizada "
                            if(responseFirma.data?.Errors){
                                objetoDevolucion.dataError = responseFirma.data?.Message + " " + responseFirma.data?.Errors[0]?.ErrorCode
                            } else if(responseFirma.data?.Data?.Status) {

                                objetoDevolucion.dataError = "Su operacion no logro ser autorizada. El estatus de su operacion es:" + responseFirma.data?.Data?.Status
                            } else {
                                objetoDevolucion.dataError = responseFirma.data?.Message
                            }
                            objetoDevolucion.dataEnvio = {} 
                        }
                   }
                    catch (error) {
                        console.log(error)
                        objetoDevolucion.status = "Error"
                        if(error?.response?.data?.Message){
                            objetoDevolucion.dataError = error?.response?.data?.Message
                        } else {
                            objetoDevolucion.dataError =  "error al generar la consulta http hacia https://api.cibc.useinfinite.io/open-banking/v3.1/pisp/bnpl-payments"
                        }
                        objetoDevolucion.mensaje = "error al generar la consulta http hacia https://api.cibc.useinfinite.io/open-banking/v3.1/pisp/bnpl-payments"
                        objetoDevolucion.dataEnvio = {} 
                
                    }
                } else {
                    objetoDevolucion.status = "Error"
                    objetoDevolucion.mensaje = "No se hayo una operacion en la tabla de redirecciones en estado de espera"
                    objetoDevolucion.dataEnvio = {} 
                }
            } else {
                objetoDevolucion.status = "Error"
                objetoDevolucion.mensaje = "Base de datos redireccion-de-ordenes no encontrada"
                objetoDevolucion.dataEnvio = {} 
            }
        } else {
            objetoDevolucion.status = "Error"
            objetoDevolucion.mensaje = "Access_token no fue generado por error en le backend"
            objetoDevolucion.dataEnvio = {} 
        }
/*         objetoDevolucion.status = "Success"
         objetoDevolucion.mensaje = "Generacion satisfactoria"
         objetoDevolucion.dataEnvio = response?.data */
    } 
    catch (error) {
        console.log(error)
        objetoDevolucion.status = "Error"
        if(error?.response?.data?.error_description){
            objetoDevolucion.dataError = error?.response?.data?.error_description
        } else {
            objetoDevolucion.dataError = "error al generar la consulta http hacia https://api.cibc.useinfinite.io/token"
        }
        objetoDevolucion.mensaje = "error al generar la consulta http hacia https://api.cibc.useinfinite.io/token"
        objetoDevolucion.dataEnvio = {} 

    }
        return objetoDevolucion
    },
    SaveNeppiBnpl,

};

