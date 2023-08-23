import { KafkaService } from './kafka.service';

type Handler = (message: unknown) => Promise<void>;

export interface KafkaControllerSchema {
  topics: {
    [topic: string]: Handler;
  };
}

export class KafkaController {
  private handlerFactory = new Map<string, Handler>();
  constructor(private readonly service: KafkaService) {}

  protected parseServiceSchema(schema: KafkaControllerSchema) {
    Object.entries(schema.topics).forEach(([topic, opts]) => {
      this.service.addTopic(topic);
      this.handlerFactory.set(topic, opts.bind(this));
    });

    this.service.addListener((topic, message) => this.listen(topic, message));
  }

  private async listen(topic: string, message: unknown) {
    const handler = this.handlerFactory.get(topic);

    if (handler) {
      handler(message);
    }
  }
}
