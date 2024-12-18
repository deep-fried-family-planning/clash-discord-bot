import {makeDriver} from '#src/internal/ix-system/store/make-driver.ts';
import {CxId} from '#src/internal/ix-system/id/cx-id.ts';
import {g} from '#src/internal/pure/effect.ts';
import {v2TestSlice} from '#src/internal/ix-system/model/v2/slices.ts';
import {v2TestView, v2TestView2} from '#src/internal/ix-system/model/v2/views.ts';
import {Modifiers} from '#src/internal/ix-system/enum/enums.ts';


export const v2_driver = makeDriver({
    name      : 'v2',
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
