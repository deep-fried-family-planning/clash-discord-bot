import {defineConfig} from '@rsbuild/core';

export default defineConfig({
    mode: 'production',

    source: {
        entry: {
            'api_discord/index.mjs': {import: 'src/ix_api.ts'},
            'ddb_stream/index'     : {import: 'src/ddb_stream.ts'},
            'ix_api/index'         : {import: 'src/ix_api.ts'},
            'ix_menu/index'        : {import: 'src/ix_menu.ts'},
            'ix_menu_close/index'  : {import: 'src/ix_menu_close.ts'},
            'ix_slash/index'       : {import: 'src/ix_slash.ts'},
            'poll/index'           : {import: 'src/poll.ts'},
            'task/index'           : {import: 'src/task.ts'},
        },
    },

    output: {
        target              : 'node',
        overrideBrowserslist: ['node >= 22.11'],
        filenameHash        : 'contenthash',
        polyfill            : 'off',
        minify              : {
            js       : true,
            jsOptions: {
                minimizerOptions: {
                    minify  : true,
                    mangle  : true,
                    compress: true,
                    module  : true,
                },
            },
        },
        externals: [
            /@aws-sdk./,
        ],
        filename: ,
        cleanDistPath: true,

    },

    performance: {
        preload   : true,
        buildCache: true,
        chunkSplit: {
            strategy: 'all-in-one',
        },
    },

    tools: {
        rspack: {
            output: {
                module     : true,
                asyncChunks: false,
                chunkFormat: 'module',
            },
            experiments: {
                outputModule: true,
            },
        },
        swc: {
            inlineSourcesContent: false,
            jsc                 : {
                externalHelpers: true,
                parser         : {
                    tsx       : false,
                    syntax    : 'typescript',
                    decorators: true,
                },
            },
            isModule: true,
            module  : {
                type  : 'nodenext',
                strict: true,
            },
            env: undefined,
        },
    },
});
