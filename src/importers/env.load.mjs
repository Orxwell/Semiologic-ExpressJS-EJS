const temp = {
  PORT  : process.env.PORT   ?? 5050       ,
  DOMAIN: process.env.DOMAIN ?? 'localhost',

  SERVER_URL: ''   ,
  STATE     : 'DEV',

  DBNAME_CLUSTER  : process.env.DBNAME_CLUSTER?.toLowerCase()       ,
  USERNAME_CLUSTER: encodeURIComponent(process.env.USERNAME_CLUSTER),
  PASSWORD_CLUSTER: encodeURIComponent(process.env.PASSWORD_CLUSTER),
  URI_CLUSTER     : process.env.URI_CLUSTER                         ,

  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,

  CORP_EMAIL_USER: process.env.CORP_EMAIL_USER,
  CORP_EMAIL_KEY : process.env.CORP_EMAIL_KEY ,

  TOKEN_LIFE_SECONDS: process.env.TOKEN_LIFE_SECONDS ?? 120,
};

const env = {
  PORT  : temp.PORT  ,
  DOMAIN: temp.DOMAIN,

  SERVER_URL: temp.SERVER_URL,
  STATE     : temp.STATE     ,

  DBNAME_CLUSTER  : temp.DBNAME_CLUSTER  ,
  USERNAME_CLUSTER: temp.USERNAME_CLUSTER,
  PASSWORD_CLUSTER: temp.PASSWORD_CLUSTER,
  URI_CLUSTER     : temp.URI_CLUSTER     ,

  MERCADOPAGO_ACCESS_TOKEN: temp.MERCADOPAGO_ACCESS_TOKEN,

  CORP_EMAIL_USER: temp.CORP_EMAIL_USER,
  CORP_EMAIL_KEY : temp.CORP_EMAIL_KEY ,

  TOKEN_LIFE_SECONDS: temp.TOKEN_LIFE_SECONDS,
};

// Processing Data Before Inserting
env.SERVER_URL = temp.DOMAIN === 'localhost' ?
  `http://${temp.DOMAIN}:${temp.PORT}`:
  `https://${temp.DOMAIN}`            ;

env.STATE = temp.DOMAIN === 'localhost' ?
  'DEV' :
  'PROD';

export default env;
