import {mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import type {num, str, url} from '#src/internal/pure/types-pure.ts';
import {pipe} from 'effect/Function';

export const dUndr = (s: string) => `__${s}__`;
export const dCrss = (s: string) => `~~${s}~~`;
export const dItlc = (s: string) => `*${s}*`;
export const dBold = (s: string) => `**${s}**`;
export const dSpoi = (s: string) => `||${s}||`;

export const dHdr1 = (s: string) => `# ${s}`;
export const dHdr2 = (s: string) => `## ${s}`;
export const dHdr3 = (s: string) => `### ${s}`;
export const dSubH = (s: string) => `-# ${s}`;

export const dCode = (s: string) => `\`${s}\``;
export const dCodes = (s: string[]) => pipe(s, mapL(dCode));
export const dCdBk = (s: string) => `\`\`\`${s}\`\`\``;
export const dSubC = (s: string) => `-# ${dCode(s)}`;
export const dSUnC = (s: string) => `-# __${dCode(s)}__`;
export const dSUCr = (s: string) => `-# ~~${dCode(s)}~~`;

export const dLink = (s: string, l: url) => `[${s}](${l})`;

export const dNewL = () => `\n`;
export const dEmpL = () => ``;
export const dLine = (s: string) => `${s}\n`;
export const dLines = (s: string[]) => pipe(s, mapL(dLine));
export const dLinesS = (...s: string[]) => pipe(s, dLines, reduceL('', (as, a) => as + a));

export const nIdex = (n: num) => n.toFixed(2);
export const nPrct = (n: num) => `${(n * 100).toFixed()}%`.padStart(3);
export const nNatr = (n: num) => `${Math.ceil(n)}`.padStart(2);
export const nNatT = (n: num) => `${n}`.padStart(2);

export const NA = 'N/A';

export const dNotA = () => `WIP`;

export const dtRel = (n: num = Date.now()) => `<t:${Math.floor(n / 1000)}:R>`;
export const dtFul = (n: num = Date.now()) => `<t:${Math.floor(n / 1000)}:F>`;

export const dtNow = () => new Date(Date.now());
export const dtNowIso = () => new Date(Date.now()).toISOString();

export const dmUser = (u: str) => `<@${u}>`;
export const dmRole = (r: str) => `<@&${r}>`;
