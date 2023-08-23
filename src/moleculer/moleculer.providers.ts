import { ServiceBroker, ServiceSchema } from 'moleculer';
import { getBrokerToken, getServiceToken } from './common/moleculer.utils';
import { DEFAULT_BROKER } from './moleculer.constants';
import { Provider } from '@nestjs/common';

export function createMoleculerProviders(
  brokerName: string = DEFAULT_BROKER,
  services: {
    name: string;
    schema: ServiceSchema;
    schemaMods?: ServiceSchema;
  }[] = [],
): Provider[] {
  const providers = (services || []).map((service) => {
    return {
      provide: getServiceToken(service.name),
      useFactory: (broker: ServiceBroker) =>
        broker.createService(service.schema, service.schemaMods),
      inject: [
        brokerName === DEFAULT_BROKER
          ? DEFAULT_BROKER
          : getBrokerToken(brokerName),
      ],
    };
  });
  return providers;
}
