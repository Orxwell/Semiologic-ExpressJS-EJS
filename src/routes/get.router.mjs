// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import templates from '../paths/templates.paths.mjs';

// Middlewares for the endpoints
//import handler from '../middlewares/handler.middleware.mjs';

// Controllers for APIs
//import CRUDController from '../controllers/db.controller.mjs';

// External & Internal Libraries
import env from '../importers/env.load.mjs';

const routerGET = Router();

/* ~~RECYCLE~~
  handler.keyValues({ listOfKeys: [], method: 'GET' }),
  handler.parameters({ listOfParameters: [] }),
*/

// -----------GET - Public Routes - BELOW-----------
routerGET.get('/',
  async (req, res) => {
    const query_package = req.query;

    // Declaring
    const data = {};

    // Fetching with APIs

    // Handling & Proccessing
    data.counter = 0;

    // Try-Catch
    try {
      return res.render(templates.publicLandingEJS, {
        title: 'Semiologic Game',

        data: data,

        SERVER_URL: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

routerGET.get('/*',
  async (req, res) => {
    // Try-Catch
    try {
      return res.render(templates.errorAtGetEJS, {
        title: 'Get-Error',

        SERVER_URL: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);
// -----------GET - Public Routes - ABOVE-----------

// -----------GET - Private Routes - BELOW-----------
// -----------GET - Private Routes - ABOVE-----------

export default routerGET;
