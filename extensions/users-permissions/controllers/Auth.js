'use strict';

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const crypto = require('crypto');
const _ = require('lodash');
const padStart = require('string.prototype.padstart');
const axios = require('axios').default
const qs = require('qs');
const { sanitizeEntity, parseMultipartData } = require('strapi-utils');
const { schemaValidateResgisterUserFunc } = require('./utils/validationsSchemas')

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const formatError = error => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];
const capitalize = (word) => {
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

const generatePassword = () => {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}



module.exports = {
  async getJWTCIBC() {
    try {
      const data = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': strapi.config.get('sistemDefault.CLIENT_ID_CIBC', ""),
        'client_secret': strapi.config.get('sistemDefault.CLIENT_SECRET_CIBC', ""),
        'scope': 'payments' 
      });
      const config = {
        method: 'post',
        url: 'https://api.cibc.useinfinite.io/token',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
      };
      
     const response = await  axios(config);
  
      if(response?.data?.access_token){
        return {access_token: response?.data?.access_token, status:"Success"}
      } else {
        return {access_token:"", status:"Error"}
      }
  
  } catch(error)  {
    console.log(error);
    return {access_token:"", status:"Error"}
  }
  },
  async refreshToken(ctx) {

    const params = _.assign(ctx.request.body);
    // Parse Token
    try {
      const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(params.jwt);
      const user = await strapi.query('user', 'users-permissions').findOne({ id });
      if(user?.id){
        ctx.send({
          jwt: strapi.plugins['users-permissions'].services.jwt.issue({
            id: user.id,
          }),
          user
        })
      } else {
        ctx.badRequest(null, 'Usuario ya no existe');
      }
    } catch (e) {
      return ctx.badRequest(null, 'Invalid token');
    }

  },
  async callback(ctx) {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;

    const store = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    if (provider === 'local') {
      if (!_.get(await store.get({ key: 'grant' }), 'email.enabled')) {
        return ctx.badRequest(null, 'This provider is disabled.');
      }

      // The identifier is required.
      if (!params.identifier) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.email.provide',
            message: 'Please provide your username or your e-mail.',
          })
        );
      }

      // The password is required.
      if (!params.password) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.password.provide',
            message: 'Please provide your password.',
          })
        );
      }

      const query = { provider };

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.identifier);

      // Set the identifier to the appropriate query field.
      if (isEmail) {
        query.email = params.identifier.toLowerCase();
      } else {
        query.username = params.identifier;
      }

      // Check if the user exists.
      const user = await strapi.query('user', 'users-permissions').findOne(query);

      if (!user) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.invalid',
            message: 'Identifier or password invalid.',
          })
        );
      }

      if (
        _.get(await store.get({ key: 'advanced' }), 'email_confirmation') &&
        user.confirmed !== true
      ) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.confirmed',
            message: 'Your account email is not confirmed',
          })
        );
      }

      if (user.blocked === true) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.blocked',
            message: 'Your account has been blocked by an administrator',
          })
        );
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.password.local',
            message:
              'This user never set a local password, please login with the provider used during account creation.',
          })
        );
      }

      const validPassword = await strapi.plugins[
        'users-permissions'
      ].services.user.validatePassword(params.password, user.password);

      if (!validPassword) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.invalid',
            message: 'Identifier or password invalid.',
          })
        );
      } else {
        ctx.send({
          jwt: strapi.plugins['users-permissions'].services.jwt.issue({
            id: user.id,
          }),
          user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
            model: strapi.query('user', 'users-permissions').model,
          }),
        });
      }
    } else {
      if (!_.get(await store.get({ key: 'grant' }), [provider, 'enabled'])) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'provider.disabled',
            message: 'This provider is disabled.',
          })
        );
      }

      // Connect the user with the third-party provider.
      let user;
      let error;
      try {
        [user, error] = await strapi.plugins['users-permissions'].services.providers.connect(
          provider,
          ctx.query
        );
      } catch ([user, error]) {
        return ctx.badRequest(null, error === 'array' ? error[0] : error);
      }

      if (!user) {
        return ctx.badRequest(null, error === 'array' ? error[0] : error);
      }

      ctx.send({
        jwt: strapi.plugins['users-permissions'].services.jwt.issue({
          id: user.id,
        }),
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
          model: strapi.query('user', 'users-permissions').model,
        }),
      });
    }
  },


  async register(ctx) {
    let registro = true
    let data, files, passwordGenerado = undefined
    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    if(ctx.is('multipart')){
       const { data: dataAux, files: filesAux } = parseMultipartData(ctx);
        data = dataAux
        files = filesAux
    } else {
        data = ctx.request.body
    }

    const settings = await pluginStore.get({
      key: 'advanced',
    });
    const schemaValidateResgisterUser = await schemaValidateResgisterUserFunc()
    if (!settings.allow_register) {
      return ctx.badRequest(
        null,{
          messages: ['La opcion de registro esta desactivada'],
        }
      );
    }

    var params = {
      ..._.omit(data, [ 'confirmationToken', 'resetPasswordToken']),
      provider: 'local',
    };

    if (!params?.fechas_envio_registro) {
        params.fechas_envio_registro = new Date()
    }

    // Password is required.
    if (!params?.password) {
        params.password = generatePassword();
        passwordGenerado =  params.password
    }

    try {
      const validations = await schemaValidateResgisterUser.validate(params,{abortEarly:false});
      params = {...params, ...validations}
    } catch (error) {
      registro = false
      console.log(error)
      console.log(error.errors) 
      return ctx.badRequest(
        null,
        {
        messages: error.errors,
        }
      );
    }
    /*if (!params?.nombre) {
    return ctx.badRequest(
        null,
        formatError({
        id: 'Auth.form.error.nombre.provide',
        message: 'Es obligatorio que proporcioné un nombre',
        })
    );
    }*/
    /*if (!params?.apellido) {
    return ctx.badRequest(
        null,
        formatError({
        id: 'Auth.form.error.apellido.provide',
        message: 'Es obligatorio que proporcioné un apellido',
        })
    );
    }*/
   /* if (!params?.telefono) {
    return ctx.badRequest(
        null,
        formatError({
        id: 'Auth.form.error.telefono.provide',
        message: 'Es obligatorio que proporcioné un telefono',
        })
    );
    }*/

    // Throw an error if the password selected by the user
    // contains more than three times the symbol '$'.
    if (strapi.plugins['users-permissions'].services.user.isHashed(params?.password)) {
      registro = false
      return ctx.badRequest(
        null,
        {
          messages: ["Su contraseña no puede contener más de tres veces el símbolo '$'."],
        }
      );
    }

    const role = await strapi
      .query('role', 'users-permissions')
      .findOne({ type: settings.default_role }, []);

    if (!role) {
      registro = false
      return ctx.badRequest(
        null,
        {
          messages: ['Es imposible encontrar el rol de usuario solicitado'],
        }
      );
    }


    params.role = role.id;
    params.password = await strapi.plugins['users-permissions'].services.user.hashPassword(params);

    const user = await strapi.query('user', 'users-permissions').findOne({
      email: params.email,
    });
    if (user && user.provider === params.provider) {
      registro = false
      return ctx.badRequest(
        null,
        {
          messages: ['El email ya esta registrado'],
        }
      );
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      registro = false
      return ctx.badRequest(
        null,
        {
          messages: ['El email ya esta registrado'],
        }
      );
    }

    try {
      if(registro){
      const user = await strapi.query('user', 'users-permissions').create(params);
      if(user?.id && params?.crear_user_comercio === true && typeof strapi.query('comercio').create == 'function') {
            var newComercial = await strapi.query('comercio').create({
            id_usuario: user?.id,
            razon_social: params?.nombre_empresa,
            numero_de_documento_de_identificaion_fiscal: params?.persona?.trim().toUpperCase() + padStart(params?.rif_empresa?.toString()?.trim(), 11, "0"),
            telefono_celular_empresa: params?.telefono?.trim(),
            correo_de_la_empresa: params?.email?.trim(),
            pais: strapi.config.get('sistemDefault.paispordefecto', ""),
            estatus: params?.estatus?.trim()
          })
      }
      const sanitizedUser = sanitizeEntity(user, {
        model: strapi.query('user', 'users-permissions').model,
      });
      if(files){
        if (Object.keys(files).length > 0) {
          const arrayFiles = [];  
          Object.keys(files).forEach(async (filename) => {
            await strapi.plugins.upload.services.upload.uploadToEntity(
              {
                id: user.id || user._id,
                model: "user",
                field: filename,
              },
              files[filename],
              "users-permissions"
            );
          });
         }
      }
      if (settings.email_confirmation) {
        try {
          await strapi.plugins['users-permissions'].services.user.sendConfirmationEmail(user);
        } catch (err) {
          return ctx.badRequest(null, err);
        }

        return ctx.send({ user: sanitizedUser });
      }

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user, ['id']));
      const comercioAsociado = newComercial ? newComercial : undefined
      return ctx.send({
        jwt,
        user: sanitizedUser,  
        passwordGenerado,
        comercioAsociado
      });
      }
    } catch (err) {
      console.log(err)
      const adminError = _.includes(err.message, 'username')
        ? {
            messages: ['El Username ya esta registrado']
          }
        : { messages: ['El email ya esta registrado'] };

      ctx.badRequest(null, adminError);
    }
  },


 
};
