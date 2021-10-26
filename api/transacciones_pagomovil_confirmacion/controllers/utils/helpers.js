'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const {CONFIG} = require("./dataApiBpConfig")
const criptojs = require("crypto-js")


const convertirDolaresBolivares = async (totalPago, tasaBolivaresCobro, moneda_principal_transaccion, isConvercionAutomatica)=>{
    let numero = undefined
    if(moneda_principal_transaccion) {
        if(moneda_principal_transaccion.toUpperCase().trim() == 'BS' && !isConvercionAutomatica) {
             numero = Math.round(((parseFloat(totalPago) / parseFloat(tasaBolivaresCobro)) + Number.EPSILON) * 100) / 100  
        } else if(moneda_principal_transaccion.toUpperCase().trim() == 'BS' && isConvercionAutomatica) {
            numero = Math.round(((parseFloat(totalPago) * parseFloat(tasaBolivaresCobro)) + Number.EPSILON) * 100) / 100
       } else if(moneda_principal_transaccion.toUpperCase().trim() == 'USD') {
             numero = Math.round(((parseFloat(totalPago) * parseFloat(tasaBolivaresCobro)) + Number.EPSILON) * 100) / 100
        }
    }
    return numero
}

const DeterminarMontoBolivaresDolares = async (monto_Monto, MontoConvertido, moneda_principal_transaccion, isConvercionAutomatica )=>{
    let objetoDevolucion = {} 
    if(moneda_principal_transaccion) {
        if(moneda_principal_transaccion.toUpperCase().trim() == 'BS' && !isConvercionAutomatica) {
            objetoDevolucion.MontoBolivares =  parseFloat(Math.round((monto_Monto + Number.EPSILON) * 100) / 100)
            objetoDevolucion.MontoDolares = parseFloat(Math.round((MontoConvertido + Number.EPSILON) * 100) / 100)
        } else if(moneda_principal_transaccion.toUpperCase().trim() == 'BS' && isConvercionAutomatica) {
            objetoDevolucion.MontoBolivares = parseFloat(Math.round((MontoConvertido + Number.EPSILON) * 100) / 100)
            objetoDevolucion.MontoDolares = parseFloat(Math.round((monto_Monto + Number.EPSILON) * 100) / 100)
        } else if(moneda_principal_transaccion.toUpperCase().trim() == 'USD') {
            objetoDevolucion.MontoBolivares = parseFloat(Math.round((MontoConvertido + Number.EPSILON) * 100) / 100)
            objetoDevolucion.MontoDolares = parseFloat(Math.round((monto_Monto + Number.EPSILON) * 100) / 100)
        }
    }

    return objetoDevolucion
}

