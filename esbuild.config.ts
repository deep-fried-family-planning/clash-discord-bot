import type {BuildOptions} from 'esbuild';
import {readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pipe} from 'effect';
import {filter, map} from 'effect/Array';

export default {

    entryPoints: pipe(
        await readdir('src', {withFileTypes: true, recursive: true}),
        filter((l) => l.name === 'index.ts'),
        map((l) => resolve(l.parentPath, l.name)),
    ),

    outdir        : 'dist',
    logLevel      : 'info',
    allowOverwrite: true,

    platform: 'node',
    target  : 'node20',

    format      : 'esm',
    outExtension: {'.js': '.mjs'},
    mainFields  : ['module', 'main'],

    bundle           : true,
    external         : ['@aws-sdk/*'],
    treeShaking      : true,
    minifySyntax     : true,
    minifyIdentifiers: true,
    minifyWhitespace : true,

    banner: {
        js: 'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);',
    },

    sourcemap     : 'linked',
    sourcesContent: false,

} satisfies BuildOptions;
