import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import type {DUser} from '#src/dynamo/schema/discord-user.ts';
import type {IxD} from '#src/internal/discord.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



type ixs = {
  original: IxD;
  user    : DUser;
  server  : DServer;

  kind: str;


  system: {
    type: str;
    desc: str;

  };

  viewer: {
    type: str;
  };

  editor: {
    type: str;
  };

  nav: {
    back : str;
    next : str;
    close: str;
  };
};
