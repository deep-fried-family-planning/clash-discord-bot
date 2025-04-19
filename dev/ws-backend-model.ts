

import type {str} from '#src/internal/pure/types-pure.ts';
import {handler as lambda_ix_menu} from '#src/ix_menu.ts';
import {handler as lambda_ix_menu_close} from '#src/ix_menu_close.ts';
import {handler as lambda_ix_slash} from '#src/ix_slash.ts';
// import {handler as lambda_poll} from '#src/poll.ts';
// import {handler as lambda_task} from '#src/task.ts';
import {stubLambdaContext} from './stub-lambda-context.ts';



const lookup = {
  ix_menu      : lambda_ix_menu,
  ix_menu_close: lambda_ix_menu_close,
  ix_slash     : lambda_ix_slash,
  // poll         : lambda_poll,
  // task         : lambda_task,
};


export const wsBackendModel = async (kind: str, data: any) => {
  if (kind in lookup) {
    await lookup[kind as keyof typeof lookup](data, stubLambdaContext);
  }
};
