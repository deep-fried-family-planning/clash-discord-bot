import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';

export const jsonEmbed = (o: unknown) => ({
  color      : nColor(COLOR.SUCCESS),
  description: JSON.stringify(o, null, 2),
} as const);
