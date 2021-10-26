module.exports = async (ctx, next) => {
  const {apipagotoken} = ctx.request.headers
  let respuestaComercial = undefined;
  let turefalseComisionesEspeciales = false;
  if(apipagotoken) {
    const objectBusqueda = {}
    objectBusqueda.generateToken = apipagotoken
    const respuestaData =  await strapi.query("asociados-a-comercio.terminales").findOne(objectBusqueda);
    if (respuestaData) {
      let arrayIdProductos = []
      arrayIdProductos =  respuestaData?.productos.filter(id_producto => {
          return  id_producto?.Codigo_de_producto == "bcpmp2p" 
      });
      
      if (arrayIdProductos.length > 0){
              // Go to next policy or will reach the controller's action.
              if(respuestaData?.id_sucursal && typeof strapi.query('asociados-a-comercio.sucursales').findOne == 'function') {
                respuestaComercial =  await strapi.query('asociados-a-comercio.sucursales').findOne({id:respuestaData?.id_sucursal});
                if(respuestaComercial?.id_comercio){
                  ctx.request.body.id_comercio = respuestaComercial?.id_comercio
                }
              }
              if(respuestaComercial?.id_comercio && typeof strapi.query('comercio').findOne == 'function') {
                const respuestaComercio =  await strapi.query('comercio').findOne({id:respuestaComercial?.id_comercio});
                if(respuestaComercio?.numero_de_documento_de_identificaion_fiscal){
                  ctx.request.body.numero_de_documento_de_identificaion_fiscal = respuestaComercio?.numero_de_documento_de_identificaion_fiscal
                }
                if(respuestaComercio?.porcentaje_comision_especial){
                  turefalseComisionesEspeciales = respuestaComercio?.porcentaje_comision_especial
                  if(respuestaComercio?.comision_especial && typeof strapi.query('tasa-de-comisiones').findOne == 'function' && turefalseComisionesEspeciales ) {
                    const respuestaComision =  await strapi.query('tasa-de-comisiones').findOne({id: respuestaComercio?.comision_especial?.id});

                    if(respuestaComision?.tipo_comision && respuestaComision?.monto_valor_comision){
                      ctx.request.body.objectTasaComisiones = { "tipo": respuestaComision?.tipo_comision , "valor": respuestaComision?.monto_valor_comision}
                    }
                  }
                }

              }
              if(arrayIdProductos[0]?.tasa_de_comision && typeof strapi.query('tasa-de-comisiones').findOne == 'function' && !turefalseComisionesEspeciales) {
                const respuestaComision =  await strapi.query('tasa-de-comisiones').findOne({id: arrayIdProductos[0]?.tasa_de_comision});
                if(respuestaComision?.tipo_comision && respuestaComision?.monto_valor_comision){
                  ctx.request.body.objectTasaComisiones = { "tipo": respuestaComision?.tipo_comision , "valor": respuestaComision?.monto_valor_comision}
                }
              }
              ctx.request.body.banco_aliado = respuestaData?.banco_aliado?.id ? respuestaData?.banco_aliado?.id : strapi.config.get('sistemDefault.banco_aliado_default', "")
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
};