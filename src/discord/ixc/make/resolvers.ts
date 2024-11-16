import type {IxD} from '#src/discord/util/discord.ts';
import type {IxDc} from '#src/discord/util/discord.ts';
import type {num} from '#src/internal/pure/types-pure.ts';
import type {SelectMenu, ActionRow} from 'dfx/types';


export const resolveSelectData = <T extends SelectMenu>(idx: num, ix: IxD, d: IxDc) => {
    const component = (ix.message!.components[idx] as ActionRow).components[0] as T;

    if (!d.resolved) {
        const dataValues = (d.values ?? []) as unknown as string[];

        return {
            values  : dataValues,
            selector: {
                ...component,
                options: component.options?.map((o) => ({
                    ...o,
                    default: dataValues.includes(o.value),
                })) ?? [],
            } as T,
        };
    }

    const dataValues = (d.values ?? []) as unknown as `${bigint}`[];
    const resolved = d.resolved;

    return {
        values  : dataValues as string[],
        selector: {
            ...component,
            default_values: dataValues.map((dV) => ({
                value: dV,
                type : resolved.members?.[dV] ? 'user'
                : resolved.roles?.[dV] ? 'role'
                : 'channel',
            })),
        } as T,
    };
};
