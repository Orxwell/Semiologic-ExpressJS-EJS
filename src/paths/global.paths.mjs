import { fileURLToPath } from 'url' ;
import { dirname, join } from 'path';

const __filename   = fileURLToPath(import.meta.url      );
const project_path = join(dirname(__filename), '/../../');

// Root level path
const src_path   = join(project_path, '/src'   );
const views_path = join(project_path, '/views' );
// Views level path
const errors_path  = join(views_path, '/static');
const private_path = join(views_path, '/static');
const public_path  = join(views_path, '/static');
const static_path  = join(views_path, '/static');
// Static level path
const audio_path = join(static_path, '/audio');
const css_path   = join(static_path, '/css'  );
const icon_path  = join(static_path, '/icon' );
const img_path   = join(static_path, '/img'  );
const js_path    = join(static_path, '/js'   );
const pdf_path   = join(static_path, '/pdf'  );

const utils = {
  srcPath  : src_path  ,
  viewsPath: views_path,

  errorsPath : errors_path ,
  privatePath: private_path,
  publicPath : public_path ,
  staticPath : static_path ,

  audioPath: audio_path,
  cssPath  : css_path  ,
  iconPath : icon_path ,
  imgPath  : img_path  ,
  jsPath   : js_path   ,
  pdfPath  : pdf_path  ,
};

export default utils;
