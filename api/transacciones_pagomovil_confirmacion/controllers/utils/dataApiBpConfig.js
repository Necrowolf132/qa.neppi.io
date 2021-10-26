'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const CONFIG = "TEST"
const TEST ={
    API_HOST: "https://apiqa.bancoplaza.com:8585/",
    API_PATH:"v1/pagos/p2p",
    API_KEY_ID:"2a324b9ea7d74ab6b0a3ad5ad1b16776",
    API_AUTH_TOKEN:"a2439927e1c54933ba4493b439ec9f79",
    MODEL_ID: "transacciones_pagomovil_confirmacion",
    MODEL_ID_terminales: "asociados-a-comercio.terminales"
}
const PROD = {
    API_HOST: "https://api.bancoplaza.com:8282/",
    API_PATH:"v1/pagos/p2p",
    API_KEY_ID:"",
    API_AUTH_TOKEN:"",
    MODEL_ID: "transacciones_pagomovil_confirmacion",
    MODEL_ID_terminales: "asociados-a-comercio.terminales"
}

module.exports = {
    CONFIG: CONFIG == "TEST" ? TEST : PROD,
}
