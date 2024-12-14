import {makeDriver} from '#src/ix/store/make-driver.ts';
import {CxId} from '#src/ix/id/cx-id.ts';
import {g} from '#src/internal/pure/effect.ts';
import {v2TestSlice} from '#src/ix/drivers/v2/slices.ts';
import {v2TestView, v2TestView2} from '#src/ix/drivers/v2/views.ts';
import {Modifiers} from '#src/ix/enum/enums.ts';


export const v2_driver = makeDriver({
    name      : '/v2',
    routing   : CxId,
    predicates: {
        action: (id) => `${id.slice}/${id.action}`,
        view  : (id) => id.view,
        cmode : 'cmode',
        ctype : 'ctype',
        entry : (id) => id.modifiers === Modifiers.ENTRY,
        delete: (id) => id.modifiers === Modifiers.DELETE,
    },
    initialize: (ix) => g(function * () {
        return {

        };
    }),
    slices: [
        v2TestSlice,
    ],
    views: [
        v2TestView,
        v2TestView2,
    ],
    components: [],
});
