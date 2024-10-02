import {flatMapL, reduceL} from '#src/pure/pure-list.ts';
import {show} from '#src/utils/show.ts';
import type {ModalSubmitComponent} from 'discord-api-types/v10';
import type {DModal, IModal} from '#src/discord/helpers/re-export-types.ts';
import {pipe} from '#src/utils/effect';

export const namedComponentOptions = <T extends DModal>(m: IModal<T>) => {
    const thing = pipe(m.data.components, flatMapL((c) => c.components), reduceL({} as {[k in string]: ModalSubmitComponent}, (cs, c) => {
        cs[c.custom_id] = c;
        return cs;
    }));

    show(thing);

    return thing;
};
