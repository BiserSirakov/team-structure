import express from 'express';

import helmet from 'helmet';

import routes from './routes';

const app = express();

// adding a set of security middlewares
app.use(helmet());

// parse incoming request body and append data to `req.body`
app.use(express.json());

app.listen(1010, () => {
  console.log('The Team Structure app is running...');

  routes(app);
});
