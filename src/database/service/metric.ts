import {Metric} from 'effect';

export const DatabaseRequestCount = Metric.counter(
  'database_request_count',
  {
    description: 'total database requests in instance lifetime',
    incremental: true,
  },
);

export const DatabaseRequestErrors = Metric.counter(
  'database_request_errors',
  {
    description: 'total database request errors in instance lifetime',
    incremental: true,
  },
);

export const DatabaseDecodeErrors = Metric.counter(
  'database_decode_errors',
  {
    description: 'total database decode errors in instance lifetime',
    incremental: true,
  },
);

export const DatabaseEncodeErrors = Metric.counter(
  'database_encode_errors',
  {
    description: 'total database encode errors in instance lifetime',
    incremental: true,
  },
);

export const DatabaseConsumedReadCapacity = Metric.counter(
  'database_consumed_read_capacity',
  {
    description: 'total database consumed read capacity in instance lifetime',
    incremental: true,
  },
);

export const DatabaseConsumedWriteCapacity = Metric.counter(
  'database_consumed_write_capacity',
  {
    description: 'total database consumed write capacity in instance lifetime',
    incremental: true,
  },
);
