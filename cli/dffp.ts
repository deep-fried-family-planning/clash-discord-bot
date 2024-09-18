#!/usr/bin/env tsx

import yargs from 'yargs';
import {build} from './cmds/build';

const dffp = yargs(process.argv.slice(2));

await dffp
    .usage('Usage: $0 [options]')
    .command(build)
    .help()
    .argv;
