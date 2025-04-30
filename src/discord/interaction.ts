import {OmniBoard} from '#src/discord/omni-board/omni-board.tsx';
import {E} from '#src/internal/pure/effect.ts';
import {InteractionCallbackType} from 'dfx/types';

export const PONG = {type: InteractionCallbackType.PONG};
export const DEFER_SOURCE = {type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE};

export const succeedResponse = (code: number, body?: any) => {
  if (!body) {
    return E.succeed({
      statusCode: code,
    });
  }
  return E.succeed({
    statusCode: code,
    body      : JSON.stringify(body),
  });
};

export const makeResponse = (code: number, body?: any) => {
  if (!body) {
    return {
      statusCode: code,
    };
  }
  return {
    statusCode: code,
    body      : JSON.stringify(body),
  };
};
console.log(OmniBoard.toString());
