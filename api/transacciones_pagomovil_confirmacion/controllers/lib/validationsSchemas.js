const yup = require('yup');
const { setLocale } = require('yup');

setLocale({
    string: {
      default: 'Formato de dato invalido, no es tipo string',
    },
    number: {
        default: 'Formato de dato invalido, no es tipo number',
    }
    
  });

const getIDusers = async() => {
    let arrayIDs = [];
    if(typeof strapi.query('user', 'users-permissions').find== 'function'){
        const users =  await strapi.query('user', 'users-permissions').find();
        users.forEach(element => {
            arrayIDs.push(element?.id ? element?.id : undefined)
        });
    }
    return arrayIDs;
}

const getIDmarcas = async() => {
    let arrayIDs = [];
    if(typeof strapi.query('marca-blanca').find == 'function'){

        const canalMarcas =  await strapi.query('marca-blanca').find();
        canalMarcas.forEach(element => {
            arrayIDs.push(element?.id ? element?.id : undefined)
        });

    }
    return arrayIDs;
}
const getIDmarcasdefault = async() => {
    let returnCanalID = ""
    if(typeof strapi.query('marca-blanca').findOne == 'function'){

        const canalMarca =  await strapi.query('marca-blanca').findOne({nombre_del_sistema: strapi.config.get('sistemDefault.nameIdcanalDefault', '')});
        if(canalMarca?.id){
            returnCanalID = canalMarca?.id
          }
    }
    return returnCanalID;
}

