import type {Discord} from 'dfx';
import * as Data from 'effect/Data';

export class RegistryDefect extends Data.TaggedError('RegistryDefect')<{
  cause?: any;
}> {}

export class RegistryFailure extends Data.TaggedError('RegistryError')<{
  cause?: any;
}> {}

export class RegistryUserError extends Data.TaggedError('RegistryUserError')<{
  message?: string;
  cause?  : any;
}> {}

export class RegistryAdminError extends Data.TaggedError('RegistryAdminError')<{
  message?: string;
  cause?  : any;
}> {}
