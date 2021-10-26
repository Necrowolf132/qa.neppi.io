'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
    
    register: async(result) => {
        if (result?.codigo_de_api == "0000" && typeof strapi.query("registro-de-transacciones").model.create === 'function') {
            let montoTotalComision = 0
            let montoRestante = 0
            if(result?.tipo_comision == "porcentual") {
                montoTotalComision = (parseFloat(result?.monto_pagomovil_transaccion_bs) * parseFloat(result?.monto_comision)) / 100
                montoRestante = parseFloat(result?.monto_pagomovil_transaccion_bs) - parseFloat(montoTotalComision)
            } else if (result?.tipo_comision == "monto_fijo") {
                montoRestante = parseFloat(result?.monto_pagomovil_transaccion_bs) - parseFloat(result?.monto_comision)
                montoTotalComision = result?.monto_comision
            }
            const objetoEscritura = {}
            objetoEscritura.moneda_principal_transaccion = result.moneda_principal_transaccion
            objetoEscritura.fecha_realizacion_transaccion = result?.createdAt.toISOString()
            objetoEscritura.id_usuario = result?.id_user
            objetoEscritura.id_comercio = result?.id_comercio
            objetoEscritura.documento_identidad_comercio_asociado = result?.documento_identidad_comercio_asociado
            objetoEscritura.id_producto_tipo = result?.id_producto_tipo
            objetoEscritura.id_transaccion_del_producto = result?.id
            objetoEscritura.monto_ganado_comision = montoRestante
            objetoEscritura.id_terminal = result?.id_terminal
            objetoEscritura.id_sucursal = result?.id_sucursal
            objetoEscritura.banco_aliado = result?.banco_aliado
            objetoEscritura.monto_transaccion_bs = result?.monto_pagomovil_transaccion_bs 
            objetoEscritura.monto_transaccion_usd = result?.monto_pagomovil_transaccion_usd
            objetoEscritura.monto_comision = result?.monto_comision 
            objetoEscritura.tipo_comision = result?.tipo_comision
            objetoEscritura.total_comision_calculada = montoTotalComision
            objetoEscritura.status_comision = result?.status_comision ? result.status_comision : "no_cobrada"
            try {
                const result = await strapi.query("registro-de-transacciones").model.create(objetoEscritura)
                return result
            } catch (error) {
                console.log(error)
                return false
            }
        } else {
            return {status: "none"}
        }
    }

};
