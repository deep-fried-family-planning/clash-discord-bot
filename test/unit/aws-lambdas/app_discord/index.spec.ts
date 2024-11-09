import {CSL, E, L} from '#src/internals/re-exports/effect.ts';
import {Logger, pipe} from 'effect';
import {mapL} from '#src/pure/pure-list.ts';

describe('test', () => {
    it('does the thing', () => {
        // const curry = (type: string) => {
        //     console.log(type, 'logger is ready');
        //     return (message: string) => {console.log(`[${type}]`, `[${message}]`)};
        // };
        // const errorLog = curry('err');
        // errorLog();

        const log1 = CSL.log('log1');

        //
        const log2 = CSL.log('log2');
        const log3 = CSL.log('log3');
        const log4 = CSL.log('log4');
        const log5 = CSL.log('log5');
        const log6 = CSL.log('log6');

        // E.runSync(log1.pipe(
        //     E.tap(log5),
        //     E.tap(log4),
        //     E.tap(log3),
        //     E.tap(log2),
        //     E.tap(log1),
        // ));
        //
        // E.runSync(pipe(
        //     [log1, log3, log2, log4, log5],
        //     E.allWith({concurrency: 5}),
        // ));
        const logs = [log1, E.fail(new Error('hello fail')), log2, E.fail(new Error('hello fail')), log3, E.fail(new Error('hello fail')), log4, E.fail(new Error('hello fail')), log5];

        const out = E.runSyncExit(E.gen(function * () {
            const t = pipe(
                logs,
                mapL((log) => {
                    return log.pipe(
                        E.catchAll((e) => {
                            return E.asVoid(E.succeed(e));
                        }),
                    );
                }),
            );
            yield * E.all(t, {concurrency: 'unbounded'});
            return;
        }));
        console.log(out);
    });
});
