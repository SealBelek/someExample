import { types } from 'util';
import {
  ActionHandler,
  ActionSchema,
  ServiceEvent,
  Middleware,
  CallMiddlewareHandler,
  Context as MoleculerContext,
} from 'moleculer';
import { api } from '@opentelemetry/sdk-node';
import { Context as OtelContext, Attributes } from '@opentelemetry/api';
import {
  SemanticResourceAttributes,
  SemanticAttributes,
} from '@opentelemetry/semantic-conventions';

interface MoleculerContextMeta {
  $otel?: unknown;
}

// https://github.com/icebob/moleculer-opentelemetry-demo/blob/master/opentelemetry.middleware.js
export const tracing: () => Middleware = () => {
  const tracer = api.trace.getTracer('moleculer');

  return {
    // Принимаем удаленный или локальный вызов
    localAction(handler: ActionHandler, action: ActionSchema) {
      return function tracingLocalActionMiddleware(
        ctx: MoleculerContext<unknown, MoleculerContextMeta>,
      ) {
        // Get the active span
        const parentSpan = api.trace.getSpan(api.context.active());
        let parentCtx: OtelContext | undefined;

        if (parentSpan) {
          parentCtx = api.trace.setSpan(api.context.active(), parentSpan);
        }

        if (ctx.meta.$otel) {
          parentCtx = api.propagation.extract(
            parentCtx || api.context.active(),
            ctx.meta.$otel,
          );
          delete ctx.meta.$otel;
        }

        const tags: Attributes = {
          callingLevel: ctx.level,
          [SemanticAttributes.RPC_SYSTEM]: 'moleculer',
          [SemanticAttributes.RPC_SERVICE]: ctx.action?.name ?? '',
          remoteCall: ctx.nodeID !== ctx.broker.nodeID,
          callerNodeID: ctx.nodeID || undefined,
          nodeID: ctx.broker.nodeID,
          'options.timeout': ctx.options?.timeout ?? '',
          'options.retries': ctx.options?.retries ?? '',
          requestID: ctx.requestID || undefined,
        };

        const spanName = `action '${ctx.action?.name}'`;

        const span = tracer.startSpan(
          spanName,
          { attributes: tags, kind: api.SpanKind.CONSUMER },
          parentCtx,
        );

        if (action.service?.fullName) {
          span.setAttribute(
            SemanticResourceAttributes.SERVICE_NAME,
            action.service?.fullName,
          );
        }
        const spanContext = api.trace.setSpan(api.context.active(), span);

        let probablyPromisRes: unknown;
        return api.context.with(spanContext, () => {
          try {
            // Call the handler
            probablyPromisRes = handler(ctx);

            span.setAttribute('fromCache', ctx.cachedResult);
          } catch (err) {
            if (err instanceof Error || typeof err === 'string') {
              span.recordException(err);
              span.setStatus({ code: api.SpanStatusCode.ERROR });
              span.end();
            }

            throw err;
          }

          if (types.isPromise(probablyPromisRes)) {
            return probablyPromisRes
              .then((res) => {
                span.setAttribute('fromCache', ctx.cachedResult);

                return res;
              })
              .catch((err) => {
                span.recordException(err);
                span.setStatus({ code: api.SpanStatusCode.ERROR });

                throw err;
              })
              .finally(() => span.end());
          }

          span.end();
          return probablyPromisRes;
        });
      }.bind(this);
    },

    // Принимаем удаленный или локальное событие
    localEvent(handler: ActionHandler, event: ServiceEvent) {
      return function tracingLocalEventMiddleware(
        ctx: MoleculerContext<unknown, MoleculerContextMeta>,
      ) {
        // Get the active span
        const parentSpan = api.trace.getSpan(api.context.active());
        let parentCtx: OtelContext | undefined;

        if (parentSpan) {
          parentCtx = api.trace.setSpan(api.context.active(), parentSpan);
        }

        if (ctx.meta.$otel) {
          parentCtx = api.propagation.extract(
            parentCtx || api.context.active(),
            ctx.meta.$otel,
          );
          // delete ctx.meta.$otel; // Можно не удалялять, при каждом вызове будет создаваться новый контекст. Если удалять, то контекст отправится только в один из евентов
        }

        const tags: Attributes = {
          callingLevel: ctx.level,
          remoteCall: ctx.nodeID !== ctx.broker.nodeID,
          callerNodeID: ctx.nodeID || undefined,
          nodeID: ctx.broker.nodeID,
          requestID: ctx.requestID || undefined,
          'message.destination.name': ctx.event?.name ?? '',
          [SemanticAttributes.MESSAGING_DESTINATION_KIND]: 'topic',
        };

        const spanName = `event '${ctx.event?.name}'`;

        const span = tracer.startSpan(
          spanName,
          { attributes: tags, kind: api.SpanKind.CONSUMER },
          parentCtx,
        );

        if (event.name) {
          span.setAttribute(
            SemanticResourceAttributes.SERVICE_NAME,
            event.name,
          );
        }

        const spanContext = api.trace.setSpan(api.context.active(), span);

        let probablyPromisRes: unknown;
        return api.context.with(spanContext, () => {
          try {
            // Call the handler
            probablyPromisRes = handler(ctx);

            span.setAttribute('fromCache', ctx.cachedResult);
          } catch (err) {
            if (err instanceof Error || typeof err === 'string') {
              span.recordException(err);
              span.setStatus({ code: api.SpanStatusCode.ERROR });
              span.end();
            }

            throw err;
          }

          if (types.isPromise(probablyPromisRes)) {
            return probablyPromisRes
              .then((res) => {
                span.setAttribute('fromCache', ctx.cachedResult);

                return res;
              })
              .catch((err) => {
                span.recordException(err);
                span.setStatus({ code: api.SpanStatusCode.ERROR });

                throw err;
              })
              .finally(() => span.end());
          }

          span.end();
          return probablyPromisRes;
        });
      }.bind(this);
    },

    // нет аналога remoteAction, будем создавать спан на каждый event
    emit(handler: CallMiddlewareHandler): CallMiddlewareHandler {
      return function (eventName, payload, opts) {
        const parentContext = api.context.active();

        const span = tracer.startSpan(
          `emit ${eventName}`,
          {
            attributes: {
              [SemanticAttributes.MESSAGING_DESTINATION_KIND]: 'topic',
              'message.destination.name': eventName,
            },
            kind: api.SpanKind.PRODUCER,
          },
          parentContext,
        );

        const spanContext = api.trace.setSpan(api.context.active(), span);
        opts = opts ?? {};
        opts.meta = opts.meta ?? {};
        opts.meta.$otel = {};
        api.propagation.inject(spanContext, opts.meta.$otel);

        return api.context.with(spanContext, () => {
          // Call the handler
          // всегда Promise
          return handler(eventName, payload, opts)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              span.recordException(err);
              span.setStatus({ code: api.SpanStatusCode.ERROR });
            })
            .finally(() => span.end());
        });
      };
    },

    // Попадаем сюда перед отправкой на удаленный endpoint
    remoteAction(handler: ActionHandler, action: ActionSchema) {
      return (ctx: MoleculerContext<unknown, MoleculerContextMeta>) => {
        const parentContext = api.context.active();

        const span = tracer.startSpan(
          `remote call ${ctx.action?.name}`,
          {
            attributes: {
              [SemanticAttributes.RPC_SERVICE]: ctx.action?.name ?? '',
              nodeID: ctx.nodeID || undefined,
            },
            kind: api.SpanKind.PRODUCER,
          },
          parentContext,
        );

        if (action.service?.fullName) {
          span.setAttribute(
            SemanticResourceAttributes.SERVICE_NAME,
            action.service.fullName,
          );
        }

        const spanContext = api.trace.setSpan(api.context.active(), span);
        ctx.meta.$otel = {};
        api.propagation.inject(spanContext, ctx.meta.$otel);

        let probablyPromisRes: unknown;
        return api.context.with(spanContext, () => {
          try {
            // Call the handler
            probablyPromisRes = handler(ctx);

            span.setAttribute('fromCache', ctx.cachedResult);
          } catch (err) {
            if (err instanceof Error || typeof err === 'string') {
              span.recordException(err);
              span.setStatus({ code: api.SpanStatusCode.ERROR });
              span.end();
            }

            throw err;
          }

          if (types.isPromise(probablyPromisRes)) {
            return probablyPromisRes
              .then((res) => {
                span.setAttribute('fromCache', ctx.cachedResult);

                return res;
              })
              .catch((err) => {
                span.recordException(err);
                span.setStatus({ code: api.SpanStatusCode.ERROR });

                throw err;
              })
              .finally(() => span.end());
          }

          span.end();
          return probablyPromisRes;
        });
      };
    },
  };
};
