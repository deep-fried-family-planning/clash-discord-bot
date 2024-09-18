import type {BuildOptions} from 'esbuild';
import {readdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const lambdas = (await readdir('src', {withFileTypes: true, recursive: true}))
    .filter((l) => l.name === 'index.ts')
    .map((l) => resolve(l.parentPath, l.name));

export default {

    entryPoints   : lambdas,
    outdir        : 'dist',
    logLevel      : 'info',
    allowOverwrite: true,

    platform: 'node',
    target  : 'node20',

    format      : 'esm',
    outExtension: {'.js': '.mjs'},

    bundle           : true,
    external         : ['@aws-sdk/*', 'node:*'],
    treeShaking      : true,
    minifySyntax     : true,
    minifyIdentifiers: true,
    minifyWhitespace : true,
    sourcemap        : 'linked',
    sourcesContent   : false,

} satisfies BuildOptions;
