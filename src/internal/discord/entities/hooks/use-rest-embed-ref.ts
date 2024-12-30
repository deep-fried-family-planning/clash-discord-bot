import type {Ex} from '#discord/entities/basic';
import {hooks} from '#discord/entities/hooks/hooks.ts';
import type {RestEmbed} from '#pure/dfx';
import {Ar, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type UseRestEmbedRef = readonly [str, (data: Partial<RestEmbed>) => Partial<RestEmbed>];
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


export const updateRestEmbedRef = (embeds: Ex.Grid) => {
  return pipe(
    hooks.embeds,
    Ar.reduce(embeds, (acc, [id, updater]) => {
      return acc.map((embed) => {
        if (embed.path.ref === id) {
          return {
            ...embed,
            data: {
              ...embed.data,
              ...updater(embed.data),
            },
          } as typeof embed;
        }
        return embed;
      });
    }),
  );
};
