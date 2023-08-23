import { MongooseModuleOptions } from '@nestjs/mongoose';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'mongo',
  (): MongooseModuleOptions => ({
    uri: process.env.MONGODB_DSN,
  }),
);
