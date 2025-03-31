// Framework for the Back-End
import { Router } from 'express';

// Middlewares for the endpoints
import handler from '../middlewares/handler.middleware.mjs';

// Controllers for APIs
//import CRUDController from '../controllers/db.controller.mjs';

// External & Internal Libraries

const routerPOST = Router();

/* ~~RECYCLE~~
  handler.keyValues({ listOfKeys: [], method: 'POST' }),
  handler.parameters({ listOfParameters: [] }),
*/

// -----------POST - Public Routes - BELOW-----------
routerPOST.post('/',
  async (req, res) => {
    const body_package = req.body;

    // Declaring
    const data = {};
    
    // Fetching

    // Handling & Proccessing

    // Try-Catch
    try       { return res.sendStatus(200); }
    catch (_) { return res.sendStatus(503); }
  }
);
// -----------POST - Public Routes - ABOVE-----------

// -----------POST - Private Routes - BELOW-----------
// -----------POST - Private Routes - ABOVE-----------

export default routerPOST;
