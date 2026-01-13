import 'reflect-metadata';
import { config as configDotenv } from 'dotenv';
import server from './server';
import { printAppInfo } from './utils/print-app-info';
import appConfig from './config/app.config';
import database from '@/lib/mongoose';
import environment from '@/lib/environment';

configDotenv();

server.listen(process.env.PORT, () => {
  const { port, env, appUrl: _appUrl } = environment;
  const {
    api: { basePath, version },
  } = appConfig;
  const appUrl = `${_appUrl}:${port}`;
  const apiUrl = `${appUrl}/${basePath}/${version}/${env}`;
  printAppInfo(port, env, appUrl, apiUrl);
});

process.on('SIGINT', async () => {
  await database.disconnect();
  console.log('MongoDB Disconnected.');
  process.exit(0);
});
