import {defineConfig} from '@rspack/cli';
import TerserPlugin from 'terser-webpack-plugin';
// import {rspack} from '@rspack/core';
import {resolve} from 'node:path';
import {execSync} from 'node:child_process';
import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';
import {toEntries} from 'effect/Record';
import {pipe} from 'effect';
import {map as mapL} from 'effect/Array';
import {readFile} from 'node:fs/promises';

const RsDoctor = new RsdoctorRspackPlugin({
    mode    : 'normal',
    supports: {
        parseBundle: true,
        // generateTileGraph: true,
    },
    features: {
        resolver   : true,
        loader     : true,
        plugins    : true,
        bundle     : true,
        treeShaking: true,
    },
});


const targets = ['node >= 22.11'];

console.debug('BUILD_ENV', process.env.BUILD_ENV);


const entries = {
    'ddb_stream/index'   : {import: 'src/ddb_stream.ts'},
    'ix_api/index'       : {import: 'src/ix_api.ts'},
    'ix_menu/index'      : {import: 'src/ix_menu.ts'},
    'ix_menu_close/index': {import: 'src/ix_menu_close.ts'},
    'ix_slash/index'     : {import: 'src/ix_slash.ts'},
    'poll/index'         : {import: 'src/poll.ts'},
    'task/index'         : {import: 'src/task.ts'},
};


if (process.env.BUILD_ENV !== 'prod') {
    try {
        execSync(`mkdir dist`);
    }
    catch (e) {

    }
    await Promise.all(
        pipe(
            entries,
            toEntries,
            mapL(([outName]) => outName.replace('/index', '')),
        ).map(async (outName) => {
            try {
                await readFile(`dist/${outName}/index.mjs.map`);
            }
            catch (e) {
                try {
                    execSync(`mkdir dist/${outName}`);
                }
                catch (e) {
                    try {
                        execSync(`touch dist/${outName}/index.mjs.map`);
                    }
                    catch (e) {

                    }
                }
            }
        }),
    );
}

export default defineConfig({
    mode  : 'production',
    target: ['node22.11', 'es2022'],

    experiments: {
        outputModule : true,
        topLevelAwait: true,
    },

    entry: entries,

    output: {
        module                       : true,
        environment                  : {module: true},
        library                      : {type: 'module'},
        strictModuleErrorHandling    : true,
        strictModuleExceptionHandling: true,
        // clean                        : true,
        compareBeforeEmit            : true,
    },

    externalsType   : 'module',
    externalsPresets: {node: true},
    externals       : [
        /@aws-sdk./,
        /@discordjs./,
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
        // RsDoctor,
    ].filter(Boolean),

    optimization: {
        // minimizer: [new TerserPlugin()],
    },

    devtool: process.env.BUILD_ENV === 'prod' ? 'source-map' : false,

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
});
