import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {MadeSelect} from '#src/discord/ixc/components/make-select.ts';
import type {MadeButton} from '#src/discord/ixc/components/make-button.ts';


export const SingleSelectForward = (
    selector: MadeSelect,
    submit: MadeButton,
    back: MadeButton,
) => {
    return typeRx((s, ax) => E.gen(function * () {
        return {
            ...s,
            row1: [],
        };
    }));
};
