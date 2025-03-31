import { join } from 'path';

import utils from './global.paths.mjs';

const errors_path  = join(utils.viewsPath, '/errors' );
const private_path = join(utils.viewsPath, '/private');
const public_path  = join(utils.viewsPath, '/public' );

// HANDLING ERRORS
const error_at_getEJS  = join(errors_path, '/at_get.error.ejs' );
const error_at_postEJS = join(errors_path, '/at_post.error.ejs');

// PRIVATE EJS - STAFFS
const private_loginEJS = join(private_path, '/login.private.ejs');

// PUBLIC EJS - CLIENTS
const public_landingEJS = join(public_path, '/landing.public.ejs');

const templates = {
  errorAtGetEJS : error_at_getEJS ,    //! 
  errorAtPostEJS: error_at_postEJS,    //!

  privateLoginEJS: private_loginEJS,   //!

  publicLandingEJS: public_landingEJS, //!
};

export default templates;
