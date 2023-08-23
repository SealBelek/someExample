import { Logger } from '@nestjs/common';

export function getServiceToken(name: string) {
  return `${name}|MoleculerService`;
}

export function getBrokerToken(name: string) {
  return `${name}|MoleculerBroker`;
}
