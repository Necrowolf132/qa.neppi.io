module.exports = ({ env }) => ({
    tipoUsuarioDefault: "empresa" ,
    nameIdcanalDefault: "Neppi",
    regexCodigosDeareaLocalCelular: /^(58416\d{7,7})$|^(58426\d{7,7})$|^(58424\d{7,7})$|^(58414\d{7,7})$|^(58412\d{7,7})$|^(58248\d{7,7})$|^(58281\d{7,7})$|^(58282\d{7,7})$|^(58283\d{7,7})$|^(58285\d{7,7})$|^(58292\d{7,7})$|^(58240\d{7,7})$|^(58247\d{7,7})$|^(58278\d{7,7})$|^(58243\d{7,7})$|^(58244\d{7,7})$|^(58246\d{7,7})$|^(58273\d{7,7})$|^(58278\d{7,7})$|^(58284\d{7,7})$|^(58285\d{7,7})$|^(58286\d{7,7})$|^(58288\d{7,7})$|^(58289\d{7,7})$|^(58241\d{7,7})$|^(58242\d{7,7})$|^(58243\d{7,7})$|^(58245\d{7,7})$|^(58249\d{7,7})$|^(58258\d{7,7})$|^(58287\d{7,7})$|^(58212\d{7,7})$|^(58259\d{7,7})$|^(58268\d{7,7})$|^(58269\d{7,7})$|^(58279\d{7,7})$|^(58235\d{7,7})$|^(58238\d{7,7})$|^(58246\d{7,7})$|^(58247\d{7,7})$|^(58251\d{7,7})$|^(58252\d{7,7})$|^(58253\d{7,7})$|^(58271\d{7,7})$|^(58274\d{7,7})$|^(58275\d{7,7})$|^(58234\d{7,7})$|^(58239\d{7,7})$|^(58287\d{7,7})$|^(58291\d{7,7})$|^(58292\d{7,7})$|^(58295\d{7,7})$|^(58255\d{7,7})$|^(58256\d{7,7})$|^(58257\d{7,7})$|^(58272\d{7,7})$|^(58293\d{7,7})$|^(58294\d{7,7})$|^(58275\d{7,7})$|^(58276\d{7,7})$|^(58277\d{7,7})$|^(58278\d{7,7})$|^(58271\d{7,7})$|^(58272\d{7,7})$|^(58251\d{7,7})$|^(58253\d{7,7})$|^(58254\d{7,7})$|^(58261\d{7,7})$|^(58262\d{7,7})$|^(58263\d{7,7})$|^(58264\d{7,7})$|^(58265\d{7,7})$|^(58266\d{7,7})$|^(58267\d{7,7})$|^(58271\d{7,7})$|^(58275\d{7,7})$/,
    procedenciaRegistroDefault: "Administrador_Backend",
    regexDefaultProcedenciasRegistro: /^\W*Sitio_web\W*$|^\W*Dashboard_web\W*$|^\W*Aplicacion_movil\W*$|^\W*Rest_api\W*$|^\W*Administrador_Backend\W*$/,
    arrayValoresTipoUsuari: ["administrador", "canal", "empresa", "gerente", "empleado", "vendedor","sistema_interno_apipago" ],
    arrayProcedenciaRegistro: ["Sitio_web", "Dashboard_web", "Aplicacion_movil", "Rest_api", "Administrador_Backend"],
    arrayPersonasValidas: ["V", "v", "E", "e", "J", "j", "G", "g"],
    regexDefaultNumeroRif: /^[0-9]{11,11}$/,
    regexDefaultNombreEmpresa: /^[a-zA-Z\d\W]+$/g,
    regexDefaultUsername: /^([a-zA-ZÀ-ÿ0-9\u00f1\u00d1]){3,50}$/i,
    regexDefaultDocumentoUsuario: /^[VvJjEeGg][0-9]{11,11}$/,
    regexDefaultNombreApellido: /^([a-zA-ZÀ-ÿ\u00f1\u00d1]\s{0,1}){3,50}$/i,
    paispordefecto: "61731bf1c44d8e895e5b49fb",
    arrayDefaultMonedaPrincipalTransaccion: ["bs","BS","USD","usd"],
    arrayDefaultTipoOperacionPagomovilConfirmacion: ["simple","multiple"],
    regexDefaultNumerosTelefonicos: /^(416\d{7,7})$|^(426\d{7,7})$|^(424\d{7,7})$|^(414\d{7,7})$|^(412\d{7,7})$|^(248\d{7,7})$|^(281\d{7,7}$)|^(282\d{7,7})$|^(283\d{7,7})$|^(285\d{7,7})$|^(292\d{7,7})$|^(240\d{7,7})$|^(247\d{7,7})$|^(278\d{7,7})$|^(243\d{7,7})$|^(244\d{7,7})$|^(246\d{7,7})$|^(273\d{7,7})$|^(278\d{7,7})$|^(284\d{7,7})$|^(285\d{7,7})$|^(286\d{7,7})$|^(288\d{7,7})$|^(289\d{7,7})$|^(241\d{7,7})$|^(242\d{7,7}$)|^(243\d{7,7})$|^(245\d{7,7})$|^(249\d{7,7})$|^(2\d{7,7})$|^(287\d{7,7})$|^(212\d{7,7})$|^(259\d{7,7})$|^(268\d{7,7})$|^(269\d{7,7})$|^(279\d{7,7})$|^(235\d{7,7})$|^(238\d{7,7})$|^(246\d{7,7})$|^(247\d{7,7})$|^(251\d{7,7})$|^(252\d{7,7})$|^(253\d{7,7})$|^(271\d{7,7})$|^(274\d{7,7})$|^(275\d{7,7})$|^(234\d{7,7})$|^(239\d{7,7})$|^(287\d{7,7})$|^(291\d{7,7})$|^(292\d{7,7})$|^(295\d{7,7})$|^(255\d{7,7})$|^(256\d{7,7})$|^(257\d{7,7}$)|^(272\d{7,7})$|^(293\d{7,7})$|^(294\d{7,7})$|^(275\d{7,7})$|^(276\d{7,7})$|^(277\d{7,7})$|^(278\d{7,7})$|^(271\d{7,7})$|^(272\d{7,7})$|^(251\d{7,7})$|^(253\d{7,7})$|^(254\d{7,7})$|^(261\d{7,7})$|^(262\d{7,7})$|^(263\d{7,7})$|^(264\d{7,7})$|^(265\d{7,7})$|^(266\d{7,7})$|^(267\d{7,7}$)|^(271\d{7,7})$|^(275\d{7,7})$/,
    arraybancoDestino: ["0138"],
    regexDefaultToken: /^[0-9]{6,6}$/,
    regexDefaultMotivo: /^([0-9a-zA-ZÀ-ÿ\u00f1\u00d1]\s{0,1}){0,150}$/i,
    arrayOrigen: ["07","10","11","12"],
    arrayCanal: ["20", "21", "22", "23",  "24" ],
    regexDefaultStoreDocumento: /^[VvJjEeGg][0-9]{11,11}$/,
    banco_aliado_default: "616d93293ac9920029c0d8e8",
    arrayEstatus1: [ "activo", "inactivo", "bloqueado"],
    CLIENT_SECRET_CIBC: "pbHXuCTaLDNyx1C7fidHByqZYcm73bH10LonwCgDEa0=",
    CLIENT_ID_CIBC: "G8ObsizNsxH4BDbH5xdezSUgCH6y1sOczf-D4rfYJco=",
    regexDefaultTokenComercio: /\b[0-9A-Za-z]{8,8}-[0-9A-Za-z]{4,4}-[0-9A-Za-z]{4,4}-[0-9A-Za-z]{4,4}-[0-9A-Za-z]{12,12}\b/,
    defaultStatus: "activo",
    defaultConfirmed: false

});
  