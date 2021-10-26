const { generateSignatureAndHeadersCobro, generateDocForm, insertarBasedeDatosSuccess, convertirDolaresBolivares, comprobacionTasaDolar, DeterminarMontoBolivaresDolares} = require("../utils/helpers")
const axios = require('axios').default;
const {CONFIG} = require("../utils/dataApiBpConfig");

module.exports = {

    generateSinglePagoBs: async(ctx) => {
        const objetoDeConsulta = new Object()
        const  {storeDocumento, objectTasaComisiones, id_comercio , id_terminal, id_sucursal, id_user, id_producto ,tasaDolares, isConvercionAutomatica, ip, datosCobros, moneda_principal_transaccion, numero_de_documento_de_identificaion_fiscal, banco_aliado} = ctx.request.body
        const tasaBolivaresCobro = comprobacionTasaDolar(tasaDolares,isConvercionAutomatica)
        const MontoConvertido = await convertirDolaresBolivares(datosCobros?.monto,tasaBolivaresCobro, moneda_principal_transaccion, isConvercionAutomatica)

        const  {MontoBolivares, MontoDolares} =   await DeterminarMontoBolivaresDolares(datosCobros?.monto, MontoConvertido,
            moneda_principal_transaccion, isConvercionAutomatica)

         let montoFinal = 0.00

         if(moneda_principal_transaccion.toUpperCase().trim() == 'BS') {
            montoFinal = MontoBolivares
        } else {
            montoFinal = MontoDolares
        }
       // const MONTO_TOTAL_A_PAGAR = await convertirDolaresBolivares(montoDeudaTotal,tasaBolivaresCobro)
        //console.log(ArrayNumeroConsulta, storeDocumento, id_terminal, montoDeudaTotal, tasaBolivaresCobro, ip)
        /* ----- ESTA LOGICA EXISTE AUNQUE YA NO ES NECESARIA.. LLEGA VALIDADO Y FORMATEADO EL NUMERO DESDE EL WORDPRESS ------ 
        let numeroExtraido = extraer_numero_formato(numPhoneBpSelect,numPhoneBp)
        if(!/^0416\d{7,7}|0426\d{7,7}|0424\d{7,7}|0414\d{7,7}|0412\d{7,7}$/g.test(numeroExtraido)){
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Formato de Teléfono celular incorrecto, por favor ingréselo de la siguiente forma, Ejemplo: 0414-1234567"array1.concat(array2)
             
        }*/ 

        objetoDeConsulta.telefonoCobrador = datosCobros?.telefonoCobrador
        objetoDeConsulta.telefonoPagador = datosCobros?.telefonoPagador
        objetoDeConsulta.token = datosCobros?.token
        objetoDeConsulta.id = datosCobros?.id
        objetoDeConsulta.banco = datosCobros?.bancoOrigen
        objetoDeConsulta.motivo = datosCobros?.motivo
        objetoDeConsulta.monto = montoFinal
        objetoDeConsulta.origen = datosCobros?.origen
        //objetoDeConsulta.sucursal = id_sucursal
        //objetoDeConsulta.caja = id_terminal
        objetoDeConsulta.ipCliente = ip
        const headers = generateSignatureAndHeadersCobro(objetoDeConsulta)
        const Docformatiado =  generateDocForm(storeDocumento,"j");
        var objetoDevolucion = {};
        let error = false;
        var response = {}
           try {
                response = await axios({
                method: 'post',
                url: CONFIG.API_HOST+CONFIG.API_PATH+`/${storeDocumento.toString().toUpperCase()}`,
                headers: {
                 'api-key': headers.apikey,
                 'api-signature': headers.apisignature,
                 'nonce': headers.nonce,
                 'Content-Type': headers.ContentType
                },
                timeout: 5000,
                data:JSON.stringify(objetoDeConsulta)
              });
            } catch(error)  {
                if(error?.response) {

                    const escrituraBaseData = await insertarBasedeDatosSuccess( error?.response?.headers?.codigorespuesta,  error?.response?.headers?.descripcioncliente,  error?.response?.data?.referencia,  error?.response?.data?.codigoReverso, objetoDeConsulta, tasaBolivaresCobro, id_terminal, id_user, id_producto, id_sucursal,id_comercio ,ip, storeDocumento, datosCobros?.bancoOrigen, datosCobros?.bancoDestino , error?.response?.headers?.fechahora, objectTasaComisiones, moneda_principal_transaccion, MontoBolivares, MontoDolares, "error", numero_de_documento_de_identificaion_fiscal, banco_aliado)

                    if(escrituraBaseData){
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje = error?.response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "Escritura exitosa"
                        objetoDevolucion.INFO = { headers: error?.response?.headers, body: error?.response?.data, escrituraDB: escrituraBaseData}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                        error = true; 
                    }else{
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje = error?.response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "error al escibir transaccion en base de datos api pago"
                        objetoDevolucion.INFO = { headers: error?.response?.headers, body: error?.response?.data, escrituraDB: escrituraBaseData}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                        error = true; 
                    }
                } else {
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje= "error de conexion con el servicio del banco"
                    objetoDevolucion.dataEnvio = objetoDeConsulta
                    error = true; 

                }

            }
              if( response?.data && !error) {

                    const escrituraBaseData = await insertarBasedeDatosSuccess(response?.headers?.codigorespuesta, response?.headers?.descripcioncliente, response?.data?.referencia, response?.data?.codigoReverso, objetoDeConsulta, tasaBolivaresCobro, id_terminal, id_user, id_producto, id_sucursal,id_comercio ,ip, storeDocumento, datosCobros?.bancoOrigen, datosCobros?.bancoDestino, response?.headers?.fechahora, objectTasaComisiones, moneda_principal_transaccion, MontoBolivares, MontoDolares, "procesado", numero_de_documento_de_identificaion_fiscal, banco_aliado);
                    if(escrituraBaseData){
                         if ( response?.headers?.codigorespuesta == '0000' ) {
                            objetoDevolucion.status = "Success"
                            objetoDevolucion.mensaje = response?.headers?.descripcioncliente
                            objetoDevolucion.mensajedb = "Escritura exitosa"
                            objetoDevolucion.INFO =  { headers: response?.headers, body: response?.data, escrituraDB: escrituraBaseData }
                            objetoDevolucion.dataEnvio = objetoDeConsulta
                        } else {
                            objetoDevolucion.status = "error"
                            objetoDevolucion.mensaje =  response?.headers?.descripcioncliente
                            objetoDevolucion.mensajedb = "Escritura exitosa"
                            objetoDevolucion.INFO = { headers: response?.headers, body: response?.data,  escrituraDB: escrituraBaseData}
                            objetoDevolucion.dataEnvio = objetoDeConsulta
                        }
                    
                } else { 

                    if ( response?.headers?.codigorespuesta == '0000' ) {
                        objetoDevolucion.status = "Success"
                        objetoDevolucion.mensaje =  response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "error al escibir transaccion en base de datos api pago"
                        objetoDevolucion.INFO = { headers: response?.headers, body: response?.data}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                    } else {
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje =  response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "error al escibir transaccion en base de datos api pago"
                        objetoDevolucion.INFO = { headers: response?.headers, body: response?.data}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                    }


                }
              } 


        return objetoDevolucion

    }, 
    generateSinglePagoUSD: async(ctx) => {
        const objetoDeConsulta = new Object()
        const  {storeDocumento, objectTasaComisiones, id_comercio , id_terminal, id_sucursal, id_user, id_producto ,tasaDolares, isConvercionAutomatica, ip, datosCobros, moneda_principal_transaccion, numero_de_documento_de_identificaion_fiscal} = ctx.request.body
        const tasaBolivaresCobro = comprobacionTasaDolar(tasaDolares,isConvercionAutomatica)
        const MontoConvertido = await convertirDolaresBolivares(datosCobros?.monto,tasaBolivaresCobro, moneda_principal_transaccion)

        const  {MontoBolivares, MontoDolares} =  await DeterminarMontoBolivaresDolares(datosCobros?.monto, MontoConvertido,
         moneda_principal_transaccion)
         console.log(MontoBolivares, MontoDolares)
       // const MONTO_TOTAL_A_PAGAR = await convertirDolaresBolivares(montoDeudaTotal,tasaBolivaresCobro)
        //console.log(ArrayNumeroConsulta, storeDocumento, id_terminal, montoDeudaTotal, tasaBolivaresCobro, ip)
        /* ----- ESTA LOGICA EXISTE AUNQUE YA NO ES NECESARIA.. LLEGA VALIDADO Y FORMATEADO EL NUMERO DESDE EL WORDPRESS ------ 
        let numeroExtraido = extraer_numero_formato(numPhoneBpSelect,numPhoneBp)
        if(!/^0416\d{7,7}|0426\d{7,7}|0424\d{7,7}|0414\d{7,7}|0412\d{7,7}$/g.test(numeroExtraido)){
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Formato de Teléfono celular incorrecto, por favor ingréselo de la siguiente forma, Ejemplo: 0414-1234567"array1.concat(array2)
             
        }*/ 

        objetoDeConsulta.telefonoCobrador = datosCobros?.telefonoCobrador
        objetoDeConsulta.telefonoPagador = datosCobros?.telefonoPagador
        objetoDeConsulta.token = datosCobros?.token
        objetoDeConsulta.id = datosCobros?.id
        objetoDeConsulta.banco = datosCobros?.bancoOrigen
        objetoDeConsulta.motivo = datosCobros?.motivo
        objetoDeConsulta.monto = moneda_principal_transaccion.toUpperCase().trim() == 'BS' ? MontoBolivares : MontoDolares
        objetoDeConsulta.origen = datosCobros?.origen
        //objetoDeConsulta.sucursal = id_sucursal
        //objetoDeConsulta.caja = id_terminal
        objetoDeConsulta.ipCliente = ip
        const headers = generateSignatureAndHeadersCobro(objetoDeConsulta)
        const Docformatiado =  generateDocForm(storeDocumento,"j");
        var objetoDevolucion = {};
        let error = false;
        var response = {}
           try {
                response = await axios({
                method: 'post',
                url: CONFIG.API_HOST+CONFIG.API_PATH+`/${storeDocumento.toString().toUpperCase()}`,
                headers: {
                 'api-key': headers.apikey,
                 'api-signature': headers.apisignature,
                 'nonce': headers.nonce,
                 'Content-Type': headers.ContentType
                },
                timeout: 5000,
                data:JSON.stringify(objetoDeConsulta)
              });
            } catch(error)  {
                if(error?.response) {
                  console.log("aqui1")

                    const escrituraBaseData = await insertarBasedeDatosSuccess( error?.response?.headers?.codigorespuesta,  error?.response?.headers?.descripcioncliente,  error?.response?.data?.referencia,  error?.response?.data?.codigoReverso, objetoDeConsulta, tasaBolivaresCobro, id_terminal, id_user, id_producto, id_sucursal,id_comercio ,ip, storeDocumento, datosCobros?.bancoOrigen, datosCobros?.bancoDestino , error?.response?.headers?.fechahora, objectTasaComisiones, moneda_principal_transaccion, MontoBolivares, MontoDolares, numero_de_documento_de_identificaion_fiscal)

                    if(escrituraBaseData){
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje = error?.response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "Escritura exitosa"
                        objetoDevolucion.INFO = { headers: error?.response?.headers, body: error?.response?.data, escrituraDB: escrituraBaseData}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                        error = true; 
                    }else{
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje = error?.response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "error al escibir transaccion en base de datos api pago"
                        objetoDevolucion.INFO = { headers: error?.response?.headers, body: error?.response?.data, escrituraDB: escrituraBaseData}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                        error = true; 
                    }
                } else {
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje= "error de conexion con el servicio del banco"
                    objetoDevolucion.dataEnvio = objetoDeConsulta
                    error = true; 

                }

            }
              if( response?.data && !error) {
                  console.log("aqui2")
                    const escrituraBaseData = await insertarBasedeDatosSuccess(response?.headers?.codigorespuesta, response?.headers?.descripcioncliente, response?.data?.referencia, response?.data?.codigoReverso, objetoDeConsulta, tasaBolivaresCobro, id_terminal, id_user, id_producto, id_sucursal,id_comercio ,ip, storeDocumento, datosCobros?.bancoOrigen, datosCobros?.bancoDestino, response?.headers?.fechahora, objectTasaComisiones, moneda_principal_transaccion, MontoBolivares, MontoDolares, numero_de_documento_de_identificaion_fiscal);
                    if(escrituraBaseData){
                         if ( response?.headers?.codigorespuesta == '0000' ) {
                            objetoDevolucion.status = "Success"
                            objetoDevolucion.mensaje = response?.headers?.descripcioncliente
                            objetoDevolucion.mensajedb = "Escritura exitosa"
                            objetoDevolucion.INFO =  { headers: response?.headers, body: response?.data, escrituraDB: escrituraBaseData }
                            objetoDevolucion.dataEnvio = objetoDeConsulta
                        } else {
                            objetoDevolucion.status = "error"
                            objetoDevolucion.mensaje =  response?.headers?.descripcioncliente
                            objetoDevolucion.mensajedb = "Escritura exitosa"
                            objetoDevolucion.INFO = { headers: response?.headers, body: response?.data,  escrituraDB: escrituraBaseData}
                            objetoDevolucion.dataEnvio = objetoDeConsulta
                        }
                    
                } else { 

                    if ( response?.headers?.codigorespuesta == '0000' ) {
                        objetoDevolucion.status = "Success"
                        objetoDevolucion.mensaje =  response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "error al escibir transaccion en base de datos api pago"
                        objetoDevolucion.INFO = { headers: response?.headers, body: response?.data}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                    } else {
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje =  response?.headers?.descripcioncliente
                        objetoDevolucion.mensajedb = "error al escibir transaccion en base de datos api pago"
                        objetoDevolucion.INFO = { headers: response?.headers, body: response?.data}
                        objetoDevolucion.dataEnvio = objetoDeConsulta
                    }


                }
              } 


        return objetoDevolucion
    }, 

}