import {defineConfig} from '@rspack/cli';
import {resolve} from 'node:path';
// import TerserPlugin from 'terser-webpack-plugin';
// import {rspack} from '@rspack/core';

// const RsDoctor = new RsdoctorRspackPlugin({
//     mode    : 'normal',
//     supports: {
//         parseBundle: true,
//         // generateTileGraph: true,
//     },
//     features: {
//         resolver   : true,
//         loader     : true,
//         plugins    : true,
//         bundle     : true,
//         treeShaking: true,
//     },
// });


const targets = ['node >= 22.11'];


export default defineConfig({
    mode  : 'production',
    target: ['node22.11', 'es2022'],

    experiments: {
        outputModule : true,
        topLevelAwait: true,
    },

    entry: {
        'dev_ws/index': {import: 'dev/dev_ws.ts'},

        'ddb_stream/index'   : {import: 'src/ddb_stream.ts'},
        'ix_api/index'       : {import: 'src/ix_api.ts'},
        'ix_menu/index'      : {import: 'src/ix_menu.ts'},
        'ix_menu_close/index': {import: 'src/ix_menu_close.ts'},
        'ix_slash/index'     : {import: 'src/ix_slash.ts'},
        'poll/index'         : {import: 'src/poll.ts'},
        'task/index'         : {import: 'src/task.ts'},
    },

    output: {
        module                       : true,
        environment                  : {module: true},
        library                      : {type: 'module'},
        hashSalt                     : '',
        strictModuleErrorHandling    : true,
        strictModuleExceptionHandling: true,
        compareBeforeEmit            : true,
    },

    externalsType   : 'module',
    externalsPresets: {node: true},
    externals       : [
        /@aws-sdk./,
        /@discordjs./,
    ],

    resolve: {
        tsConfig: {
            configFile: resolve(import.meta.dirname, 'tsconfig.json'),
            references: 'auto',
        },
        extensions: ['...', '.ts'],
    },

    plugins: [
        // RsDoctor,
    ].filter(Boolean),

    optimization: {
        // minimizer: [new TerserPlugin()],
        splitChunks: false,
    },

    devtool: 'source-map',

    performance: {hints: 'warning'},
    stats      : {
        preset      : 'errors-only',
        entrypoints : true,
        performance : true,
        children    : true,
        timings     : true,
        builtAt     : true,
        loggingTrace: true,
        runtime     : true,
    },

    module: {
        rules: [{
            test   : /\.js$/,
            exclude: /node_modules/,
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
        }, {

            test   : /\.tsx?$/,
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
});
