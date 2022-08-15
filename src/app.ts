import express from 'express';
import helmet from 'helmet';

const app = express();

// adding a set of security middlewares
app.use(helmet());

app.listen(1010, () => {
  console.log('The Team Structure app is running...');
});
