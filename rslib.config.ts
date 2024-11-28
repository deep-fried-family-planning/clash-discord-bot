import {defineConfig} from '@rslib/core';


export default defineConfig({
    lib: [
        {
            format      : 'esm',
            syntax      : 'esnext',
            bundle      : true,
            autoExternal: {
                dependencies: false,
            },
            source: {
                entry: {
                    'api_discord/index': 'src/ix_api.ts',
                },
            },
        },
        {
            format      : 'esm',
            syntax      : 'esnext',
            bundle      : true,
            autoExternal: {
                dependencies: false,
            },
            source: {
                entry: {
                    'ddb_stream/index': 'src/ddb_stream.ts',
                },
            },
        },
    ],
});
