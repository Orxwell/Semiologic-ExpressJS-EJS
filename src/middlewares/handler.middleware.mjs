import handlingParameters from './parameters.middleware.mjs';
import handlingKeyValues  from './keyValues.middleware.mjs' ;
// Import more middlewares if it's needed

const handler = {
  'parameters': handlingParameters,
  'keyValues' : handlingKeyValues ,
}

export default handler;

