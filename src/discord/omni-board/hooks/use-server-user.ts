import {useState} from '#discord/hooks/use-state.ts';
import {useViewEffect} from '#discord/hooks/use-view-effect.ts';
import {g} from '#pure/effect';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import type {DUser} from '#src/dynamo/schema/discord-user.ts';
import type {und} from '#src/internal/pure/types-pure.ts';


export const useServerUser = () => {
  const [count, setCount] = useState('suc', 0);

  let user: DUser | und     = undefined,
      server: DServer | und = undefined;

  useViewEffect(`${count}`, (ix) => g(function * () {
    user   = yield * MenuCache.userRead(ix.member?.user?.id ?? '');
    server = yield * MenuCache.serverRead(ix.guild_id!);
    setCount(count + 1);
  }));


  return [user, server];
};
