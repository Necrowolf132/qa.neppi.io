module.exports = async (ctx, next) => {
    const {apipagotoken} = ctx.request.headers
    if(apipagotoken) {
      const objectBusqueda = {}
      objectBusqueda.generateToken = apipagotoken
      const respuestaData =  await strapi.query("asociados-a-comercio.terminales").findOne(objectBusqueda);

      if (respuestaData) {
        let arrayIdProductos = []
        arrayIdProductos =  respuestaData?.productos.filter(id_producto => {
           return  id_producto?.Codigo_de_producto == "bpmp2p"
        });

        if (arrayIdProductos.length > 0){
                // Go to next policy or will reach the controller's action.
                if(arrayIdProductos[0]?.tasa_de_comision && typeof strapi.query('tasa-de-comisiones').findOne == 'function') {
                  const respuestaComision =  await strapi.query('tasa-de-comisiones').findOne({id: arrayIdProductos[0]?.tasa_de_comision});
                  if(respuestaComision?.tipo_comision && respuestaComision?.monto_valor_comision){
                    ctx.request.body.objectTasaComisiones = { "tipo": respuestaComision?.tipo_comision , "valor": respuestaComision?.monto_valor_comision}
                  }
                }
                ctx.request.body.id_producto = arrayIdProductos[0]?.id
                ctx.request.body.id_user = respuestaData?.id_user?.id
                ctx.request.body.id_terminal = respuestaData?.id;
                ctx.request.body.id_sucursal = respuestaData?.id_sucursal;
                return await next();
        } else {
          return  await ctx.unauthorized(`Token api pago invalido para este producto`);
        
        }
      }
  } else {
      return  await ctx.unauthorized(`Esta petición necesita un token de validación y no lo posee`);
  }
      return  await ctx.unauthorized(`Token api pago invalido`);
  }
