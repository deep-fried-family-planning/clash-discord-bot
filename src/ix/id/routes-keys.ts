export const CxKey = {
    origin   : ':origin',
    slice    : ':slice',
    scope    : ':scope',
    type     : ':type',
    stage    : ':stage',
    row      : ':row',
    col      : ':col',
    view     : ':view',
    nextView : ':nextView',
    modifiers: ':modifiers*',
} as const;


export const CxModifiers = {
    origin     : 'o',
    currentView: 'cV',
    nextView   : 'nV',

} as const;


export const CxRoutes = [
    `/${CxKey.origin}/${CxKey.slice}/${CxKey.scope}/${CxKey.type}/${CxKey.stage}/${CxKey.row}/${CxKey.col}/${CxKey.view}/${CxKey.nextView}/${CxKey.modifiers}`,
];

