'use strict';
const { sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
//const {extraer_numero_formato, generateSignatureAndHeaders, generateDocForm, generatePhoneNumForm, extraerPagosUsados, verificarMontoPago, insertarBasedeDatos, convertirDolaresBolivares} = require("./utils/helpers")
const {extraer_numero_formato, generateSignatureAndHeadersComprobacion, generateSignatureAndHeadersNoBody, generateDocForm, generatePhoneNumForm, comprobacionTasaDolar, extraerPagosUsados, verificarMontoPago, insertarBasedeDatos, convertirDolaresBolivares} = require("./utils/helpers")
const axios = require('axios').default;
const {CONFIG} = require("./utils/dataApiBpConfig");

module.exports = {
    generarDelete: async(ctx) => {
        const {ArrayIdsComprobacion} = ctx.request.body
        const headers =  generateSignatureAndHeadersNoBody()
        for(let consultaUtilNow of  ArrayIdsComprobacion){
            var response = {}
            try {
                 response = await axios({
                 method: 'delete',
                 url: CONFIG.API_HOST+CONFIG.API_PATH+`${consultaUtilNow}`,
                 headers: {
                  'api-key': headers.apikey,
                  'api-signature': headers.apisignature,
                  'nonce': headers.nonce,
                  'Content-Type': headers.ContentType
                 }
               });
             } catch(error)  {
                console.log("delete error")
                console.log(error)
             }
             if( response?.data ) {
                let body =  response?.data?.body
                if ( response?.headers?.codigorespuesta  === '0000' ) { 
                    console.log(response?.headers)
                } else {
                    console.log("diferente a correcto")
                    console.log(response?.headers)
                }
              } else {
                console.log("sin data")
              }
        }
    },
    
    generarComprobacion: async(ctx) => {
        let objetoDevolucion = new Object();
        const {ArrayNumeroConsulta, storeDocumento, id_terminal, montoDeudaTotal, tasaDolares, isConvercionAutomatica, telefonoCliente , ip} = ctx.request.body
        const tasaBolivaresCobro = comprobacionTasaDolar(tasaDolares,isConvercionAutomatica)
       // const MONTO_TOTAL_A_PAGAR = await convertirDolaresBolivares(montoDeudaTotal,tasaBolivaresCobro)
        //console.log(ArrayNumeroConsulta, storeDocumento, id_terminal, montoDeudaTotal, tasaBolivaresCobro, ip)
        /* ----- ESTA LOGICA EXISTE AUNQUE YA NO ES NECESARIA.. LLEGA VALIDADO Y FORMATEADO EL NUMERO DESDE EL WORDPRESS ------ 
        let numeroExtraido = extraer_numero_formato(numPhoneBpSelect,numPhoneBp)
        if(!/^0416\d{7,7}|0426\d{7,7}|0424\d{7,7}|0414\d{7,7}|0412\d{7,7}$/g.test(numeroExtraido)){
            objetoDevolucion.status = "error"
            objetoDevolucion.mensaje = "Formato de Teléfono celular incorrecto, por favor ingréselo de la siguiente forma, Ejemplo: 0414-1234567"array1.concat(array2)
        }*/ 
        const arrayConsultasObject = []
        for(let valorPagoformatear of ArrayNumeroConsulta ){
            let objetoDeCreacionAux = {}
            objetoDeCreacionAux.body = {}
            objetoDeCreacionAux.body["telefonoAfiliado"] = generatePhoneNumForm(valorPagoformatear?.telefono);
            objetoDeCreacionAux.body["banco"] = valorPagoformatear?.banco
            if(telefonoCliente){
                objetoDeCreacionAux.body["telefonoCliente"]  = generatePhoneNumForm(telefonoCliente);
            }
            if(valorPagoformatear?.monto) {
                objetoDeCreacionAux.body["monto"]  = valorPagoformatear?.monto;
            }
            objetoDeCreacionAux.body["canal"] = 12
            objetoDeCreacionAux.ref = valorPagoformatear.ref
            objetoDeCreacionAux.signature = generateSignatureAndHeadersComprobacion(objetoDeCreacionAux.body)
            arrayConsultasObject.push(objetoDeCreacionAux)
        } 
        const Docformatiado =  generateDocForm(storeDocumento);
        let totalPagosValidos = [];
        let totalPagosImbalidos = [];
        let errorConection = false;
        var response = {}
        for(let consultaUtilNow of  arrayConsultasObject){
           try {
                response = await axios({
                method: 'post',
                url: CONFIG.API_HOST+CONFIG.API_PATH+`/${Docformatiado}/ref-${consultaUtilNow.ref}`,
                headers: {
                 'api-key': consultaUtilNow.signature.apikey,
                 'api-signature': consultaUtilNow.signature.apisignature,
                 'nonce': consultaUtilNow.signature.nonce,
                 'Content-Type': consultaUtilNow.signature.ContentType
                },
                timeout: 5000, 
                data: JSON.stringify(consultaUtilNow.body) 
              });
            } catch(error)  {
                errorConection = true
                if( error?.response ){
                    console.log("confirmacion error response")
                    if ( error?.response?.headers?.codigorespuesta !== '0000' && error?.response?.headers?.codigorespuesta ) { 
                        console.log("confirmacion error codigo NO 0000")
                        console.log(error)
                        totalPagosImbalidos = totalPagosImbalidos.concat({ref: consultaUtilNow.ref, codigo: error?.response?.headers?.codigorespuesta, mensaje: error?.response?.headers?.descripcionsistema, } )
                    } else {
                        console.log("confirmacion error codigo quien sabe")
                        totalPagosImbalidos = totalPagosImbalidos.concat({ref:consultaUtilNow.ref, codigo: "ERRORCONECTION", mensaje: "NO se logro conectar satisfactoriamente con le servicio del banco plaza"} )                      
                    }

                } else {
                    console.log("confirmacion error sin response")
                    totalPagosImbalidos = totalPagosImbalidos.concat({ref:consultaUtilNow.ref, codigo: "ERRORCONECTION", mensaje: "NO se logro conectar satisfactoriamente con le servicio del banco plaza"} )
                } 
            }
              if( response?.data && !errorConection ) {
                console.log("confirmacion data")
                if ( response?.headers?.codigorespuesta === '0000' ) { 
                    console.log("confirmacion codigo 0000")
                    totalPagosValidos = totalPagosValidos.concat({ref:consultaUtilNow.ref, codigo: response?.headers?.codigorespuesta, mensaje: response?.headers?.descripcionsistema, body: response?.data})
                } else {
                    console.log("confirmacion codigo quien sabe")
                    console.log(response?.data)
                }
              } else if(!response?.data && !errorConection) {
                console.log("confirmacion sin data")
                console.log(response?.data)
              }
              errorConection = false
        }
        objetoDevolucion = {totalPagosValidos, totalPagosImbalidos}
            /*if(!errorConection) {
                if(totalPagosValidar.length > 0) {
                    const pagosExtraidos = await extraerPagosUsados(totalPagosValidar,storeDocumento,id_terminal);
                    
                    if(pagosExtraidos.length !== 0){

                        var pagosComprobados = await verificarMontoPago(pagosExtraidos, montoDeudaTotal, tasaBolivaresCobro,phoneNumerosForm.length > 1 ? true : false);

                        if( pagosComprobados?.excede !== "excede"){
                            if( pagosComprobados.arrayDevolucion.length > 0){

                                const PagosDescontados = await insertarBasedeDatos(pagosComprobados.arrayDevolucion, montoDeudaTotal, tasaBolivaresCobro, id_terminal, ip, storeDocumento)

                                if(PagosDescontados){
                                    objetoDevolucion.status = "Success"
                                    objetoDevolucion.mensaje ='Pago realizado satisfactoriamente'
                                    objetoDevolucion.INFO = totalPagosValidar
                                    objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                    objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                    objetoDevolucion.PagosEscritos = PagosDescontados
                                    objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
        
                                } else {
                                    objetoDevolucion.status = "error"
                                    objetoDevolucion.mensaje ='Hubo un error en el registro de su pago en base de datos'
                                    objetoDevolucion.INFO = totalPagosValidar
                                    objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                    objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                    objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                                }
                            } else {
                                objetoDevolucion.status = "error"
                                objetoDevolucion.mensaje ='El monto enviado mediante Pago Móvil es insuficiente, por favor verifica. El pago es de Bs. '+pagosComprobados?.montoTotalPago+' y si deuda es de Bs. '+ pagosComprobados?.montoTotalPago
                                objetoDevolucion.INFO = totalPagosValidar
                                objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                                objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                                objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                        } 
                        } else {
                            objetoDevolucion.status = "error"
                            objetoDevolucion.mensaje ='El Monto enviado mediante Pago Móvil no corresponde con el monto a pagar, por favor verifique. El monto exacto a pagar es de Bs. '+ pagosComprobados?.montoTotalAPagar+' y su monto pagado es de Bs. ' +  pagosComprobados?.montoTotalPago
                            objetoDevolucion.INFO = totalPagosValidar
                            objetoDevolucion.montoTotalPagado = pagosComprobados?.montoTotalPago
                            objetoDevolucion.montoTotalAPagar = pagosComprobados?.montoTotalAPagar
                            objetoDevolucion.PagosDescontados = pagosComprobados.arrayDevolucion
                        }

                    } else {
                        objetoDevolucion.status = "error"
                        objetoDevolucion.mensaje ='El o los pagos enviados fueron utilizados en otra compra.'
                        objetoDevolucion.INFO = totalPagosValidar
                    }
                } else {
                    objetoDevolucion.status = "error"
                    objetoDevolucion.mensaje ='La tienda no ha recibido ninguna transacción de Pago Móvil con ese monto desde el teléfono suministrado por usted'
                    objetoDevolucion.INFO = totalPagosValidar
                    
                }
            }*/
        ctx.send( objetoDevolucion )
    }, 

    find: async(ctx) => {
            // The `where` and `data` parameters passed as arguments
            // of the GraphQL mutation are available via the `context` object.

            let entities;
            if (ctx.query._q) {
            entities = await strapi.api["operaciones_pago_movil_comprobacion"].services["operaciones_pago_movil_comprobacion"].search(ctx.query);
            } else {
            entities = await strapi.api["operaciones_pago_movil_comprobacion"].services["operaciones_pago_movil_comprobacion"].find(ctx.query);
            }
            const atributos = strapi.api["operaciones_pago_movil_comprobacion"].models["operaciones_pago_movil_comprobacion"].attributes
            const ARRAYCAMPOS = Object.entries(atributos).filter(atributo => {
                if(atributo[1].type == "relationall") {
                    return atributo
                }
            })

            const eso = entities.map(entity => sanitizeEntity(entity, { model: strapi.models["operaciones_pago_movil_comprobacion"] }))
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
    },

    getBancosValidos:async(ctx) => {

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