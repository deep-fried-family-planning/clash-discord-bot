import {defineConfig} from '@rspack/cli';
import TerserPlugin from 'terser-webpack-plugin';
// import {rspack} from '@rspack/core';
import {resolve} from 'node:path';
// import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';

const targets = ['node >= 20.12'];

export default defineConfig({
    mode  : 'production',
    target: 'node20.12',
    //
    // hashFunction: 'md5',
    // hashDigestLength: 20,

    experiments: {
        // layers          : true,
        outputModule  : true,
        // topLevelAwait : true,
        futureDefaults: false,
    },

    entry: {
        'ix_api/index'       : 'src/ix_api.ts',
        'ix_menu/index'      : 'src/ix_menu.ts',
        'ix_slash/index'     : 'src/ix_slash.ts',
        'ix_menu_close/index': 'src/ix_menu_close.ts',
        'poll/index'         : 'src/poll.ts',
        'task/index'         : 'src/task.ts',

        'api_discord/index'   : 'src/ix_api.ts',
        'discord_menu/index'  : 'src/ix_menu.ts',
        'discord_slash/index' : 'src/ix_slash.ts',
        'scheduler/index'     : 'src/poll.ts',
        'scheduled_task/index': 'src/task.ts',
    },

    output: {
        module                       : true,
        environment                  : {module: true},
        library                      : {type: 'module'},
        strictModuleErrorHandling    : true,
        strictModuleExceptionHandling: true,
        compareBeforeEmit            : true,
        asyncChunks                  : false,
        clean                        : true,
        chunkLoading                 : 'import',
    },

    externalsType   : 'module',
    externalsPresets: {
        node: true,
    },
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


    module: {
        parser: {
            'javascript/auto': {
                requireDynamic     : false,
                importDynamic      : true,
                exprContextCritical: true,
                overrideStrict     : 'strict',
            },
        },

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
        }],
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

    optimization: {
        minimizer      : [new TerserPlugin()],
        splitChunks    : false,
        realContentHash: false,
    },

    cache  : true,
    devtool: 'nosources-cheap-module-source-map',

    performance: {hints: 'warning'},
    stats      : {
        preset      : 'errors-warnings',
        entrypoints : true,
        performance : true,
        children    : true,
        timings     : true,
        hash        : true,
        builtAt     : true,
        cached      : true,
        loggingTrace: true,
        runtime     : true,
    },
});
