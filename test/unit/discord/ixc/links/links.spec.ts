// {k, v} *record* of arbitrary length n
// create a double linked list between keys ordered arbitrarily as ns
//
// also all that discord state stuff lol

// ----------- n^2 -----------------
//  |       |      |      |
//  c0 <=> c1 <=> c2 <=> c3
//  |       |      |      |
// ------------ n^2 -----------------------


// discord stuff
//
//     -> DAPI
//   DFFP             DAPI             -> DAPI
//   e1        u      e1             DFFP            DAPI               -> DAPI        DAPI
//   cs1      -->     cs1    post    e1       u      e1      post     DFFP         u   e3
//                    d1     -->     cs1.1     -->   cs2     -->      e3          -->  cs3
//                                                   d2               c3               d3
//


import {it} from '@effect/vitest';
import {CSL, E} from '#src/internal/pure/effect.ts';


describe('links', () => {
    const start = 'start';
    const end = 'end';

    const configurable = [
        'k1',
        'k2',
        'k3',
        'k4',
        'k5',
        'k6',
    ].map((k) => ({
        k,
        v: k,
    }));

    it.effect(' ', () => E.gen(function * () {
        // const Start = makeMenu(start, UI.button, {label: 'Start'}, () => E.succeed({
        //     content   : 'StartContent',
        //     components: UI.singleColumn([UI.button({custom_id: ''})]),
        // }));
        //
        // const Selectables = configurable.map(() => makeSelectSubmit());


        yield * CSL.log(['2025-11-13', '2024-11-12', '2025-11-12'].sort((a, b) => a.localeCompare(b)));
    }));
});
