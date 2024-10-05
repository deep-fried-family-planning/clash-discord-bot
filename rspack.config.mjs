// @ts-check

import {defineConfig} from '@rspack/cli';
import {rspack} from '@rspack/core';
import {readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pipe} from 'effect';
import {reduce, map, filter} from 'effect/Array';
// import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';

const targets = ['node >= 20.12'];

export default defineConfig({
    mode  : 'production',
    target: 'node20.12',

    context: import.meta.dirname,
    entry  : pipe(
        await readdir('src/aws-lambdas', {withFileTypes: true, recursive: true}),
        filter((l) => l.name === 'index.ts'),
        map((l) => resolve(l.parentPath, l.name).replace(import.meta.dirname, '')),
        reduce({}, (ls, l) => (ls[l.replace('/src/aws-lambdas/', '').replace('.ts', '')] = l) && ls),
    ),

    externalsType: 'module',
    externals    : [
        /@aws-sdk./,
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
            test   : /\.js$/,
            exclude: /node_modules\/\.pnpm/,
            use    : [{
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
            test   : /\.ts$/,
            exclude: /node_modules\/\.pnpm/,
            use    : [{
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
        new rspack.node.NodeTargetPlugin(),
    ],

    output: {
        module     : true,
        environment: {
            module: true,
        },
        library: {
            type: 'module',
        },
        clean: true,
    },

    experiments: {
        outputModule : true,
        topLevelAwait: true,
    },

    performance: {
        hints: 'warning',
    },

    stats: {
        preset     : 'normal',
        entrypoints: true,
        performance: true,
        children   : true,
        timings    : true,
    },

    devtool: 'nosources-cheap-module-source-map',
});
