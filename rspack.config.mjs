// @ts-check

import {defineConfig} from '@rspack/cli';
import TerserPlugin from 'terser-webpack-plugin';
// import {rspack} from '@rspack/core';
import {readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pipe} from 'effect';
import {reduce, map, filter} from 'effect/Array';

// import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';

const targets = ['node >= 20.12'];

export default defineConfig({
    mode  : 'production',
    target: 'node20.12',

    experiments: {
        layers          : true,
        outputModule    : true,
        topLevelAwait   : true,
        futureDefaults  : true,
        lazyCompilation : false,
        css             : false,
        asyncWebAssembly: false,
        rspackFuture    : {
            bundlerInfo: {
                force: false,
            },
        },
    },

    entry: pipe(
        await readdir('src/lambda', {withFileTypes: true, recursive: true}),
        filter((l) => l.name === 'index.ts'),
        map((l) => resolve(l.parentPath, l.name).replace(import.meta.dirname, '').replaceAll('\\', '/')),
        reduce({}, (ls, l) => (ls[l.replace('/src/lambda/', '').replace('.ts', '')] = l) && ls),
    ),

    output: {
        module                       : true,
        scriptType                   : 'module',
        environment                  : {module: true},
        library                      : {type: 'module'},
        strictModuleErrorHandling    : true,
        strictModuleExceptionHandling: true,
        compareBeforeEmit            : true,
    },

    // externalsType: 'module',
    externals: [
        /@aws-sdk./,
        // 'undici',
    ],

    resolve: {
        tsConfig: {
            configFile: resolve(import.meta.dirname, 'tsconfig.json'),
            references: 'auto',
        },
        extensions: ['...', '.ts'],
    },

    node: {
        global: false,
    },

    externalsPresets: {
        node: true,
    },

    module: {
        rules: [{
            test: /\.js$/,
            // exclude: /node_modules/,
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
            test   : /\.ts$/,
            exclude: /node_modules/,
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
        minimizer: [new TerserPlugin()],
    },

    plugins: [
        // new RsdoctorRspackPlugin({
        //     mode    : 'normal',
        //     supports: {
        //         parseBundle      : true,
        //         generateTileGraph: true,
        //     },
        //     reportCodeType: {
        //         writeDataJson: true,
        //     },
        //     features: {
        //         resolver   : true,
        //         loader     : true,
        //         plugins    : true,
        //         bundle     : true,
        //         treeShaking: true,
        //     },
        // }),
        // new BundleAnalyzerPlugin.BundleAnalyzerPlugin({sourceType: 'module'}),
    ],

    devtool: 'nosources-cheap-source-map',

    performance: {hints: 'warning'},

    stats: {
        preset     : 'errors-only',
        entrypoints: true,
        performance: true,
        children   : true,
        timings    : true,
    },
});
