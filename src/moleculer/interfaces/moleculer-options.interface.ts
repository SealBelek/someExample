import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { BrokerOptions } from 'moleculer';

export interface MoleculerModuleOptions extends BrokerOptions {
  [key: string]: unknown;
  brokerName?: string;
}

export interface MoleculerOptionsFactory {
  createMoleculerOptions():
    | Promise<MoleculerModuleOptions>
    | MoleculerModuleOptions;
}

export interface MoleculerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  brokerName?: string;
  useExisting?: Type<MoleculerOptionsFactory>;
  useClass?: Type<MoleculerOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MoleculerModuleOptions> | MoleculerModuleOptions;
  inject?: any[];
}
