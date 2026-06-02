import app from './app';
import env from './config/env';
import { connectDB } from './db/connection';

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

startServer().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});