const temp = {
  PORT      : process.env.PORT   ?? 5050       ,
  DOMAIN    : process.env.DOMAIN ?? 'localhost',
  SERVER_URL: '',
};

const env = {
  PORT      : temp.PORT      ,
  DOMAIN    : temp.DOMAIN    ,
  SERVER_URL: temp.SERVER_URL,
};

// Processing Data Before Inserting
env.SERVER_URL = temp.DOMAIN === 'localhost' ?
  `http://${temp.DOMAIN}:${temp.PORT}` :
  `https://${temp.DOMAIN}`;

export default env;
