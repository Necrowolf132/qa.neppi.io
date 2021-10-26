'use strict';
const { sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const {validateSinglePagoBS, validateSinglePagoUSD} = require("./lib/functionsEndpoints")
const axios = require('axios').default;
const {CONFIG} = require("./utils/dataApiBpConfig");
const {CreateSchemeValidate} = require("./lib/validationsSchemas")

module.exports = {
    validateSinglePago: async(ctx) => {
        const objetoDevolucion = new Object()
        const  {moneda_principal_transaccion} = ctx.request.body
        ctx.request.body.ip = ctx.request.ip ? ctx.request.ip : "N/A"
        const schemaValidateSingle = await CreateSchemeValidate()
        try {
            const validations = schemaValidateSingle.validateSync(ctx.request.body,{abortEarly:false});
            ctx.request.body = validations
            if(moneda_principal_transaccion) {
                if(moneda_principal_transaccion.toUpperCase().trim() == 'BS') {
                    return await validateSinglePagoBS(ctx)
                } else if(moneda_principal_transaccion.toUpperCase().trim() == 'USD') {
                    return await validateSinglePagoUSD(ctx)
                } else {
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje = "El parametro 'moneda_principal_transaccion' no es un valor valido"
                    objetoDevolucion.dataEnvio =  ctx.request.body
                }
            } else {
                objetoDevolucion.status = "error"
                objetoDevolucion.mensaje = "El parametro 'moneda_principal_transaccion' es obligatorio y requerido"
                objetoDevolucion.dataEnvio =  ctx.request.body
    
            }

          } catch (error) {
            console.log(error)
            console.log(error.errors)
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = error.errors
            objetoDevolucion.dataEnvio =  ctx.request.body 
          }
        return objetoDevolucion
    }, 


    find: async(ctx) => {
            // The `where` and `data` parameters passed as arguments
            // of the GraphQL mutation are available via the `context` object.

            let entities;
            if (ctx.query._q) {
            entities = await strapi.api["operaciones-pago-movil"].services["operaciones-pago-movil"].search(ctx.query);
            } else {
            entities = await strapi.api["operaciones-pago-movil"].services["operaciones-pago-movil"].find(ctx.query);
            }
            const atributos = strapi.api["operaciones-pago-movil"].models["operaciones-pago-movil"].attributes
            const ARRAYCAMPOS = Object.entries(atributos).filter(atributo => {
                if(atributo[1].type == "relationall") {
                    return atributo
                }
            })

            const eso = entities.map(entity => sanitizeEntity(entity, { model: strapi.models["operaciones-pago-movil"] }))
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
};

 /*  

global $woocommerce;
// we need it to get any order detailes
$metodo = 2;


if($metodo == 1) {
    $response = wp_remote_get($this->API_HOST.$this->API_PATH."?tlf=$phoneNumForm&fi=2020-08-25&acc=0", $args);
} elseif ($metodo == 2) {
    $response = wp_remote_get($this->API_HOST.$this->API_PATH."?id=$Docformatiado"."&tlf=$phoneNumForm&fi=2020-08-01&acc=0", $args);
    //$response = wp_remote_get($this->API_HOST.$this->API_PATH."?fi=2020-08-01&acc=0", $args);
}else {
    wc_add_notice(  'Connection error.', 'error' );
    return false;
}

 if( !is_wp_error( $response ) ) {
    
     $body = json_decode( $response['body'], true );
    -- var_dump($body['pagos'][0]['monto']);
     var_dump("-------------------url------------------");
     var_dump($this->API_HOST.$this->API_PATH."?fi=2020-08-01&acc=0");
     var_dump("-------------------data------------------");
     var_dump($body['pagos']); --
     // it could be different depending on your payment processor
     if ( $body['codigoRespuesta'] === '0000' ) {
        if(!empty($body['pagos'])){
            $pagosExtraidos = $this->extraerPagosUsados($body['pagos']);

            if(count($pagosExtraidos) !== 0){

                $pagosComprobados = $this->verificarMontoPago($pagosExtraidos, $woocommerce->cart->total);

                if( $pagosComprobados !== "excede"){

                        if(count($pagosComprobados) !== 0) {

                            if($this->insertarBasedeDatos($pagosComprobados, $woocommerce)){
                                $this->arrayPagosProcesados = $pagosComprobados;
                                return true;
    
                            } else {
                                
                                wc_add_notice('Hubo un error en el registro de su pago', 'error' );
                                return false;
                            }
                        } else {

                            wc_add_notice(  'El Monto enviado mediante Pago Móvil es insuficiente, por favor verifique. El monto a pagar es de Bs. '.$this->convertirDolaresBolivares($woocommerce->cart->total,true), 'error' ); 
                            return false;                    
                        }
                    } else {

                        wc_add_notice(  'El Monto enviado mediante Pago Móvil no corresponde, por favor verifique. El monto exacto a pagar es de Bs. '.$this->convertirDolaresBolivares($woocommerce->cart->total,true) , 'error' );
                        return false; 
                       
                    }
            } else {
                wc_add_notice(  'El pago enviado fue utilizado en otra compra.', 'error' );
                return false;  
            }

           
        } else {
            wc_add_notice(  'La tienda no ha recibido ninguna transacción de Pago Móvil con ese monto desde el teléfono suministrado por usted', 'error' );
            return false;                
        }

     } else {
        wc_add_notice(  'Error en el servicio, intente nuevamente', 'error' );
        return false;
    }

} else {
    wc_add_notice(  'Connection error.', 'error' );
    return false;
}*/