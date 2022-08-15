import express from 'express';

import helmet from 'helmet';

import routes from './routes';

const app = express();

// adding a set of security middlewares
app.use(helmet());

// parse incoming request body and append data to `req.body`
app.use(express.json());

routes(app);

export default app;
