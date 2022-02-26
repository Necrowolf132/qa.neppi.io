
const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default
const {CreateTransaccionRegisterForCIBC} = require('./../lib/metodos.js')

module.exports = {

    SaveNeppiBnpl: async (ctx) => {
        const objetoDevolucion = new Object()
        const {adquiriente_bnpl_id, monto_compra_real, cuotas_de_pago, user_comprador_id, id_terminal, id_sucursal, comercio_id, producto_id, pais, objectTasaComisiones} = ctx.request.body
        if(!adquiriente_bnpl_id || !monto_compra_real || !cuotas_de_pago || !user_comprador_id  || !id_terminal || !comercio_id || !id_sucursal || !producto_id || !pais || !objectTasaComisiones) {
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Parametros faltantes"
            objetoDevolucion.dataEnvio =  ctx.request.body 
            return objetoDevolucion
        }
        let monto_completo_compra_cuotas = 0
        let tiene_interes = false
        let porcentaje_interes_completo = 0;
        for(let Cuota of cuotas_de_pago){
            monto_completo_compra_cuotas =  monto_completo_compra_cuotas + parseFloat(Cuota?.monto_a_pagar)

            if(Cuota?.porcentage_interes > 0){
                tiene_interes = true
                porcentaje_interes_completo = Cuota?.porcentage_interes
            }
        }
        const monto_utilidad_final_al_finalizar_bnpl = parseFloat(Math.round((parseFloat(monto_completo_compra_cuotas - parseFloat(monto_compra_real)) + Number.EPSILON) * 100) / 100)

        const montoFinal = parseFloat(Math.round((parseFloat(monto_compra_real) + Number.EPSILON) * 100) / 100)
    try {
        


            if(typeof strapi.query('bnpl').create == 'function') {
                const objetoGuardadoBNPL = {
                    adquiriente_bnpl_id,
                    monto_compra_real: montoFinal ,
                    cuotas_de_pago,
                    monto_completo_compra_cuotas: parseFloat(Math.round((parseFloat(monto_completo_compra_cuotas) + Number.EPSILON) * 100) / 100),
                    user_comprador_id,
                    balance_por_pagar: parseFloat(Math.round((parseFloat(monto_completo_compra_cuotas) + Number.EPSILON) * 100) / 100),
                    id_terminal,
                    comercio_id,
                    id_sucursal,
                    tiene_interes,
                    porcentaje_interes_completo,
                    monto_completo_compra_cuotas,
                    monto_utilidad_final_al_finalizar_bnpl,
                    fecha_realizacion_operacion: new Date().toISOString(),
                    status_bnpl: "sin_pagar",
                    producto_id,
                    pais
                } 
                const dataGuardadaDevolver1 = await strapi.query('bnpl').create(objetoGuardadoBNPL)
                if(dataGuardadaDevolver1?.id){
                    const monto_compra_real =  new Intl.NumberFormat('en-EN', {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dataGuardadaDevolver1?.monto_compra_real);
                    const monto_completo_compra_cuotas =  new Intl.NumberFormat('en-EN', {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dataGuardadaDevolver1?.monto_completo_compra_cuotas);
                    const monto_utilidad_final_al_finalizar_bnpl = new Intl.NumberFormat('en-EN', {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dataGuardadaDevolver1?.monto_utilidad_final_al_finalizar_bnpl)

                    const JsonFacturadoObject = [
                        {valor: "Proveedor de pago",  campo :dataGuardadaDevolver1?.adquiriente_bnpl_id?.nombre},
                        {valor: "Metodo de pago",  campo :dataGuardadaDevolver1?.producto_id?.nombre},
                        {valor: "Monto total del prestamo",  campo :monto_compra_real+" $"},
                        {valor: "Monto total a pagar",  campo :monto_completo_compra_cuotas+" $"},
                        {valor: "Porcentaje total de interes",  campo :dataGuardadaDevolver1?.porcentaje_interes_completo+"%"},
                        {valor: "Monto de intereses",  campo :monto_utilidad_final_al_finalizar_bnpl+" $"},
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
    } 
    catch (error) {
        console.log(error)
         objetoDevolucion.dataError = error.toString
        objetoDevolucion.status = "Error"
        objetoDevolucion.mensaje = "error interno al generar el guardado en la table 'BNPL' " 
        objetoDevolucion.dataEnvio = {} 

    }
        return objetoDevolucion
    },


  
};