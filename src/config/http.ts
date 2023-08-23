import { registerAs } from '@nestjs/config';
import { HttpConfig } from './interfaces';
import { PATHS } from './constants';

export default registerAs(
  PATHS.HttpClient,
  (): HttpConfig => ({
    proxy: {
      http: process.env.EXT_HTTP_PROXY,
      https: process.env.EXT_HTTPS_PROXY,
    },
    timeout: process.env.HTTP_CLIENT_TIMEOUT
      ? parseInt(process.env.HTTP_CLIENT_TIMEOUT)
      : undefined,
    initRequest: process.env.HTTP_INIT_REQUEST,
  }),
);
