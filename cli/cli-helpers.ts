import type {CommandModule} from 'yargs';

export const cmd = <T, U>(obj: CommandModule<T, U>): CommandModule<T, U> => obj;

export const cwd = process.cwd();
