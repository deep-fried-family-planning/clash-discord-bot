export const CxKey = {
    origin   : ':origin',
    slice    : ':slice',
    action   : ':scope',
    ctype    : ':ctype',
    cmode    : ':cmode',
    row      : ':row',
    col      : ':col',
    view     : ':view',
    modifiers: ':modifiers*',
} as const;


export const CxRoutes = [
    `/v2/:origin/:slice/:action/:ctype/:cmode/:row/:col/:view/:modifiers`,
];


//
// fundamental: Cx/ctype := slice data shape
//
//
// => rx
//
// 1. prevState:  Cx/slice/action => Sc/alias/data
//                Cx/ctype := Sc/alias/data/shape
//                (message component -> state shape) (based on protocol fields/cmap
//
//
//                )
//
// 2. nextState:
//      reduce:   Ax/slice/action => Sc/alias => Sc (entire slice data)
//                Vx Sc : Sc/alias of /slice/INIT is reserved
//
// => tx
// 3. diffs: Vx Cx => S
//           Vx Cx in Sc => S
//
// 4. render: S => mount new Cx/slice/actions ("onClick") => Tx
//       check /view/nextview
//       check /ctype/cmode (state shape => message component)
//
// 5. send: Tx => M


// makeSlice
//   find /slice/action
//


// base component initializer
//   find predicate: /slice/action (component's "onClick")
//   run predicate:  /cmode/cnextMode != /cnextMode/cmode
