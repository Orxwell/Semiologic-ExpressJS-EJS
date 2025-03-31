// Framework for the Back-End
import { Router } from 'express';

// Middlewares for the endpoints
import handler from '../middlewares/handler.middleware.mjs';

// Controllers for APIs
//import CRUDController from '../controllers/db.controller.mjs';

// External & Internal Libraries
import { access, constants, readdir } from 'fs/promises';
import { lookup }                     from 'mime-types' ;
import { join }                       from 'path'       ;

import utils from '../paths/global.paths.mjs';
import env   from '../importers/env.load.mjs';

// Async-function to get the folders of a folder...
async function getFolders(directoryPath) {
  try {
    const folders = await readdir(directoryPath, { withFileTypes: true });

    return folders.filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (_) { return; }
}

// Async-function to get the files of a folder...
async function getFiles(directoryPath) {
  try {
    const files = await readdir(directoryPath, { withFileTypes: true });
    
    return files.filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);
  } catch (_) { return; }
}

const routerAPI = Router();

// >>-------- GET - API in General - Below --------<<
routerAPI.get('/api', async (_req, res) => {
  const folders = await getFolders(utils.staticPath);

  if (!folders) { return res.sendStatus(404); }
  
  const endpoints = folders.map(folder => `${env.SERVER_URL}/api/${folder}`);

  return res.status(202)
    .json(
      {
        avaliableFolders  : folders  ,
        availableEndpoints: endpoints,
      }
    );
});
// >>-------- GET - API in General - Above --------<<


// >>-------- GET - API for Audio - Below --------<<
routerAPI.get('/api/audio',
  async (req, res) => {
    const files = await getFiles(utils.audioPath);

    if (!files)             { return res.sendStatus(404); }
    if (files.length === 0) { return res.sendStatus(200); }

    const endpoints = files.map(file => `${env.SERVER_URL}/api/audio/${file}`);

    return res.status(202)
      .json(
        {
          avaliableFiles        : files    ,
          availableIconEndpoints: endpoints,
        }
      );
  }
);

routerAPI.get('/api/audio/:id',
  handler.parameters({ listOfParameters: ['id'] }),
  async (req, res) => {
    const requestedAudioPath = join(utils.audioPath, req.params.id);

    // Try-Catch
    try {
      await access(requestedAudioPath, constants.F_OK);

      res.setHeader('Content-Type', 'audio/mpeg');

      return res.sendFile(requestedAudioPath);
      
    } catch (_) { return res.sendStatus(404); }
  }
);
// >>-------- GET - API for Audio - Above --------<<


// >>-------- GET - API for CSS - Below --------<<
routerAPI.get('/api/css', async (_req, res) => {
  const folders = await getFolders(utils.cssPath);

  if (!folders) { return res.sendStatus(404); }

  const endpoints = folders.map(folder => `${env.SERVER_URL}/api/css/${folder}`);
  
  return res.status(200)
    .json(
      {
        avaliableFolders     : folders  ,
        availableCSSEndpoints: endpoints,
      }
    );
});

routerAPI.get('/api/css/:route',
  handler.parameters({ listOfParameters: ['route'] }),
  async (req, res) => {
    const route = req.params.route;
    const files = await getFiles(join(utils.cssPath, route));

    if (!files)             { return res.sendStatus(404); }
    if (files.length === 0) { return res.sendStatus(200); }

    const endpoints = files.map(file => `${env.SERVER_URL}/api/css/${route}/${file}`);

    return res.status(202)
      .json(
        {
          avaliableFiles       : files    ,
          availableCSSEndpoints: endpoints,
        }
      );
  }
);

routerAPI.get('/api/css/:of/:id',
  handler.parameters({ listOfParameters: ['of', 'id'] }),
  async (req, res) => {
    const { of, id } = req.params;

    const requestedCssPath = join(utils.cssPath, `${of}/${id}`);

    // Try-Catch
    try {
      await access(requestedCssPath, constants.F_OK);

      res.setHeader('Content-Type', 'text/css');

      return res.sendFile(requestedCssPath);
      
    } catch (_) { return res.sendStatus(404); }
  }
);
// >>-------- GET - API for CSS - Above --------<<


