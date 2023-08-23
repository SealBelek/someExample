import { Payload } from '../models';

export interface MoleculerCommandPublisher {
  publishCommand(payload: Payload): Promise<void>;
}

export interface KafkaPublisher {
  publishCommand(payload: Payload): Promise<void>;
}
