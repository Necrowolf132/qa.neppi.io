'use strict';


/**
 * token-generator.js controller
 *
 * @description: A set of functions called "actions" of the `token-generator` plugin.
 */
module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */
  setDataInputInit: async(ctx) => {
    const {tabla, campoDisplay, id, campoTabla } = ctx.request.body
    let ArrayDevolucion = []; 
    if(id){
      const objectBusqueda = new Object();
      objectBusqueda[campoTabla]=id;
      const result =  await strapi.query(tabla).find(objectBusqueda);
      result.forEach((currentValue, index) =>{
        ArrayDevolucion[index] = {
          _id: currentValue._id,
          id: currentValue._id
        }
        if(campoDisplay == "_id_string"){
          ArrayDevolucion[index]["_id_string"]=currentValue["id"];
        } else {
          ArrayDevolucion[index][campoDisplay]=currentValue[campoDisplay];
        }
      }) 
    }
    ctx.send(ArrayDevolucion[0]);
  },


  index: async (ctx) => {

    const {tabla, campoDisplay, value, idInstancia, limiter, start, parametroRequerido, no_contains} = ctx.request.body

    let ArrayDevolucion = []; 
    let Busqueda = "";
    if(value){
     // Busqueda = new RegExp("^" + value + ".*$", "g");
    
    ///^M.*[\S]$/gi
    //[{ 
    //  id: "608203d828a6470061f6b390"
    //  username: "apipagowebsite369"
    //  _id: "608203d828a6470061f6b390" array1.includes(2)
    //}]
    const objectBusqueda = new Object();
    
    //objectBusqueda[campoDisplay] = Busqueda;
    var objectSize = 0;
    var ejecutar = true;

    if(idInstancia) {
      
      for (let campoInstanciaidInstanciaAuxi of idInstancia){
        if(campoInstanciaidInstanciaAuxi?.campoInstanciaAsociada?.is_array){

          objectBusqueda[campoInstanciaidInstanciaAuxi.campo+"_in"] = campoInstanciaidInstanciaAuxi.valor ;
        } else {
          objectBusqueda[campoInstanciaidInstanciaAuxi.campo] = campoInstanciaidInstanciaAuxi.valor ;
        }
    }
  }
  for (let parametroRequeridoAuxi  of parametroRequerido){
    var requerido = false;
      for (let campoInstanciaidInstanciaAuxi of idInstancia){
        if(campoInstanciaidInstanciaAuxi.campo == parametroRequeridoAuxi){
          requerido = true 
        };
      }
      if(requerido == false){
        ejecutar = false
        break;
      }
    }


    if(!no_contains) {
      objectBusqueda[campoDisplay+"_contains"]=value;
    }
    if(limiter) {
      objectBusqueda["_limit"] = limiter;
    }
    if(start) {
      objectBusqueda["_start"] = start;
    }

    if(ejecutar){

      const result =  await strapi.query(tabla).find(objectBusqueda);

      result.forEach((currentValue, index) =>{

        ArrayDevolucion[index] = {
          _id: currentValue._id,
          id: currentValue._id
        }
        if(campoDisplay == "_id_string"){
          ArrayDevolucion[index]["_id_string"]=currentValue["id"];
        } else {
          ArrayDevolucion[index][campoDisplay]=currentValue[campoDisplay];
        }

      }) 
    }
    //  if(!result){
    //    repetido =false;
    //  }

    }

    ctx.send(ArrayDevolucion);
  }
};
