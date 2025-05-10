import * as Ar from 'effect/Array';
import {flow, pipe} from 'effect/Function';

export const m_user = (s: string) => `<@${s}>`;
export const m_role = (s: string) => `<@&${s}>`;
export const convert = (n: number) => Math.floor(n / 1000);
export const tR = (s: number) => `<t:${convert(s)}:R>`;
export const tF = (s: number) => `<t:${convert(s)}:F>`;
export const mask = (s: string, link: string) => `[${s}](${link})`;
export const linksup = (s: string, link: string) => `<${link}>`;
export const masksup = (s: string, link: string) => `[${s}](<${link}>)`;
export const underline = (s: string) => `__${s}__`;
export const strike = (s: string) => `~~${s}~~`;
export const italic = (s: string) => `*${s}*`;
export const bold = (s: string) => `**${s}**`;
export const spoiler = (s: string) => `||${s}||`;
export const h1 = (s: string) => `# ${s}`; // header 1
export const h2 = (s: string) => `## ${s}`; // header 2
export const h3 = (s: string) => `### ${s}`; // header 3
export const sh = (s: string) => `-# ${s}`; // sub header
export const code = (s: string) => `\`${s}\``;
export const codeblock = (s: string) => `\`\`\`${s}\`\`\``;
export const newline = '\n';
export const empty = '';
export const sum = (delim: string) => Ar.join(delim);
export const add = (a: string) => (b: string) => `${b}${a}`;
export const content = (...as: string[]) => pipe(as, sum(newline));
export const sh_tR = flow(tF, sh);
