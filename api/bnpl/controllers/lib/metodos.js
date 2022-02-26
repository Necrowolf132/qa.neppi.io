module.exports = {
            // Called after an entry is created
        async CreateTransaccionRegisterForCIBC(result, objetoComicion, JsonFacturado) {
            let escritura
            if(typeof strapi?.services['registro-de-transacciones']?.register === 'function' && typeof strapi.query("redireccion-de-ordenes").update  === 'function') {
                                       
                const result2 = {
                    codigo_de_api: "0000",
                    tipo_comision: objetoComicion?.tipo,
                    createdAt:  result?.fecha_realizacion_operacion,
                    id_user: result?.user_comprador_id?.id,
                    id_comercio: result?.comercio_id?.id,
                    documento_identidad_comercio_asociado:  result?.comercio_id?.numero_de_documento_de_identificaion_fiscal,
                    id_producto_tipo: result?.producto_id?.id,
                    id: result?.id,
                    id_terminal: result?.id_terminal,
                    id_sucursal: result?.id_sucursal,
                    banco_aliado: result?.adquiriente_bnpl_id?.id,
                    monto_pagomovil_transaccion_bs: result?.monto_completo_compra_cuotas,
                    monto_pagomovil_transaccion_usd: result?.monto_completo_compra_cuotas,
                    monto_comision: objetoComicion?.valor,
                    JsonFactura: JsonFacturado,
                    moneda_principal_transaccion: "USD"
                }

                 escritura = await strapi.services['registro-de-transacciones'].register(result2);
                if(escritura?.id){
                       const DataPaser = await JSON.parse(escritura?.JsonFactura)
                       DataPaser.unshift({ valor: "Referencia de operación", campo:escritura?.id })
                       escritura = await strapi.query("registro-de-transacciones").update(
                                {id: escritura?.id},
                                {
                                    
                                    JsonFactura: JSON.stringify(DataPaser)
                                }
                              )
                } else {
                    console.log("error al registrar la operaciones en la tabla de transacciones");
                    return escritura;
                }
            }
            if ( escritura?.status == 'none') {
                console.log("operacion no necesita ser registrada en la tabla de transacciones");
                return escritura;
            } else if(!escritura) {
                console.log("error al registrar la operaciones en la tabla de transacciones");
                return escritura;
            } else {
                console.log("operacion registrada en la tabla de transacciones");
            }
                return escritura;
        },
}