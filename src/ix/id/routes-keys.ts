export const CxKey = {
    origin   : ':origin',
    slice    : ':slice',
    scope    : ':scope',
    type     : ':type',
    stage    : ':stage',
    row      : ':row',
    col      : ':col',
    modifiers: ':modifiers*',
} as const;


export const CxRoutes = [
    `/${CxKey.origin}/${CxKey.slice}/${CxKey.scope}/${CxKey.type}/${CxKey.stage}/${CxKey.row}/${CxKey.col}/${CxKey.modifiers}`,
];

