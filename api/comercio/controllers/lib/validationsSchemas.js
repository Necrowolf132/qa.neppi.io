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


const CreateSchemeValidate = async() => {
    

    return await yup.object().shape({
        tokenTerminal: yup.string().required("El campo 'tokenTerminal' es requerido").min(36,"El campo 'tokenTerminal' debe ser de 36 caracteres").max(36,"El campo 'tokenTerminal' debe ser de 36 caracteres").matches(strapi.config.get('sistemDefault.regexDefaultTokenComercio',""), { message: "El token de comercio esta en un formato no valido, debe cumplir el siguiente ejemplo. Ej. 80746432-a996-4d13-9931-b53762850c02" , excludeEmptyString: true }),
    });
}


module.exports= {  CreateSchemeValidate };