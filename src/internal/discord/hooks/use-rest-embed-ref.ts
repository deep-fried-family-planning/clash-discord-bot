import {hooks} from '#discord/hooks/hooks.ts';
import type {RestEmbed} from '#pure/dfx';
import {Ar, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {ExV} from '../index.ts';


export type UseRestEmbedRef = readonly [str, (embed: Partial<RestEmbed>) => Partial<RestEmbed>];
const noop = (embed: Partial<RestEmbed>) => embed;


export const useRestEmbedRef = (id: str) => {
  const embedRefId = `embed_${id}`;

  hooks.embeds.push([embedRefId, noop]);


  const updater = (updated: Partial<RestEmbed>) => {
    hooks.embeds.push([embedRefId, (embed) => {
      return {
        ...embed,
        ...updated,
      };
    }]);
  };

  return [embedRefId, updater] as const;
};


export const updateRestEmbedRef = (embeds: ExV.Type[]) => {
  return pipe(
    hooks.embeds,
    Ar.reduce(embeds, (acc, [id, updater]) => {
      return acc.map((embed) => {
        if ('ref' in embed && embed.ref === id) {
          return updater(embed) as typeof embed;
        }
        return embed;
      });
    }),
  );
};
