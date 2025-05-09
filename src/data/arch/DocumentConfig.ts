import * as E from 'effect/Effect';
import * as Config from 'effect/Config';

export class DocumentConfig extends E.Service<DocumentConfig>()('deepfryer/DocumentConfig', {
  effect: Config.all({
    TableName: Config.succeed(process.env.DDB_OPERATIONS),
  }),
  accessors: true,
}) {}
