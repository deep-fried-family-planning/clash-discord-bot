import {flatMapL, reduceL} from '#src/pure/pure-list.ts';
import {show} from '#src/utils/show.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import type {DModal, IModal} from '#src/discord/helpers/re-export-types.ts';
import {pipe} from '#src/utils/effect';
import type {ModalSubmitComponent} from '@discordjs/core/http-only';

export const namedComponentOptions = <T extends DModal>(m: IModal<T>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    const thing = pipe(m.data.components, flatMapL((c) => c.components), reduceL({} as {[k in string]: ModalSubmitComponent}, (cs, c) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        cs[c.custom_id] = c;
        return cs;
    }));

    show(thing);

    return thing;
};
