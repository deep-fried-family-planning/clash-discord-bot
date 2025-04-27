import {Data} from 'effect';

export class RegistrationError extends Data.TaggedError('deepfryer/RegistrationError')<{
  issue: string;
}> {}

export class RegistrationDefect extends Data.TaggedError('deepfryer/RegistrationDefect')<{
  issue: string;
}> {}
