import { join } from 'path';

import utils from './global.paths.mjs';

const errors_path  = join(utils.viewsPath, '/errors' );
//const private_path = join(utils.viewsPath, '/private');
const public_path  = join(utils.viewsPath, '/public' );

// HANDLING ERRORS
const error_at_getEJS  = join(errors_path, '/error_at_get.ejs' );
const error_at_postEJS = join(errors_path, '/error_at_post.ejs');

// PRIVATE EJS - STAFFS
//const loginEJS = join(private_path, '/login.ejs');

// PUBLIC EJS - CLIENTS
const landingEJS = join(public_path, '/landing.ejs');

const templates = {
  errorAtGetEJS : error_at_getEJS , //! 
  errorAtPostEJS: error_at_postEJS, //!

  //loginEJS: loginEJS,               //!

  landingEJS: landingEJS,           //!
};

export default templates;
