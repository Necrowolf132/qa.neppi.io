const {extraer_numero_formato, generateSignatureAndHeaders, generateDocForm, generatePhoneNumForm, extraerPagosUsados, verificarMontoPago, insertarBasedeDatos, convertirDolaresBolivares, comprobacionTasaDolar, DeterminarMontoBolivaresDolares} = require("../utils/helpers")
const axios = require('axios').default;
const {CONFIG} = require("../utils/dataApiBpConfig");

module.exports = {

  
    validateSinglePagoBS: async(ctx) => {
        let objetoDevolucion = new Object();
        const {ArrayNumeroConsulta, documento_identidad_pagomovil_receptor, objectTasaComisiones, id_terminal, id_comercio, id_sucursal, id_user, id_producto, numero_de_documento_de_identificaion_fiscal, nro_telefono_pagomovil_receptor ,montoDeudaTotal,  isConvercionAutomatica, tasaDolares ,ip, moneda_principal_transaccion, tipo_operacion_pagomovil_confirmacion, banco_aliado} = ctx.request.body
        let codigo_de_api, mensaje_de_api = ""
        const tasaBolivaresCobro = comprobacionTasaDolar(tasaDolares,isConvercionAutomatica)
        const MontoConvertido = await convertirDolaresBolivares(montoDeudaTotal,tasaBolivaresCobro, moneda_principal_transaccion, isConvercionAutomatica)
        const  {MontoBolivares, MontoDolares} =  await DeterminarMontoBolivaresDolares(montoDeudaTotal, MontoConvertido,
            moneda_principal_transaccion,isConvercionAutomatica)
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
        const headers = generateSignatureAndHeaders()
        const phoneNumerosForm = []
        for(let valorPagoformatear of ArrayNumeroConsulta ){
            phoneNumerosForm.push(generatePhoneNumForm(valorPagoformatear));
        } 

        const Docformatiado =  generateDocForm(documento_identidad_pagomovil_receptor);
        let totalPagosValidar = [];
        let errorConection = false;
        var response = {}
        for(let phoneNumForm of  phoneNumerosForm){
           try {

                response = await axios({
                method: 'get',
                url: CONFIG.API_HOST+CONFIG.API_PATH+`/${Docformatiado}?tlf=0058${phoneNumForm}&fi=2021-05-25&acc=0&canal=23`,
                headers: {
                 'api-key': headers.apikey,
                 'api-signature': headers.apisignature,
                 'nonce': headers.nonce,
                 'Content-Type': headers.ContentType
                },
                timeout: 50000 
              });
            } catch(error)  {
                console.log(error)
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje ='Connection error.'
                objetoDevolucion.INFO = [error?.response?.headers]
                codigo_de_api = error?.response?.headers?.codigorespuesta
                mensaje_de_api = error?.response?.headers?.descripcioncliente
                errorConection = true;
                await insertarBasedeDatos([], codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "error", tipo_operacion_pagomovil_confirmacion, banco_aliado)
                ctx.send( objetoDevolucion )
                break;
            }

              if( response?.data  && response?.headers ) {
                codigo_de_api = "0000"
                mensaje_de_api = "Operacion Exitosa"
                let headers =  response?.headers 
                let body =  response?.data
                if ( headers?.codigorespuesta === '0000' ) { 
                    totalPagosValidar = totalPagosValidar.concat(body?.pagos)
                } else {
                    console.log(response)
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje = headers?.descripcioncliente
                    objetoDevolucion.INFO = [headers]
                    errorConection = true;
                    ctx.send( objetoDevolucion )
                    break;
                }
              } else {
                let headers =  response?.headers 
                codigo_de_api = response?.headers?.codigorespuesta
                mensaje_de_api = response?.headers?.descripcioncliente
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje ='Connection error.'
                objetoDevolucion.INFO = [headers]
                errorConection = true;
                await insertarBasedeDatos([], codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "error", "Error desde api banco plaza" ,tipo_operacion_pagomovil_confirmacion, banco_aliado)
                ctx.send( objetoDevolucion )
                break;
              }
        }
            if(!errorConection) {
                if(totalPagosValidar.length > 0) {
                    const pagosExtraidos = await extraerPagosUsados(totalPagosValidar,documento_identidad_pagomovil_receptor,nro_telefono_pagomovil_receptor, id_terminal);
                    
                    if(pagosExtraidos.length !== 0){

                        var pagosComprobados = await verificarMontoPago(pagosExtraidos, montoFinal,tipo_operacion_pagomovil_confirmacion );

                        if( pagosComprobados?.excede !== "excede"){
                            if( pagosComprobados.arrayDevolucion.length > 0){
  
                                const PagosDescontados = await insertarBasedeDatos(pagosComprobados.arrayDevolucion, codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "procesado", "Pago realizado satisfactoriamente" , tipo_operacion_pagomovil_confirmacion, banco_aliado)

                                if(PagosDescontados){
                                    objetoDevolucion.status = "Success"
                                    objetoDevolucion.mensaje ='Pago realizado satisfactoriamente'
                                    objetoDevolucion.INFO = totalPagosValidar
                                    objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                    objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                    objetoDevolucion.PagosEscritos = PagosDescontados
                                    objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
        
                                } else {
                                    codigo_de_api = "error"
                                    mensaje_de_api = "Hubo un error en el registro de su pago en base de datos"
                                    objetoDevolucion.status = codigo_de_api
                                    objetoDevolucion.mensaje = mensaje_de_api   
                                    objetoDevolucion.INFO = totalPagosValidar
                                    objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                    objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                    objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                                    await insertarBasedeDatos(pagosComprobados.arrayDevolucion, codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "error", objetoDevolucion.mensaje ,tipo_operacion_pagomovil_confirmacion, banco_aliado)
 
                                }
                            } else {
                                objetoDevolucion.status = "error"
                                objetoDevolucion.mensaje ='El monto enviado mediante Pago Móvil es insuficiente, por favor verifica. El pago es de Bs. '+pagosComprobados?.montoTotalPago+' y su deuda es de Bs. '+ pagosComprobados?.montoTotalAPagar
                                objetoDevolucion.INFO = totalPagosValidar
                                objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                objetoDevolucion.PagosDescontados = pagosComprobados?.arrayDevolucion
                                await insertarBasedeDatos(pagosComprobados.arrayDevolucion, codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "error", objetoDevolucion.mensaje,tipo_operacion_pagomovil_confirmacion, banco_aliado)
                        } 
                        } else {
                            objetoDevolucion.status = "error"
                            objetoDevolucion.mensaje ='El Monto enviado mediante Pago Móvil no corresponde con el monto a pagar, por favor verifique. El monto exacto a pagar es de Bs. '+ pagosComprobados?.montoTotalAPagar+' y su monto pagado es de Bs. ' +  pagosComprobados?.montoTotalPago
                            objetoDevolucion.INFO = totalPagosValidar
                            objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                            objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                            objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                            await insertarBasedeDatos(pagosComprobados.arrayDevolucion, codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "error",objetoDevolucion.mensaje ,tipo_operacion_pagomovil_confirmacion, banco_aliado)
                        }

                    } else {
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje ='El o los pagos enviados fueron utilizados en otra compra.'
                        objetoDevolucion.INFO = totalPagosValidar
                        await insertarBasedeDatos([], codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "error", objetoDevolucion.mensaje,tipo_operacion_pagomovil_confirmacion, banco_aliado)
                    }
                } else {
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje ='La tienda no ha recibido ninguna transacción de Pago Móvil con ese monto desde el teléfono suministrado por usted'
                    objetoDevolucion.INFO = totalPagosValidar
                    await insertarBasedeDatos([], codigo_de_api, mensaje_de_api ,MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, "error", objetoDevolucion.mensaje,tipo_operacion_pagomovil_confirmacion, banco_aliado)
                    
                }
            }
        ctx.send( objetoDevolucion )
    }, 

    validateSinglePagoUSD: async(ctx) => {
        let objetoDevolucion = new Object();
        const {ArrayNumeroConsulta, storeDocumento, id_terminal, montoDeudaTotal, tasaBolivaresCobro, ip} = ctx.request.body
       // const MONTO_TOTAL_A_PAGAR = await convertirDolaresBolivares(montoDeudaTotal,tasaBolivaresCobro)
        //console.log(ArrayNumeroConsulta, storeDocumento, id_terminal, montoDeudaTotal, tasaBolivaresCobro, ip)
        /* ----- ESTA LOGICA EXISTE AUNQUE YA NO ES NECESARIA.. LLEGA VALIDADO Y FORMATEADO EL NUMERO DESDE EL WORDPRESS ------ 
        let numeroExtraido = extraer_numero_formato(numPhoneBpSelect,numPhoneBp)
        if(!/^0416\d{7,7}|0426\d{7,7}|0424\d{7,7}|0414\d{7,7}|0412\d{7,7}$/g.test(numeroExtraido)){
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Formato de Teléfono celular incorrecto, por favor ingréselo de la siguiente forma, Ejemplo: 0414-1234567"array1.concat(array2)
        }*/ 
        const headers = generateSignatureAndHeaders()
        const phoneNumerosForm = []
        for(let valorPagoformatear of ArrayNumeroConsulta ){
            phoneNumerosForm.push(generatePhoneNumForm(valorPagoformatear));
        } 
        const Docformatiado =  generateDocForm(storeDocumento);
        let totalPagosValidar = [];
        let errorConection = false;
        var response = {}
        for(let phoneNumForm of  phoneNumerosForm){
           try {
        console.log( CONFIG.API_HOST+CONFIG.API_PATH+`/${Docformatiado}?tlf=0058${phoneNumForm}&fi=2021-05-25&acc=0`)

                response = await axios({
                method: 'get',
                url: CONFIG.API_HOST+CONFIG.API_PATH+`/${Docformatiado}?tlf=0058${phoneNumForm}&fi=2021-05-25&acc=0&canal=23`,
                headers: {
                 'api-key': headers.apikey,
                 'api-signature': headers.apisignature,
                 'nonce': headers.nonce,
                 'Content-Type': headers.ContentType
                },
                timeout: 50000 
              });
            } catch(error)  {
                console.log(error)
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje ='Connection error.'
                objetoDevolucion.INFO = [error?.response?.headers]
                errorConection = true;
                ctx.send( objetoDevolucion )
                break;
            }

              if( response?.data  && response?.headers ) {
                let headers =  response?.headers 
                let body =  response?.data
                if ( headers?.codigorespuesta === '0000' ) { 
                    totalPagosValidar = totalPagosValidar.concat(body?.pagos)
                } else {
                    console.log(response)
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje = headers?.descripcioncliente
                    objetoDevolucion.INFO = [headers]
                    errorConection = true;
                    ctx.send( objetoDevolucion )
                    break;
                }
              } else {
                let headers =  response?.headers 
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje ='Connection error.'
                objetoDevolucion.INFO = [headers]
                errorConection = true;
                ctx.send( objetoDevolucion )
                break;
              }
        }
            if(!errorConection) {
                if(totalPagosValidar.length > 0) {
                    const pagosExtraidos = await extraerPagosUsados(totalPagosValidar,storeDocumento,id_terminal);
                    
                    if(pagosExtraidos.length !== 0){

                        var pagosComprobados = await verificarMontoPago(pagosExtraidos, montoDeudaTotal, tasaBolivaresCobro,phoneNumerosForm.length > 1 ? true : false);

                        if( pagosComprobados?.excede !== "excede"){
                            if( pagosComprobados.arrayDevolucion.length > 0){
                                console.log(pagonsComprovados)
                                const PagosDescontados = await insertarBasedeDatos(pagosComprobados.arrayDevolucion, montoDeudaTotal, tasaBolivaresCobro, id_terminal, ip, storeDocumento)

                                if(PagosDescontados){
                                    objetoDevolucion.status = "Success"
                                    objetoDevolucion.mensaje ='Pago realizado satisfactoriamente'
                                    objetoDevolucion.INFO = totalPagosValidar
                                    objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                    objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                    objetoDevolucion.PagosEscritos = PagosDescontados
                                    objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
        
                                } else {
                                    objetoDevolucion.status = "error"
                                    objetoDevolucion.mensaje ='Hubo un error en el registro de su pago en base de datos'
                                    objetoDevolucion.INFO = totalPagosValidar
                                    objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                    objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                    objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                                }
                            } else {
                                objetoDevolucion.status = "error"
                                objetoDevolucion.mensaje ='El monto enviado mediante Pago Móvil es insuficiente, por favor verifica. El pago es de Bs. '+pagosComprobados?.montoTotalPago+' y si deuda es de Bs. '+ pagosComprobados?.montoTotalPago
                                objetoDevolucion.INFO = totalPagosValidar
                                objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                        } 
                        } else {
                            objetoDevolucion.status = "error"
                            objetoDevolucion.mensaje ='El Monto enviado mediante Pago Móvil no corresponde con el monto a pagar, por favor verifique. El monto exacto a pagar es de Bs. '+ pagosComprobados?.montoTotalAPagar+' y su monto pagado es de Bs. ' +  pagosComprobados?.montoTotalPago
                            objetoDevolucion.INFO = totalPagosValidar
                            objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                            objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                            objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                        }

                    } else {
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje ='El o los pagos enviados fueron utilizados en otra compra.'
                        objetoDevolucion.INFO = totalPagosValidar
                    }
                } else {
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje ='La tienda no ha recibido ninguna transacción de Pago Móvil con ese monto desde el teléfono suministrado por usted'
                    objetoDevolucion.INFO = totalPagosValidar
                    
                }
            }
        ctx.send( objetoDevolucion )
    }, 

}