// >>-------- GET - API for Icons - Below --------<<
routerAPI.get('/api/icon',
  async (req, res) => {
    const files = await getFiles(utils.iconPath);

    if (!files)             { return res.sendStatus(404); }
    if (files.length === 0) { return res.sendStatus(200); }

    const endpoints = files.map(file => `${env.SERVER_URL}/api/icon/${file}`);

    return res.status(202)
      .json(
        {
          avaliableFiles       : files    ,
          availableIconEndpoints: endpoints,
        }
      );
  }
);

routerAPI.get('/api/icon/:id',
  handler.parameters({ listOfParameters: ['id'] }),
  async (req, res) => {
    const requestedIconPath = join(utils.iconPath, req.params.id);

    // Try-Catch
    try {
      await access(requestedIconPath, constants.F_OK);

      res.setHeader('Content-Type', 'image/x-icon');

      return res.sendFile(requestedIconPath);
      
    } catch (_) { return res.sendStatus(404); }
  }
);
// >>-------- GET - API for Icons - Above --------<<


// >>-------- GET - API for Images - Below --------<<
// Important Internal Constants: (IIC) --------------¬
const ALLOWED_FORMATS = ['png', 'jpg', 'jpeg', 'webp'];

routerAPI.get('/api/img', async (_req, res) => {
  const folders = await getFolders(utils.imgPath);

  if (!folders) { return res.sendStatus(404); }

  const endpoints = folders.map(folder => `${env.SERVER_URL}/api/img/${folder}`);
  
  return res.status(200)
    .json(
      {
        availableFolders     : folders  ,
        avaliableImgEndpoints: endpoints,
      }
    );
});

routerAPI.get('/api/img/:route',
  handler.parameters({ listOfParameters: ['route'] }),
  async (req, res) => {
    const route = req.params.route;
    const files = await getFiles(join(utils.imgPath, route));

    if (!files)             { return res.sendStatus(404); }
    if (files.length === 0) { return res.sendStatus(200); }

    const endpoints = files.map(file => `${env.SERVER_URL}/api/img/${route}/${file}`);

    return res.status(202)
      .json(
        { availableImgFiles    : files    ,
          avaliableImgEndpoints: endpoints,
        }
      );
  }
);

routerAPI.get('/api/img/:of/:id',
  handler.parameters({ listOfParameters: ['of', 'id'] }),
  async (req, res) => {
    const { of, id } = req.params;

    if (!ALLOWED_FORMATS.includes(id.split('.').at(-1))) {
      return res.status(400).json({ error: `Unsupported Format, instead use: ${ALLOWED_FORMATS.join(', ')}` });
    }

    const requestedImgPath = join(utils.imgPath, `${of}/${id}`);

    // Try-Catch
    try {
      await access(requestedImgPath, constants.F_OK);

      res.setHeader('Content-Type', lookup(requestedImgPath));

      return res.sendFile(requestedImgPath);
      
    } catch (_) { return res.sendStatus(404); }
  }
);
// >>-------- GET - API for Images - Above --------<<


// >>-------- GET - API for JavaScript - Below --------<<
routerAPI.get('/api/js',
  async (req, res) => {
    const files = await getFiles(utils.jsPath);

    if (!files)             { return res.sendStatus(404); }
    if (files.length === 0) { return res.sendStatus(200); }

    const endpoints = files.map(file => `${env.SERVER_URL}/api/js/${file}`);

    return res.status(202)
      .json(
        {
          avaliableFiles        : files    ,
          availableIconEndpoints: endpoints,
        }
      );
  }
);

routerAPI.get('/api/js/:id',
  handler.parameters({ listOfParameters: ['id'] }),
  async (req, res) => {
    const requestedJSPath = join(utils.jsPath, req.params.id);

    // Try-Catch
    try {
      await access(requestedJSPath, constants.F_OK);

      res.setHeader('Content-Type', 'text/javascript');

      return res.sendFile(requestedJSPath);
      
    } catch (_) { return res.sendStatus(404); }
  }
);
// >>-------- GET - API for Icons - Above --------<<

export default routerAPI;
