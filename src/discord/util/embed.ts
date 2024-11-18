import {type COLOR, nColor} from '#src/internal/constants/colors.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';

export const jsonEmbed = (o: unknown) => ({
    description: JSON.stringify(o),
} as const);


export const dEmbed = (c: COLOR, title: string, ...ds: string[]) => ({
    color      : nColor(c),
    title      : title,
    description: dLinesS(...ds),
});