import { connectDb } from './config/db';
import { env } from './config/env';
import { app } from './app';

async function bootstrap() {
  await connectDb();
  app.listen(env.PORT, () => {
    console.log(`NowNext backend running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
