// @ts-check

import {defineConfig} from '@rspack/cli';
import {rspack} from '@rspack/core';
import {readdir} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import pkg from './package.json' assert {type: 'json'};
import {pipe} from 'effect';
import {reduce} from 'effect/Array';

const targets = ['node >= 20.12'];

const lambdas = (await readdir('src', {withFileTypes: true, recursive: true}))
    .filter((l) => l.name === 'index.ts')
    .map((l) => resolve(l.parentPath, l.name));

export default defineConfig({
    mode  : 'production',
    target: 'node20.12',

    context: import.meta.dirname,
    entry  : pipe(lambdas, reduce({}, (ls, l) => {
        ls[l] = l;
        return ls;
    })),

    externalsType: 'module',
    externals    : [
        /@aws-sdk./,
        'zlib-sync',
        'bufferutil',
        'utf-8-validate',
    ],

    resolve: {
        tsConfig: {
            configFile: resolve(import.meta.dirname, 'tsconfig.json'),
            references: 'auto',
        },
        extensions: ['...', '.ts'],
    },

    module: {
        rules: [{
            test: /\.js$/,
            use : [{
                loader : 'builtin:swc-loader',
                options: {
                    jsc: {
                        parser: {
                            syntax: 'ecmascript',
                        },
                    },
                    env: {targets},
                },
            }],
        }, {
            test: /\.ts$/,
            use : [{
                loader : 'builtin:swc-loader',
                options: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                        },
                    },
                    env: {targets},
                },
            }],
        }],
    },

    optimization: {
        minimizer: [new rspack.SwcJsMinimizerRspackPlugin()],
    },

    plugins: [
        new rspack.ProgressPlugin({}),
        new rspack.node.NodeTargetPlugin(),
    ],

    output: {
        path       : resolve(import.meta.dirname, 'dist'),
        clean      : true,
        module     : true,
        environment: {
            module: true,
        },
        chunkFormat  : 'module',
        libraryTarget: 'module',
        library      : {
            type: 'module',
        },
    },

    experiments: {
        outputModule : true,
        topLevelAwait: true,
    },

    stats: 'summary',
});

// export default defineConfig({
//     mode: "production",
//     entry: {
//         index: "./src/index.js",
//     },
//     externalsType: "module-import",
//     output: {
//         module: true,
//         chunkFormat: "module",
//         library: {
//             type: "modern-module",
//         },
//     },
//     module: {
//         parser: {
//             javascript: {
//                 importMeta: false, // keep import.meta for runtime
//             },
//         },
//     },
//     optimization: {
//         minimize: false, // no need to minify for library
//     },
//     experiments: {
//         outputModule: true
//     },

// {
//
//     test   : /\.m?js/,
//     resolve: {
//         fullySpecified: false,
//     },
// },
