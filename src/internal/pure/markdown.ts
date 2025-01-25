import {Ar, f, p} from '#src/internal/pure/effect';
import type {num, str, url} from '#src/internal/pure/types-pure.ts';



export const m_user = (s: str) => `<@${s}>`;
export const m_role = (s: str) => `<@&${s}>`;


export const convert = (n: num) => Math.floor(n / 1000);
export const tR      = (s: num) => `<t:${convert(s)}:R>`;
export const tF      = (s: num) => `<t:${convert(s)}:F>`;


export const mask    = (s: str, link: url) => `[${s}](${link})`;
export const linksup = (s: str, link: url) => `<${link}>`;
export const masksup = (s: str, link: url) => `[${s}](<${link}>)`;


export const underline = (s: str) => `__${s}__`;
export const strike    = (s: str) => `~~${s}~~`;
export const italic    = (s: str) => `*${s}*`;
export const bold      = (s: str) => `**${s}**`;
export const spoiler   = (s: str) => `||${s}||`;


export const h1 = (s: str) => `# ${s}`; // header 1
export const h2 = (s: str) => `## ${s}`; // header 2
export const h3 = (s: str) => `### ${s}`; // header 3
export const sh = (s: str) => `-# ${s}`; // sub header


export const code      = (s: str) => `\`${s}\``;
export const codeblock = (s: str) => `\`\`\`${s}\`\`\``;


export const newline = '\n';
export const empty   = '';

export const sum     = (delim: str) => Ar.join(delim);
export const add     = (a: str) => (b: str) => `${b}${a}`;
export const content = (...as: str[]) => p(as, sum(newline));


export const sh_tR = f(tF, sh);
