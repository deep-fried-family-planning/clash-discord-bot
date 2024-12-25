import type {CxVR} from '#dfdis';
import {Ar, p} from '#src/internal/pure/effect';


export const enum Id {
    Data,
    Action,
    Component,
    Paged,
    PageControl,
}


const id_existence_filters = [
    [Id.Data, ['name', 'data']],
    [Id.Action, ['name', 'action']],
    [Id.Component, ['type', 'mode']],
    [Id.Paged, ['p_group', 'p_num', 'p_now']],
    [Id.PageControl, ['type', 'mode', 'p_group', 'p_num', 'p_now', 'mod']],
] as const;


export const assignFlags = (id: CxVR.T) => p(
    id_existence_filters,
    Ar.reduce([] as Id[], (acc, [flag, predicates]) => {
        if (predicates.every((key) => key in id)) {
            acc.push(flag);
        }
        return acc;
    }),
    (flags) => {
        return flags;
    },
);
