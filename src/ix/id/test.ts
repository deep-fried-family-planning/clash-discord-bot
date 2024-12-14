import {makeSlice} from '#src/ix/store/make-slice.ts';
import {g, L, pipe} from '#src/internal/pure/effect.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashKing} from '#src/clash/clashking.ts';
import {makeLambda} from '@effect-aws/lambda';


// export const slice = makeSlice({
//     name: 'ope',
//     spec: {
//         account: {
//             scope    : 'a',
//             protocols: ['cmap'],
//         },
//         availability: {
//             scope    : 'av',
//             protocols: ['cmap'],
//         },
//     },
//     init: (s: unknown) => g(function * () {
//         return {
//             account     : '',
//             availability: '',
//         };
//     }),
//     actions: {
//         account: (st, sc) => g(function * () {
//             // yield * ClashOfClans.getClans();
//             return sc;
//         }),
//         availability: (st, sc) => g(function * () {
//             // yield * ClashKing.previousHits();
//             return sc;
//         }),
//     },
// });
//
//
// makeLambda(() => g(function * () {
//     yield * slice.actions['thing/thing']({}, {}, {});
// }), pipe(
//     ClashOfClans.Live,
//     L.provideMerge(ClashKing.Live),
// ));
