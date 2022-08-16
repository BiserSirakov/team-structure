import express from 'express';

import helmet from 'helmet';
import cors from 'cors';

import routes from './routes';

const app = express();

// adding a set of security middlewares
app.use(helmet());

// CORS policy for the client app
app.use(cors({ origin: 'http://localhost:4200', methods: 'GET' }));

// parse incoming request body and append data to `req.body`
app.use(express.json());

routes(app);

export default app;
