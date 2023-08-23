import { registerAs } from '@nestjs/config';
import { getPackageName, getNodeIdWithPrefix } from '../utils/os';

export interface ObservabilityOpt {
  observabilityEndpoint?: string;
  serviceName?: string;
  productID?: string;
  tenantID?: string;
  internalDebug: true;
  nodeID: string;
  logLevel: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';
}

export default registerAs(
  'observability',
  (): ObservabilityOpt => ({
    observabilityEndpoint: process.env.LOG_OBSERVABILITY_ENDPOINT,
    serviceName: getPackageName(),
    nodeID: process.env.SB_NODE_ID || getNodeIdWithPrefix(getPackageName()),
    productID: process.env.PRODUCT_ID,
    tenantID: process.env.TENANT_ID,
    internalDebug: true,
    logLevel:
      (process.env.LOG_LOG_LEVEL as ObservabilityOpt['logLevel']) || 'info',
  }),
);
