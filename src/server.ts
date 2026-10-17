import app from '@/app';
import { ENV } from '@/config/env';

const HOST = '0.0.0.0';

const startServer = () => {
  try {
    // Bind explicitly to 0.0.0.0 so the platform proxy (e.g. Render) can reach
    // the server. Listening on ENV.PORT is required by most hosts.
    app.listen(ENV.PORT, HOST, () => {
      console.log('--------------------------------------------------');
      console.log(`🚀 ${ENV.APP_NAME} started successfully!`);
      console.log(`📡 URL: ${ENV.BACKEND_URL}`);
      console.log(`🌍 MODE: ${ENV.NODE_ENV}`);
      console.log(`🔌 Listening on ${HOST}:${ENV.PORT}`);
      console.log('--------------------------------------------------');
    });
  } catch (error) {
    console.error('❌ CRITICAL: Could not start the engine:', error);
    process.exit(1);
  }
};

startServer();