const defaultnUsermaneGenerate = function(email, schema){
    if(email){
        let usermanapreliminar = email.replace("@","")
        return schema.default(usermanapreliminar.replace(/\..*/g,""))
    }
    return schema;
}
const validatePersonaWhen = function(crear_user_comercio, schema){
    if(crear_user_comercio){
        return schema.required("El campo 'Persona' no puede ser una cadena vacia y es requerido").min(1,"Debe ser un valor de 1 caracteres").max(1,"Debe ser un valor de 1 caracteres").oneOf(strapi.config.get('sistemDefault.arrayPersonasValidas', []),"Tipo de persona, no es un tipo valido, ej. 'V' o 'J'")
    }
    return schema;
}
const validateNombreEmpresaWhen = function(crear_user_comercio, schema){
    if(crear_user_comercio){
        return schema.required("El campo 'nombre_empresa' no puede ser una cadena vacia y es requerido").min(3,"El tamaño minimo para el campo 'nombre_empresa' debe ser de 3 caracteres").max(50,"El tamaño maximo para el campo 'nombre_empresa' es de 50 caracteres").matches(strapi.config.get('sistemDefault.regexDefaultNombreEmpresa', []),"El 'nombre_empresa' no es valido, el mismo no puede contener ningana clase de caracter especial")
    }
    return schema;
}
const validateRifEmpresaWhen = function(crear_user_comercio, schema) {
    if(crear_user_comercio){
        return schema.required("El campo 'rif_empresa' no puede ser una cadena vacia y es requerido").min(11,"El tamaño del campo 'rif_empresa' bebe ser un valor de 11 digitos").max(11,"El tamaño del campo 'rif_empresa' bebe ser un valor de 11 digitos").matches(strapi.config.get('sistemDefault.regexDefaultNumeroRif', []),"El campo rif_empresa no debe contener caracteres espaciales, solo letras y numeros, y poseer un tamaño fijo de once (11) digitos").test('error_parametros_iguales_rif', "los valores para el campo 'rif_empresa' y 'documento_de_identidad' no pueden ser iguales" ,(valor ,  contexto) => {


            if(valor && contexto.parent?.documento_de_identidad) {

                let er = new RegExp('^[VvJjEeGg]0*'+valor.trim().replace(/^0+/,'')+'$', 'g')
                return !er.test(contexto.parent?.documento_de_identidad.trim())
            }
            return true
        })
    }
    return schema;
}
const CreateSchemeValidate = async() => {
    
    //const getIDusersArray = await getIDusers()
    //const getIDCanalArray = await getIDmarcas()
    //const getDefaulCanal = await getIDmarcasdefault()


    return await yup.object().shape({
        moneda_principal_transaccion: yup.string().required("El campo 'moneda_principal_transaccion' es requerido").min(2,"El campo ser 'moneda_principal_transaccion' de al menos 2 caracteres").max(3,"el campo 'moneda_principal_transaccion' no debe sobrepasar los 3 caracteres").oneOf(strapi.config.get('sistemDefault.arrayDefaultMonedaPrincipalTransaccion',[]),"El campo 'moneda_principal_transaccion' no es un valor valido"),

        ArrayNumeroConsulta : yup.array().required("El campo 'ArrayNumeroConsulta' es requerido").min(1,"Debe existir al menos 1 valor interno para el campo 'ArrayNumeroConsulta'").of(yup.string().min(10, "Los numeros telefonicos deben ser de 10 caracteres exactos").max(10,"Los numeros telefonicos deben ser de 10 caracteres exactos").matches(strapi.config.get('sistemDefault.regexDefaultNumerosTelefonicos',""), { message: "No es un numero telefonico valido. Debe contener 10 digitos numericos y ademas comenzar por el codigo de la operadora (416) o regional (212) ej. 4164000939" , excludeEmptyString: true })),

        documento_identidad_pagomovil_receptor:  yup.string().min(12,"El campo 'documento_identidad_pagomovil_receptor' debe poseer un tamaño de 12 caracteres").max(12, "El campo 'documento_identidad_pagomovil_receptor' debe poseer un tamaño de 12 caracteres").matches(strapi.config.get('sistemDefault.regexDefaultDocumentoUsuario', /^$/),"El formato del campo 'documento_identidad_pagomovil_receptor' no es valido, asegurese de que sigue el siguiente formato, Ej. V0023696753"),

        nro_telefono_pagomovil_receptor: yup.string().required("El campo 'nro_telefono_pagomovil_receptor' es requerido").min(10, "El numero telefonico para el campo 'nro_telefono_pagomovil_receptor' deben ser de 10 caracteres exactos").max(10,"El numero telefonico para el campo 'nro_telefono_pagomovil_receptor' deben ser de 10 caracteres exactos").matches(strapi.config.get('sistemDefault.regexDefaultNumerosTelefonicos',""), { message: "Utilizo un nuemro telefonico no valido para el campo 'nro_telefono_pagomovil_receptor'. Debe contener 10 digitos numericos y ademas comenzar por el codigo  de la operadora (416) o regional (212) ej. 4164000939" , excludeEmptyString: true }),

        montoDeudaTotal:  yup.number().required("El campo 'montoDeudaTotal' es requerido").transform(function (value, originalvalue) {
            return this.isType(value) && value !== null ? Math.round((value + Number.EPSILON) * 100) / 100 : value;
          }).min(0.01, "El valor del campo 'montoDeudaTotal' igual o menor a cero (0). Valor minimo 0.01"),

        tasaDolares:  yup.number().transform(function (value, originalvalue) {
        return this.isType(value) && value !== null ? Math.round((value + Number.EPSILON) * 100) / 100 : value;
        }).min(0.01, "El valor del campo 'tasaDolares' igual o menor a cero (0). Valor minimo 0.01"),
        
        isConvercionAutomatica:  yup.boolean({ message: "El campo 'isConvercionAutomatica' solo puede ser 'true' o 'false' "}),

        tipo_operacion_pagomovil_confirmacion: yup.string().required("El campo 'tipo_operacion_pagomovil_confirmacion' es requerido").oneOf(strapi.config.get('sistemDefault.arrayDefaultTipoOperacionPagomovilConfirmacion',[]),"El campo 'tipo_operacion_pagomovil_confirmacion' no es un valor valido")
        
    });
}


module.exports= {  CreateSchemeValidate };