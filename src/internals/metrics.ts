import {Metric} from '#src/utils/effect.ts';

export const invokeCount = Metric
    .counter(
        'invoke_count',
        {
            description: 'total invokes in lambda instance lifetime',
            incremental: true,
        },
    )
    .pipe(Metric.withConstantInput(1));

export const errorCount = Metric
    .counter(
        'error_count',
        {
            description: 'total errors in lambda instance lifetime',
            incremental: true,
        },
    )
    .pipe(Metric.withConstantInput(1));
