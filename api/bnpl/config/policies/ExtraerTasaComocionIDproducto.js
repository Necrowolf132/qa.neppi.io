const {ExtraerTasaComocionIDproducto} =  require("./../../../../lib/Middle/extractores.js")

module.exports = async (ctx, next) => {
                  const desider = await ExtraerTasaComocionIDproducto(ctx)
                  if(desider.estatus){
                    return await next(desider.ctx);
                  } else {
                    return  await desider.ctx.unauthorized(desider.mensaje);
                  }
  };
