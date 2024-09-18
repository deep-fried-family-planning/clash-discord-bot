import {cmd, cwd} from '../cli-helpers';
import {resolve} from 'node:path';
import {build as esbuild} from 'esbuild';

export const build = cmd({
    command : 'build',
    describe: 'bundle source code with esbuild or vite',
    builder : (y) => y
        .option('esbuildConfig', {
            alias   : 'c',
            describe: 'esbuild config file path',
            string  : true,
            default : 'esbuild.config.ts',
        })
        .help(),
    handler: async (args) => {
        const pkg = await import(resolve(cwd, 'package.json'));
        console.log(`[${pkg.name}]: todo`);

        const config = await import(resolve(cwd, args.esbuildConfig));

        await esbuild(config.default);
    },
});
