const { sanitizeEntity } = require('strapi-utils');
module.exports = {
    definition: `

      type MyTransaccionesPagomovilConfirmacion {
        id: ID!
        _id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        ip: String!
        nro_telefono_pagomovil_receptor: Long!
        documento_identidad_pagomovil_receptor: String!
        tasa_de_cambio_bs_por_dolar_transaccion: Float!
        estatus: ENUM_TRANSACCIONESPAGOMOVILCONFIRMACION_ESTATUS
        tipo_operacion_pagomovil_confirmacion: ENUM_TRANSACCIONESPAGOMOVILCONFIRMACION_TIPO_OPERACION_PAGOMOVIL_CONFIRMACION
        moneda_principal_transaccion: ENUM_TRANSACCIONESPAGOMOVILCONFIRMACION_MONEDA_PRINCIPAL_TRANSACCION
        monto_pagomovil_transaccion_usd: Float!
        monto_pagomovil_transaccion_bs: Float!
        banco_pagomovil_receptor: String!
        fecha_realizacion_operacion: DateTime!
        fecha_confirmacion_operacion: DateTime
        id_user: UsersPermissionsUser
        id_terminal: String!
        id_sucursal: String!
        id_producto_tipo: Productos
        monto_comision: Float
        tipo_comision: ENUM_TRANSACCIONESPAGOMOVILCONFIRMACION_TIPO_COMISION
        codigo_de_api: String
        mensaje_de_api: String
        documento_identidad_comercio_asociado: String!
        pagos_moviles_asociados_transaccion: [ComponentTransaccionesPagomovilConfirmacionesTransaccionesPagomovilConfirmacionesMultiplesPagos]
        id_comercio: String!
        published_at: DateTime
      }
    `,
    query: `
    MyTransaccionesPagomovilConfirmacion(sort: String, limit: Int, start: Int, where: JSON, publicationState: PublicationState): [MyTransaccionesPagomovilConfirmacion]
    `,
    type: {
        TransaccionesPagomovilConfirmacion: false
    },
    resolver: {
      Query: {
        TransaccionesPagomovilConfirmacion:false,
        MyTransaccionesPagomovilConfirmacion: {
            description: 'Consultar todas las operaciones de pago movil',
            resolverOf: 'application::transacciones_pagomovil_confirmacion.transacciones_pagomovil_confirmacion.find',
            resolver: async (obj, options, { context }) => {
                // The `where` and `data` parameters passed as arguments
                // of the GraphQL mutation are available via the `context` object.

                let entities;
                if (context.query._q) {
                entities = await strapi.api["transacciones_pagomovil_confirmacion"].services["transacciones_pagomovil_confirmacion"].search(context.query);
                } else {
                entities = await strapi.api["transacciones_pagomovil_confirmacion"].services["transacciones_pagomovil_confirmacion"].find(context.query);
                }
                const atributos = strapi.api["transacciones_pagomovil_confirmacion"].models["transacciones_pagomovil_confirmacion"].attributes
                const ARRAYCAMPOS = Object.entries(atributos).filter(atributo => {
                    if(atributo[1].type == "relationall") {
                        return atributo
                    }
                })
    
                const eso = entities.map(entity => sanitizeEntity(entity, { model: strapi.models["transacciones_pagomovil_confirmacion"] }))
                const  devolucion = [];
                for(let Auxi of eso) {
                    for (let campo of ARRAYCAMPOS) {
                        if(Auxi[campo[0]]){
                            let paso = await strapi.query(campo[1].model).find({id: Auxi[campo[0]]})
                            Auxi[campo[0]] = paso[0]
                            devolucion.push(Auxi)
                        }
                    }
                }
                return devolucion 
            }
        }
      },
    },
  };