import {useIx} from '#src/disreact/index.ts';

export const useCaller = () => {
  const ix = useIx();

  return {
    roles   : ix.member!.roles,
    user_id : ix.member!.user.id,
    guild_id: ix.guild!.id,
  };
};
