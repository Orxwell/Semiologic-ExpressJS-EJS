import express from 'express';
import ejs     from 'ejs'    ;

import router from './routes/exporter.router.mjs';
import env    from './importers/env.load.mjs'    ;

const app = express();

app.set('view engine', ejs);

// Configuring the server
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the routes
router.forEach(route => app.use(route));

(async () => {
  app.listen(env.PORT, () => {
    console.log(
      `  ~Server listen at port ${env.PORT}~\n` +
      `  ~[ ${env.SERVER_URL} ]~`
    );
  });
})();
