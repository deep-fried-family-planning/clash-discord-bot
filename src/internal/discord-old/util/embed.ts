import {type COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';



export const jsonEmbed = (o: unknown) => ({
  description: JSON.stringify(o, null, 2),
} as const);


export const dEmbed = (c: COLOR, title: string, ...ds: string[]) => ({
  color      : nColor(c),
  title      : title,
  description: dLinesS(...ds),
});
