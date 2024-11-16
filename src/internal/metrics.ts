import {E, flow, Metric, pipe} from '#src/internal/pure/effect.ts';
import {Console} from 'effect';

export const invokeCount = Metric
    .counter('invoke_count', {
        description: 'total invokes in lambda instance lifetime',
        incremental: true,
    })
    .pipe(Metric.withConstantInput(1));

export const SSM_counter = pipe(
    Metric.counter('ssm_config_count', {
        description: 'total ssm calls in lambda instance lifetime, should be 1',
        incremental: true,
    }),
    Metric.withConstantInput(1),
);

export const errorCount = Metric
    .counter('error_count', {
        description: 'total errors in lambda instance lifetime',
        incremental: true,
    })
    .pipe(Metric.withConstantInput(1));

export const showMetric = flow(
    Metric.value,
    E.andThen(Console.log),
);
