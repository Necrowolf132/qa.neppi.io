const yup = require('yup');
const { setLocale } = require('yup');
const padStart = require('string.prototype.padstart');

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
        return  schema.required("El campo 'rif_empresa' no puede ser una cadena vacia y es requerido").min(11,"El tamaño del campo 'rif_empresa' bebe ser un valor de 11 digitos").max(11,"El tamaño del campo 'rif_empresa' bebe ser un valor de 11 digitos").matches(strapi.config.get('sistemDefault.regexDefaultNumeroRif', []),"El campo rif_empresa no debe contener caracteres espaciales, solo letras y numeros, y poseer un tamaño fijo de once (11) digitos").test('error_parametros_iguales_rif', "Ya existe una empresa registrada con el valor 'rif_empresa'" , async (valor ,  contexto) => {

            if(valor && contexto.parent?.persona) {
                const ValorRifConsulta = contexto.parent?.persona?.trim().toUpperCase() + padStart(valor.toString()?.trim(), 11, "0")
                if(typeof strapi.query('comercio').find == 'function'){
                    const comercioCreado =  await strapi.query('comercio').find({numero_de_documento_de_identificaion_fiscal: ValorRifConsulta});
                    if(comercioCreado && comercioCreado.length >= 1 ) {
                        return false
                    } else {
                        return true
                    }
            
                }
            }
            return true
        })
    }
    return schema;
}
const validateEstatusEmpresaWhen = function(crear_user_comercio, schema){
    if(crear_user_comercio){
        return schema.oneOf(strapi.config.get('sistemDefault.arrayEstatus1', []),"No es un valor valido para el campo 'estatus_comercio' ")
    }
    return schema;

}
const CreateScheme = async() => {
    
    const getIDusersArray = await getIDusers()
    const getIDCanalArray = await getIDmarcas()
    const getDefaulCanal = await getIDmarcasdefault()


    return await yup.object().shape({
        nombre: yup.string().required("El campo 'nombre' es requerido").min(3,"Debe ser un nombre de al menos 3 caracteres").max(50,"el nombre no debe sobrepasar los 50 caracteres").matches(strapi.config.get('sistemDefault.regexDefaultNombreApellido',""), { message: "No es un nombre valido. No puede contener caracteres numericos, solo letras" , excludeEmptyString: true }),
    
        apellido:  yup.string().required("El campo 'apellido' es requerido").min(3,"Debe ser un apellido de al menos 3 caracteres").max(50,"el apellido no debe sobrepasar los 50 caracteres").matches(strapi.config.get('sistemDefault.regexDefaultNombreApellido',""), { message: "No es un nombre valido. No puede contener caracteres numericos, solo letras" , excludeEmptyString: true }),
    
        telefono:  yup.string().required("El campo 'Telefono' es requerido").min(12,"Debe ser un numero telefonico de al menos 12 digitos").max(12,"Debe ser un numero telefonico no mayor de 12 digitos").matches(strapi.config.get('sistemDefault.regexCodigosDeareaLocalCelular', /^$/), { message: "No es un numero telefonico valido. Debe contener 12 digitos numericos y ademas comenzar por el codigo del pais (58) seguido del codigo de la operadora (416) o regional (212) ej. 584164000939" , excludeEmptyString: true }), 
    
        email: yup.string().required("El campo 'Email' es requerido").email("formato de email invalido. Ej manjou132@gmail.com").min(5,"Debe ser un email de al menos 5 caractares").max(100,"Debe ser un email maximno 100 caractares"),
        
        id_user_creador: yup.string().required("El campo 'id_user_creador' es requerido").oneOf(getIDusersArray,"No es un ID de usuario valido"), 

        tipo_de_usuario: yup.string().default(strapi.config.get('sistemDefault.tipoUsuarioDefault', "")).required("Este valor para el campo 'tipo_de_usuario'. No  es valido no pude ser un campo vacio").oneOf(strapi.config.get('sistemDefault.arrayValoresTipoUsuari', []),"No es un valor valido para el campo 'tipo_de_usuario' "), 
    
        procedencia_de_registro: yup.string().default(strapi.config.get('sistemDefault.procedenciaRegistroDefault', "")).required("Este valor para el campo 'procedencia_de_registro'. No  es valido no pude ser un campo vacio").oneOf(strapi.config.get('sistemDefault.arrayProcedenciaRegistro', []),"No es un valor valido para el campo 'procedencia_de_registro' "),
        
        id_canal: yup.string().default(getDefaulCanal).required("Este valor para el campo 'id_canal'. No  es valido no pude ser un campo vacio").oneOf(getIDCanalArray, [],"No es un valor valido para el campo 'id_canal'"),

        username:  yup.string().when(["email"],defaultnUsermaneGenerate).required("El campo 'username' no puede ser una cadena vacia").min(3,"Debe ser un username de al menos 3 caracteres").max(50,"el username no debe sobrepasar los 50 caracteres").matches(strapi.config.get('sistemDefault.regexDefaultUsername', ""), { message: "No es un username valido. No puede contener espacios ni saltos de linea, solo letras" , excludeEmptyString: true }),

        documento_de_identidad:  yup.string().min(12,"El campo 'documento_de_identidad' debe poseer un tamaño de 12 caracteres").max(12, "El campo 'documento_de_identidad' debe poseer un tamaño de 12 caracteres").matches(strapi.config.get('sistemDefault.regexDefaultDocumentoUsuario', /^$/),"El formato del campo 'documento_de_identidad' no es valido, asegurese de que sigue el siguiente formato, Ej. V00023696753"),

        crear_user_comercio: yup.boolean({ message: "El campo 'crear_user_comercio' solo puede ser 'true' o 'false' "}),

        persona:  yup.string().when(["crear_user_comercio"],validatePersonaWhen),

        nombre_empresa:  yup.string().when(["crear_user_comercio"],validateNombreEmpresaWhen),

        rif_empresa:  yup.string().when(["crear_user_comercio"],validateRifEmpresaWhen),

        estatus_comercio: yup.string().when(["crear_user_comercio"],validateEstatusEmpresaWhen),

        porcentaje_comision_canal_o_vendedor:  yup.number().transform(function (value, originalvalue) {
            return this.isType(value) && value !== null ? Math.round((value + Number.EPSILON) * 100) / 100 : value;
          }).min(0, "El valor del campo 'porcentaje_comision_canal_o_vendedor' debe ser un valor entre 0.1% y 100.0%, ademas no puede ser un valor negativo").max(100, "El valor del campo 'porcentaje_comision_canal_o_vendedor' debe ser un valor entre 0.1% y 100.0%, ademas no puede ser un valor negativo")
        
    });
}


module.exports.schemaValidateResgisterUserFunc =  CreateScheme;