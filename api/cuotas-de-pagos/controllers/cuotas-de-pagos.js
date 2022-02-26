'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    NeppiBNPLCalcularCuota(ctx) {
          let {cuotaObject, montoPrestamo} = ctx.request.body
        if(!cuotaObject?.cantidad_de_cuotas || !cuotaObject?.dias_para_pago_por_cuato || !cuotaObject?.cantidad_porcentual_de_interes_por_cuota == null || !montoPrestamo ) {
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Parametros faltantes"
            objetoDevolucion.dataEnvio =  ctx.request.body 
            return objetoDevolucion
        }

        const montoPrestamoInterno = parseFloat(Math.round(( parseFloat(montoPrestamo) + Number.EPSILON) * 100) / 100)
        const montoPorCuotaAuxi = parseFloat(montoPrestamoInterno) / cuotaObject?.cantidad_de_cuotas
        
 
        let montoPorCuota = parseFloat(Math.round((montoPorCuotaAuxi + Number.EPSILON) * 100) / 100)
        let InteresPorCuota = parseFloat(Math.round((cuotaObject?.cantidad_porcentual_de_interes_por_cuota + Number.EPSILON) * 100) / 100)
        let montoCuotaReferencia = 0
        const arraCuotasDevolucion = []
        for(let cont = 1; cont <= cuotaObject?.cantidad_de_cuotas; cont++ ){
            let fechaInicio = new Date()
            let fechaDePagoIsoString = fechaInicio.toISOString;
            let montoCuotaPush = 0
            fechaInicio.setDate(fechaInicio.getDate() + (cuotaObject?.dias_para_pago_por_cuato * cont));
            const fechaFinal = fechaInicio.toISOString()
            const fechaFinalDisplay = ((fechaInicio.getDate() > 9) ? fechaInicio.getDate() : ('0' + fechaInicio.getDate())) + '/' + ((fechaInicio.getMonth() > 8) ? (fechaInicio.getMonth() + 1) : ('0' + (fechaInicio.getMonth() + 1))) + '/' + fechaInicio.getFullYear()
            if(cont == cuotaObject?.cantidad_de_cuotas){
                if(parseFloat(Math.round(((montoCuotaReferencia + montoPorCuota) + Number.EPSILON) * 100) / 100) == montoPrestamoInterno){
                    montoCuotaPush = montoPorCuota
                } else {
                    let montoAnteriorCuotaActual = montoCuotaReferencia + montoPorCuota
                    let  montoCuotaPushAuxi = montoPorCuota + (montoPrestamoInterno - montoAnteriorCuotaActual)
                    montoCuotaPush =  parseFloat(Math.round((montoCuotaPushAuxi + Number.EPSILON) * 100) / 100)
                }
            } else {
                montoCuotaReferencia =  parseFloat(Math.round(((montoCuotaReferencia + montoPorCuota) + Number.EPSILON) * 100) / 100)
                montoCuotaPush = montoPorCuota
            }
            const ExtraInteres = parseFloat(Math.round(((montoCuotaPush * (InteresPorCuota / 100)) + Number.EPSILON) * 100) / 100)
            montoCuotaPush = parseFloat(Math.round(((montoCuotaPush + ExtraInteres) + Number.EPSILON) * 100) / 100)
            arraCuotasDevolucion.push({ numeroCuota: cont, monto: montoCuotaPush, fechaPago: fechaFinal, fechaFinalDisplay , fechaDePagoIsoString: fechaDePagoIsoString, montoInteres: ExtraInteres, montoInteresPorcentaje: InteresPorCuota})
        }
        return arraCuotasDevolucion

    }

};
