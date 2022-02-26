module.exports = {
    async ExtraerTasaComocionIDproducto (ctx) {
    const {producto_id} = ctx.request.body
    if(producto_id) {
                    if(typeof strapi.query('productos').findOne == 'function') {
                        const respuestaProducto =  await strapi.query('productos').findOne({id: producto_id});
                        if(respuestaProducto?.tasa_de_comision?.tipo_comision && respuestaProducto?.tasa_de_comision?.monto_valor_comision){
                            ctx.request.body.objectTasaComisiones = { "tipo": respuestaProducto?.tasa_de_comision?.tipo_comision , "valor": respuestaProducto?.tasa_de_comision?.monto_valor_comision}
     
                               return { estatus: true, ctx, mensaje: "Add comision"}
                        } else {
                            return { estatus: false, ctx, mensaje: "Imposible guardar 'objetoComision' en el contexto de la peticion"};
                        }
                    } else {
                         return  { estatus: false, ctx, mensaje: "Funcion 'productos' no encontrada"}
                    }
   
                //return await next();

        } else {
          return  { estatus: false, ctx, mensaje: "Parametro 'producto_id' es necesario y no pudo ser encontrado"};
        
        }
      }

  }