const calcularPorciento = async (totalSumado, monto_bolivares) => {
    const sobra =  parseFloat(totalSumado) - parseFloat(monto_bolivares);
    const porcentage = (0.2 * parseFloat(monto_bolivares) ) / 100;

    if( parseFloat(sobra) > parseFloat(porcentage)){
        return true;
    }else{
        return false;
    }
}
const getInfoTerminal =  async (id_terminal) => {
    const tabla = CONFIG.MODEL_ID_terminales
    return await strapi.query(tabla).findOne({ id: id_terminal})

}
const prepararArrayComponent = (arrayPagosEscogidos, tasaBolivaresCobro, moneda_principal_transaccion, transacciones_pagomovil_confirmaciones_id)=>{
    const arrayDevolucion = []
    for (let arrayPaso of arrayPagosEscogidos) {
       let  objetoAux = {}
       let year = arrayPaso?.fecha.substring(0,4)

       let mes = arrayPaso?.fecha.substring(4,6)

       let dia = arrayPaso?.fecha.substring(6,8)

       let hora = arrayPaso?.hora.substring(0,2)

       let min = arrayPaso?.hora.substring(2,4)

       const seg = arrayPaso?.hora.substring(4,6)

       let montoDolares = parseFloat(parseFloat(arrayPaso?.monto) / parseFloat(tasaBolivaresCobro) )
       objetoAux.monto_pagomovil_transaccion_usd = Math.round(((montoDolares + Number.EPSILON) * 100) / 100)
       objetoAux.monto_pagomovil_transaccion_bs = parseFloat(arrayPaso?.monto)
       objetoAux.fecha_realizacion_operacion = new Date(`${year}-${mes}-${dia}T${hora}:${min}:${seg}Z`)
       objetoAux.tasa_de_cambio_bs_por_dolar_transaccion =  parseFloat(tasaBolivaresCobro )
       objetoAux.tasa_de_cambio_bs_por_dolar_transaccion =  parseFloat(tasaBolivaresCobro )
       objetoAux.estatus = "procesado"
       objetoAux.moneda_principal_transaccion = moneda_principal_transaccion.toString().toUpperCase()
       objetoAux.banco_pagomovil_emisor = arrayPaso?.banco
       objetoAux.documento_identidad_pagomovil_emisor = ""      
       objetoAux.id_firma_pagomovil_confirmacion = ""
       objetoAux.nro_referencia_pagomovil = parseInt(arrayPaso?.referencia)
       objetoAux.nro_telefono_pagomovil_emisor = parseInt(arrayPaso?.telefonoCliente)
       objetoAux.nro_telefono_pagomovil_emisor = parseInt(arrayPaso?.telefonoCliente)       
       objetoAux.transacciones_pagomovil_confirmaciones_id = transacciones_pagomovil_confirmaciones_id
       arrayDevolucion.push(objetoAux)
    }
    return arrayDevolucion;
}
const getTasaAutomatica = () => {
    return 4.05
}

