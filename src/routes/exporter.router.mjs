import routerAPI  from './api.router.mjs' ;
import routerGET  from './get.router.mjs' ;
import routerPOST from './post.router.mjs';
// Remember importing it

const ROUTER = [
  routerAPI,

  routerGET,
  routerPOST,
  // Add another router-method if it's needed...
  //   Example: routerPUT or routerDELETE
];

export default ROUTER;
