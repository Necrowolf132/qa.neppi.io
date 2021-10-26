/*module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'sqlite',
        filename: env('DATABASE_FILENAME', '.tmp/data.db'),
      },
      options: {
        useNullAsDefault: true,
      },
    },
  },
});*/
module.exports = ({ env }) => { 
  if(process.env.NODE_ENV == 'development'){
      if (env.bool('ENVIROMENT_ONLINE', false) ) {
        return  {
          defaultConnection: 'default',
          connections: {
            default: {
              connector: 'mongoose',
              settings: {
                host: env('DATABASE_DEV_AWS_HOST'),
                srv: env.bool('DATABASE_DEV_AWS_SRV', true),
                port: env.int('DATABASE_DEV_AWS_PORT', 27017),
                database: env('DATABASE_DEV_AWS_NAME'),
                username: env('DATABASE_DEV_AWS_USERNAME'),
                password: env('DATABASE_DEV_AWS_PASSWORD'),
              },
              options: {
                authenticationDatabase: env('AUTHENTICATION_DEV_AWS_DATABASE', null),
                ssl: env.bool('DATABASE_DEV_AWS_SSL', true),
              },
            },
          },
        }
      } else {
        return  {
          defaultConnection: 'default',
          connections: {
            default: {
              connector: 'mongoose',
              settings: {
                host: env('DATABASE_DEV_LOCAL_HOST'),
                srv: env.bool('DATABASE_DEV_LOCAL_SRV', false),
                port: env.int('DATABASE_DEV_LOCAL_PORT', 27017),
                database: env('DATABASE_DEV_LOCAL_NAME'),
                username: env('DATABASE_DEV_LOCAL_USERNAME'),
                password: env('DATABASE_DEV_LOCAL_PASSWORD'),
              },
              options: {
                authenticationDatabase: env('AUTHENTICATION_DEV_LOCAL_DATABASE', "admin"),
                ssl: env.bool('DATABASE_DEV_LOCAL_SSL', false),
              },
            },
          },
        }
      }
  } else {
    return  {
      defaultConnection: 'default',
      connections: {
        default: {
          connector: 'mongoose',
          settings: {
            host: env('DATABASE_PROD_HOST'),
            srv: env.bool('DATABASE_PROD_SRV', true),
            port: env.int('DATABASE_PROD_PORT', 27017),
            database: env('DATABASE_PROD_NAME'),
            username: env('DATABASE_PROD_USERNAME'),
            password: env('DATABASE_PROD_PASSWORD'),
          },
          options: {
            authenticationDatabase: env('AUTHENTICATION_DATABASE', null),
            ssl: env.bool('DATABASE_PROD_SSL', true),
          },
        },
      },
    }
  }
}