module.exports = {
    comprobacionTasaDolar: (tasamanual) => {
        tasamanual =  parseFloat(tasamanual)
        if(tasamanual && tasamanual != 'NaN '&&  typeof  parseFloat(tasamanual) == "number"){
            return parseFloat(tasamanual)
        } else {
            return getTasaAutomatica()
        }
    },
    generarComprobacion: async(ArrayComprobar) => {
        const arrayConsultasObject = []
        for(let ArrayComprobar of ArrayNumeroConsulta ){
            let objetoDeCreacionAux = {}
            objetoDeCreacionAux.body = {}
            objetoDeCreacionAux.body["telefonoAfiliado"] = valorPagoformatear?.telefono;
            objetoDeCreacionAux.body["banco"] = valorPagoformatear?.banco
            if(telefonoCliente){
                objetoDeCreacionAux.body["telefonoCliente"]  = generatePhoneNumForm(telefonoCliente);
            }
            if(valorPagoformatear?.monto) {
                objetoDeCreacionAux.body["monto"]  = valorPagoformatear?.monto;
            }
            objetoDeCreacionAux.body["canal"] = 12
            objetoDeCreacionAux.ref = valorPagoformatear.ref
            objetoDeCreacionAux.signature = generateSignatureAndHeadersComprobacion(objetoDeCreacionAux.body)
            arrayConsultasObject.push(objetoDeCreacionAux)
        } 
        const Docformatiado =  generateDocForm(storeDocumento);
        let totalPagosValidos = [];
        let totalPagosImbalidos = [];
        let errorConection = false;
        var response = {}
        for(let consultaUtilNow of  arrayConsultasObject){
           try {
                response = await axios({
                method: 'post',
                url: CONFIG.API_HOST+CONFIG.API_PATH+`/${Docformatiado}/ref-${consultaUtilNow.ref}`,
                headers: {
                 'api-key': consultaUtilNow.signature.apikey,
                 'api-signature': consultaUtilNow.signature.apisignature,
                 'nonce': consultaUtilNow.signature.nonce,
                 'Content-Type': consultaUtilNow.signature.ContentType
                }, 
                data: JSON.stringify(consultaUtilNow.body) 
              });
            } catch(error)  {
                errorConection = true
                if( error?.response ){
                    console.log("confirmacion error response")
                    if ( error?.response?.headers?.codigorespuesta !== '0000' && error?.response?.headers?.codigorespuesta ) { 
                        console.log("confirmacion error codigo NO 0000")
                        console.log(error)
                        totalPagosImbalidos = totalPagosImbalidos.concat({ref: consultaUtilNow.ref, codigo: error?.response?.headers?.codigorespuesta, mensaje: error?.response?.headers?.descripcionsistema, } )
                    } else {
                        console.log("confirmacion error codigo quien sabe")
                        totalPagosImbalidos = totalPagosImbalidos.concat({ref:consultaUtilNow.ref, codigo: "ERRORCONECTION", mensaje: "NO se logro conectar satisfactoriamente con le servicio del banco plaza"} )                      
                    }

                } else {
                    console.log("confirmacion error sin response")
                    totalPagosImbalidos = totalPagosImbalidos.concat({ref:consultaUtilNow.ref, codigo: "ERRORCONECTION", mensaje: "NO se logro conectar satisfactoriamente con le servicio del banco plaza"} )
                } 
            }
              if( response?.data && !errorConection ) {
                console.log("confirmacion data")
                if ( response?.headers?.codigorespuesta === '0000' ) { 
                    console.log("confirmacion codigo 0000")
                    totalPagosValidos = totalPagosValidos.concat({ref:consultaUtilNow.ref, codigo: response?.headers?.codigorespuesta, mensaje: response?.headers?.descripcionsistema, body: response?.data})
                } else {
                    console.log("confirmacion codigo quien sabe")
                    console.log(response?.data)
                }
              } else if(!response?.data && !errorConection) {
                console.log("confirmacion sin data")
                console.log(response?.data)
              }
              errorConection = false
        }
        objetoDevolucion = {totalPagosValidos, totalPagosImbalidos}
            
        ctx.send( objetoDevolucion )
    }, 

    extraer_numero_formato: (numPhoneBpSelect,numPhoneBp) => {
        return numPhoneBpSelect+numPhoneBp.replace("-", "");
    },
    generateSignatureAndHeaders: () => {
        const nonce = (Date.now() * 1000).toString()
        let signature = `/${CONFIG.API_PATH}${nonce}`
        const sig = criptojs.HmacSHA384(signature, CONFIG.API_AUTH_TOKEN).toString()
        return {
            apikey: CONFIG.API_KEY_ID,
            apisignature: sig,
            nonce: nonce,
            ContentType : 'application/json',
        }
    },
    generatePhoneNumForm: (NumeroTeleConsulta) => {
        const patron = /^0{1,1}/g;
        const sustitucion = '058';

        return NumeroTeleConsulta.replace(patron, sustitucion);
    },
    generateDocForm: (storeDocumento) => {
        const patron = /^J{1,1}|^j{1,1}/g;
        const sustitucion = 'J00';
        return storeDocumento.toString().replace(patron, sustitucion);
    },
    extraerPagosUsados: async (pagosArray,documento_identidad_pagomovil_receptor,nro_telefono_pagomovil_receptor,id_terminal)=>{
        console.log(pagosArray)
       const nombreTabla = CONFIG.MODEL_ID;
       const $or = new Array()
       for (let value of pagosArray) {
        let $andObject = new Object()
        $andObject.$and = []
        const year = value?.fecha.substring(0,4)

         const mes = value?.fecha.substring(4,6)

         const dia = value?.fecha.substring(6,8)

         const hora = value?.hora.substring(0,2)

         const min = value?.hora.substring(2,4)

         const seg = value?.hora.substring(4,6)
        

         $andObject.$and.push({'array_pagos_moviles_asociados_transaccion.nro_referencia_pagomovil': parseInt(value?.referencia) })
         $andObject.$and.push({'array_pagos_moviles_asociados_transaccion.banco_pagomovil_emisor': value?.banco.toString() })
         $andObject.$and.push({'array_pagos_moviles_asociados_transaccion.nro_telefono_pagomovil_emisor': parseInt( value?.telefonoCliente) })
         $andObject.$and.push({'array_pagos_moviles_asociados_transaccion.fecha_realizacion_operacion': new Date(`${year}-${mes}-${dia}T${hora}:${min}:${seg}Z`) })
         $andObject.$and.push({'array_pagos_moviles_asociados_transaccion.monto_pagomovil_transaccion_bs': parseFloat(value?.monto) })
         $or.push($andObject)
         /* 
            ObejtoConsulta.pagos_moviles_asociados_transaccion.nro_referencia_pagomovil_in.push(parseInt(value?.referencia))  
            ObejtoConsulta.pagos_moviles_asociados_transaccion.banco_pagomovil_emisor_in.push( value?.banco )
            ObejtoConsulta.pagos_moviles_asociados_transaccion.nro_telefono_pagomovil_emisor_in.push( parseInt(value?.telefonoCliente) )
            ObejtoConsulta.pagos_moviles_asociados_transaccion.fecha_realizacion_operacion_in.push( new Date(`${year}-${mes}-${dia}T${hora}:${min}:${seg}Z`).toISOString() )
            ObejtoConsulta.pagos_moviles_asociados_transaccion.monto_pagomovil_transaccion_bs_in.push( parseFloat(value?.monto) )
            
        */       
        }

        console.log(JSON.stringify([{$lookup: 
            {
             from: 'transacciones_pagomovil_confirmaciones_multiples_pagos',
             localField : 'pagos_moviles_asociados_transaccion.ref',
             foreignField : '_id',
             as: 'array_pagos_moviles_asociados_transaccion'
             }
         },
         {
          $match: { $and: [{$or : $or},
           {'documento_identidad_pagomovil_receptor': documento_identidad_pagomovil_receptor.toString() },
           {'nro_telefono_pagomovil_receptor': parseInt( nro_telefono_pagomovil_receptor) } 
          ] 
          }
          }]))

        const result = await strapi.query(nombreTabla).model.aggregate([
            {$lookup: 
                {
                 from: 'transacciones_pagomovil_confirmaciones_multiples_pagos',
                 localField : 'pagos_moviles_asociados_transaccion.ref',
                 foreignField : '_id',
                 as: 'array_pagos_moviles_asociados_transaccion'
                 }
             },
             {
              $match: { $and: [{$or : $or},
               {'documento_identidad_pagomovil_receptor': documento_identidad_pagomovil_receptor.toString() },
               {'nro_telefono_pagomovil_receptor': parseInt( nro_telefono_pagomovil_receptor) } 
              ] 
              }
              }
            ]);
            console.log(result)
        const ArrayDevolucion = [];
        var encontrado = false;

        for (let valuePagoArray of pagosArray) {
            const year = valuePagoArray?.fecha.substring(0,4)
            const mes = valuePagoArray?.fecha.substring(4,6) 
            const dia = valuePagoArray?.fecha.substring(6,8) 
            const hora = valuePagoArray?.hora.substring(0,2) 
            const min = valuePagoArray?.hora.substring(2,4)
            const seg = valuePagoArray?.hora.substring(4,6)
            const apiFecha = new Date(`${year}-${mes}-${dia}T${hora}:${min}:${seg}Z`).toISOString()
            for (let valueConsulta of result) {
                for (let valuepagos_moviles_asociados_transaccion of valueConsulta?.array_pagos_moviles_asociados_transaccion ) {
                    if(valuePagoArray?.referencia == valuepagos_moviles_asociados_transaccion?.nro_referencia_pagomovil && valuePagoArray?.banco == valuepagos_moviles_asociados_transaccion?.banco_pagomovil_emisor && valuePagoArray?.monto == valuepagos_moviles_asociados_transaccion?.monto_pagomovil_transaccion_bs && valuePagoArray?.telefonoCliente == valuepagos_moviles_asociados_transaccion?.nro_telefono_pagomovil_emisor && valuepagos_moviles_asociados_transaccion?.fecha_realizacion_operacion.toISOString() == apiFecha ) {
                        encontrado = true;
                    }
                }
                
            }
            if(!encontrado) {
                ArrayDevolucion.push(valuePagoArray);
            } else {
                encontrado = false;
            }
        }
        console.log(ArrayDevolucion)
        return ArrayDevolucion;
    },

    verificarMontoPago: async (pagosExtraidos, monto_bolivares_usb, tipo_operacion_pagomovil_confirmacion )=>{
        var ArrayDevolucion = []
        var totalSumado = 0;
        if(tipo_operacion_pagomovil_confirmacion || !tipo_operacion_pagomovil_confirmacion ){
            const pagoPorNumero={};
            var ultimoAgregador='';
            const arrayAgregados = [];
            for (let valor of pagosExtraidos) {
                if(valor?.telefonoCliente != ultimoAgregador) {
                    pagoPorNumero[valor["telefonoCliente"]] = [];
                    pagoPorNumero[valor["telefonoCliente"]].push(valor);
                    ultimoAgregador = valor["telefonoCliente"];
                    arrayAgregados.push(valor["telefonoCliente"]);
                } else {
                    pagoPorNumero[valor["telefonoCliente"]].push(valor);
                }
            }
            var contador1 = 0;
            var fin = false;
            var existeValor = false;


            do{

                for( let idNumero of arrayAgregados){
                    if (tipo_operacion_pagomovil_confirmacion == "simple") {
                        if( pagoPorNumero[idNumero][contador1]){
                            existeValor = true;
                            totalSumado = pagoPorNumero[idNumero][contador1]["monto"]
                            if(parseFloat(totalSumado) >= parseFloat(monto_bolivares_usb)){
                                ArrayDevolucion.push(pagoPorNumero[idNumero][contador1]);
                                    fin=true;
                                    break;
                            }
                            
                        }
                    } else {
                        if( pagoPorNumero[idNumero][contador1]){
                            existeValor = true;
                            totalSumado = parseFloat(totalSumado) + parseFloat(pagoPorNumero[idNumero][contador1]["monto"]);
                            ArrayDevolucion.push(pagoPorNumero[idNumero][contador1]);
                            if(parseFloat(totalSumado) >= parseFloat(monto_bolivares_usb)){
                                    fin=true;
                                    break;
                            }
                            
                        }
                    }
                }
                if(!existeValor && !fin){
                    fin=true;
                    ArrayDevolucion = [];
                }else{
                    if(await calcularPorciento(parseFloat(totalSumado),parseFloat(monto_bolivares_usb))){
                        return { excede : "excede", arrayDevolucion:ArrayDevolucion,  montoTotalPago:parseFloat(totalSumado), montoTotalAPagar: parseFloat(monto_bolivares_usb) };
                    }
                    existeValor = false;
                }
                    contador1++;
            }while(!fin);
            console.log(ArrayDevolucion)
            return { arrayDevolucion : ArrayDevolucion, montoTotalPago:parseFloat(totalSumado), montoTotalAPagar: parseFloat(monto_bolivares_usb) };

        }else{ 
            /* ESTA LOGICA YA NO ES NECESARIA PERO SE DEJA COMO UN RESPALDO
            for(let valor of pagosExtraidos) {
                if( parseFloat(valor?.monto) >= parseFloat(monto_bolivares_usb)) {
                    if(calcularPorciento(parseFloat(valor?.monto) ,parseFloat(monto_bolivares_usb))){
                        return "excede";
                    } else {
                        totalSumado  = parseFloat(valor?.monto);
                        ArrayDevolucion.push(valor);
                    }

                    break;
                }
            }
            return { arrayDevolucion : ArrayDevolucion, montoTotalPago:parseFloat(totalSumado) };*/
        }
    },
    
    insertarBasedeDatos: async(arrayPagos, codigo_de_api, mensaje_de_api, MontoBolivares, MontoDolares, tasaBolivaresCobro, objectTasaComisiones ,id_terminal, id_comercio, id_sucursal, id_producto, id_user, numero_de_documento_de_identificaion_fiscal, ip, documento_identidad_pagomovil_receptor, nro_telefono_pagomovil_receptor, moneda_principal_transaccion, estatus, mensaje_de_estatus_interno, tipo_operacion_pagomovil_confirmacion, banco_aliado) => {
        const nombreTabla = CONFIG.MODEL_ID;
        //const ArryParaGuardar = prepararArrayComponent(arrayPagos, tasaBolivaresCobro, moneda_principal_transaccion, transacciones_pagomovil_confirmaciones_id)

                let documentoInsert = new Object()
                documentoInsert.banco_aliado = banco_aliado
                documentoInsert.mensaje_de_estatus_interno = mensaje_de_estatus_interno
                documentoInsert.tasa_de_cambio_bs_por_dolar_transaccion = parseFloat(tasaBolivaresCobro)
                documentoInsert.monto_pagomovil_transaccion_usd = parseFloat(MontoDolares)
                documentoInsert.estatus = estatus
                documentoInsert.tipo_operacion_pagomovil_confirmacion = tipo_operacion_pagomovil_confirmacion
                documentoInsert.moneda_principal_transaccion = moneda_principal_transaccion.toString().toUpperCase()
               //documentoInsert. monto_pagomovil_transacción_usd = parseFloat( await convertirDolaresBolivares(montoDeudaTotal,tasaBolivaresCobro))
                documentoInsert.monto_pagomovil_transaccion_bs = parseFloat(MontoBolivares)
                documentoInsert.tipo_comision = objectTasaComisiones["tipo"] ? objectTasaComisiones["tipo"] : ""
                documentoInsert.monto_comision = parseFloat(objectTasaComisiones["valor"] ? objectTasaComisiones["valor"] : 0)
                documentoInsert.id_terminal = id_terminal
                documentoInsert.id_comercio = id_comercio
                documentoInsert.id_sucursal = id_sucursal
                documentoInsert.id_user = id_user
                documentoInsert.id_producto_tipo = id_producto
                documentoInsert.banco_pagomovil_receptor = "0138"
                documentoInsert.codigo_de_api = codigo_de_api
                documentoInsert.mensaje_de_api = mensaje_de_api
                documentoInsert.ip = ip
                documentoInsert.documento_identidad_comercio_asociado = numero_de_documento_de_identificaion_fiscal
                documentoInsert.nro_telefono_pagomovil_receptor = nro_telefono_pagomovil_receptor
                documentoInsert.documento_identidad_pagomovil_receptor = documento_identidad_pagomovil_receptor
                documentoInsert.fecha_confirmacion_operacion = new Date()
                documentoInsert.published_at = new Date()
        try {
            const result = await strapi.query(nombreTabla).model.create(documentoInsert)

            if(result?.id){

                const arryPagosInsertar = prepararArrayComponent(arrayPagos, tasaBolivaresCobro, moneda_principal_transaccion, result?.id)
                try {
                    const result2 = await strapi.query(nombreTabla).update({_id: result?.id},{pagos_moviles_asociados_transaccion: arryPagosInsertar})
                    if(result2?.estatus == "procesado"){
                        //const ORMModel = strapi.query(nombreTabla).model;
                        //await ORMModel.lifecycles.afterCreate(result);
                        let escritura = false 
                        if(typeof strapi?.services['registro-de-transacciones']?.register === 'function') {
                            escritura = await strapi.services['registro-de-transacciones'].register(result2);
                       }
                       if ( escritura?.status == 'none') {
                           console.log("operacion no necesita ser registrada en la tabla de transacciones");
                       } else if(!escritura) {
                           console.log("error al registrar la operaciones en la tabla de transacciones");
                       } else {
                           console.log("operacion registrada en la tabla de transacciones");
                       }
                    }
                    return result2
                } catch (error) {
                    console.log(error)
                    return false
                }
            } else {
                return false
            }
        } catch (error) {
            console.log(error)
            return false
        }

    },
    convertirDolaresBolivares,
    calcularPorciento,
    DeterminarMontoBolivaresDolares
}