module.exports = ({ env }) => {
    if(process.env.NODE_ENV == 'development'){
        if (env.bool('ENVIROMENT_ONLINE', false) ) {

                return {
                    upload: {
                    provider: 'aws-s3',
                    providerOptions: {
                        accessKeyId: env('AWS_ACCESS_KEY_DEV_AWS_ID'),
                        secretAccessKey: env('AWS_ACCESS_DEV_AWS_SECRET'),
                        region: 'us-east-2',
                        params: {
                        Bucket: 'strapi-s3-desarrollo-neppi',
                        },
                    },
                    },
                }
         }
    }
};