'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const {CONFIG} = require("./dataApiBpConfig")
const criptojs = require("crypto-js")


const convertirDolaresBolivares = async (totalPago, tasaBolivaresCobro)=>{
    const numero = parseFloat(totalPago) * parseFloat(tasaBolivaresCobro)

    return numero.toFixed(4)
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
const getTasaAutomatica = () => {
    return 1225.05
}

module.exports = {
    comprobacionTasaDolar: (tasamanual,tasaAutomatica) => {
        tasamanual =  parseFloat(tasamanual)
        if(tasamanual && tasamanual != 'NaN '&&  typeof  parseFloat(tasamanual) == "number"){
            return parseFloat(tasamanual)
        } else if(tasaAutomatica && typeof tasaAutomatica == "boolean") {
            return getTasaAutomatica()
        } else {
            return 1
        }
    },

    generateSignatureAndHeadersComprobacion: (body) => {
        const nonce = (Date.now() * 1000).toString()
        let signature = `/${CONFIG.API_PATH}${nonce}${JSON.stringify(body)}`
        const sig = criptojs.HmacSHA384(signature, CONFIG.API_AUTH).toString()
        return {
            apikey: CONFIG.API_KEY_ID,
            apisignature: sig,
            nonce: nonce,
            ContentType : 'application/json',
        }
    },
    generateSignatureAndHeadersNoBody: () => {
        const nonce = (Date.now() * 1000).toString()
        let signature = `/${CONFIG.API_PATH_BANCOS}${nonce}`
        const sig = criptojs.HmacSHA384(signature, CONFIG.API_AUTH).toString()
        return {
            apikey: CONFIG.API_KEY_ID,
            apisignature: sig,
            nonce: nonce,
            ContentType : 'application/json',
        }
    },
    generatePhoneNumForm: (NumeroTeleConsulta) => {
        const patron = /^0{1,1}/g;
        const sustitucion = '0058';

        return NumeroTeleConsulta.replace(patron, sustitucion);
    },
    generateDocForm: (storeDocumento, tipo) => {
        if(tipo == "j"){
            const patron = /^J{1,1}|^j{1,1}/g;
            const sustitucion = 'J00';
            return storeDocumento.replace(patron, sustitucion)
        } else if(tipo == "v") {
            const patron = /^v{1,1}|^V{1,1}/g;
            const sustitucion = 'V';
            return storeDocumento.replace(patron, sustitucion); 
        } else {
            return storeDocumento
        }
    },


    insertarBasedeDatosSuccess: async(codigoApi, mensajeApi, referencia, objetoDeConsulta, tasaBolivaresCobro, id_terminal, id_user, id_producto, id_sucursal , ip, storeDocumento, montoDeudaTotal, bancoOrigen, bancoDestino, fecha, objectTasaComisiones) => {
        const nombreTabla = CONFIG.MODEL_ID;
            let documentoInsert = new Object()
            const year = fecha.substring(0,4)
            const mes = fecha.substring(5,7) 
            const dia = fecha.substring(8,10) 
            const hora = fecha.substring(11,13)
            const min = fecha.substring(14,16)
            const seg = fecha.substring(17,19)
            const apiFecha = new Date(`${year}-${mes}-${dia}T${hora}:${min}:${seg}Z`).toISOString()
            documentoInsert.monto_comision = parseFloat(objectTasaComisiones["valor"] ? objectTasaComisiones["valor"] : 0)
            documentoInsert.tipo_comision = objectTasaComisiones["tipo"] ? objectTasaComisiones["tipo"] : ""
            documentoInsert.tasa_de_cambio_bs_por_dolar_transaccion = tasaBolivaresCobro === 1 ? 0 : parseFloat(tasaBolivaresCobro)
            documentoInsert.monto_pagomovil_transaccion_usd =  tasaBolivaresCobro === 1 ? 0 : parseFloat(montoDeudaTotal)
            documentoInsert.monto_pagomovil_transaccion_bs = parseFloat(objetoDeConsulta?.monto)
            documentoInsert.fecha_realizacion_operacion = apiFecha
            documentoInsert.id_terminal = id_terminal
            documentoInsert.mensaje_de_api = mensajeApi
            documentoInsert.codigo_de_api = codigoApi
            documentoInsert.nro_referencia_pagomovil = referencia
            documentoInsert.documento_identidad_pagomovil_receptor = storeDocumento
            documentoInsert.banco_pagomovil_receptor = bancoDestino
            documentoInsert.banco_pagomovil_emisor = bancoOrigen
            documentoInsert.ip = ip
            documentoInsert.nro_telefono_pagomovil_receptor = objetoDeConsulta?.telefonoAfiliado
            documentoInsert.nro_telefono_pagomovil_emisor = objetoDeConsulta?.telefono
            documentoInsert.documento_identidad_pagomovil_receptor = objetoDeConsulta?.idBeneficiario
            documentoInsert.id_user = id_user
            documentoInsert.id_producto_tipo = id_producto
            documentoInsert.id_sucursal = id_sucursal
            documentoInsert.published_at = new Date()
        try {
            const ORMModel = strapi.query(nombreTabla).model;
            const result = await strapi.query(nombreTabla).model.create(documentoInsert)
            ORMModel.lifecycles.afterCreate(result);
            return result
        } catch (error) {
            console.log(error)
            return false
        }

    },
    addComprobacionInvalida: () => {

    },
    addComprobacionValida: () => {

    },
    convertirDolaresBolivares,
    calcularPorciento,
    getTasaAutomatica
}