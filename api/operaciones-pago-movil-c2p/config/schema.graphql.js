const { sanitizeEntity } = require('strapi-utils');
module.exports = {
    definition: `
    type OperacionesPagoMovilc2pAll {
        id: ID!
        _id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        nro_referencia_pagomovil: Int! 
        id_store_wp: Int
        ip: String!
        nro_telefono_pagomovil_emisor: Long!
        documento_identidad_pagomovil_receptor: String!
        telefono_pagomovil_tienda: Long!
        tasa_de_cambio_bs_por_dolar_transaccion: Float!
        monto_pagomovil_transaccion_usd: Float!
        monto_pagomovil_transaccion_bs: Float!
        banco_pagomovil_emisor: String!
        banco_pagomovil_receptor: String!
        fecha_realizacion_operacion: DateTime!
        fecha_confirmacion_operacion: DateTime
        id_user: UsersPermissionsUser
        id_terminal: ComponentAsociadosAComercioTerminales
        id_producto_tipo: Productos
        published_at: DateTime
      }
    `,
    query: `
    OperacionesPagoMovilc2pAll(sort: String, limit: Int, start: Int, where: JSON, publicationState: PublicationState): [OperacionesPagoMovilc2pAll]
    `,
    type: {
        OperacionesPagoMovilc2pAll: false
    },
    resolver: {
      Query: {
        OperacionesPagoMovilc2pAll:false,
        OperacionesPagoMovilc2pAll: {
            description: 'Consultar todas las operaciones de pago movil',
            resolverOf: 'application::operaciones-pago-movil-c2p.operaciones-pago-movil-c2p.find',
            resolver: async (obj, options, { context }) => {
                // The `where` and `data` parameters passed as arguments
                // of the GraphQL mutation are available via the `context` object.

                let entities;
                if (context.query._q) {
                entities = await strapi.api["operaciones-pago-movil-c2p"].services["operaciones-pago-movil-c2p"].search(context.query);
                } else {
                entities = await strapi.api["operaciones-pago-movil-c2p"].services["operaciones-pago-movil-c2p"].find(context.query);
                }
                const atributos = strapi.api["operaciones-pago-movil-c2p"].models["operaciones-pago-movil-c2p"].attributes
                const ARRAYCAMPOS = Object.entries(atributos).filter(atributo => {
                    if(atributo[1].type == "relationall") {
                        return atributo
                    }
                })
    
                const eso = entities.map(entity => sanitizeEntity(entity, { model: strapi.models["operaciones-pago-movil-c2p"] }))
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