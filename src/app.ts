import express, { Application } from 'express';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payment';

const app: Application = express();

app.use(express.json());

app.use('/auth',     authRoutes);
app.use('/payments', paymentRoutes);
export default app;