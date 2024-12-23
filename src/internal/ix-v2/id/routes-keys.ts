export const CxKey = {
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
    `/v3/:slice/:action/:ctype/:cmode/:row/:col/:view/:modifiers`,
];
