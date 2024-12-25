import {SELECT_INFO_KIND, SELECT_POSITIONS} from '#src/constants/ix-constants.ts';
import {LABEL_TITLE_NEW_INFO} from '#src/constants/label.ts';
import {PLACEHOLDER_INFO_KIND, PLACEHOLDER_POSITION} from '#src/constants/placeholder.ts';
import {RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/constants/route-kind.ts';
import {asEditor, unset} from '#src/discord/components/component-utils.ts';
import {BackB, NewB, SingleS, SubmitB} from '#src/discord/components/global-components.ts';
import {decodePersist, encodePersist, extractPersist} from '#src/discord/components/persistor.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {dtNow, dtNowIso} from '#src/discord/util/markdown.ts';
import {EmbedEditorB} from '#src/discord/view-reducers/editors/embed-editor.ts';
import {InfoViewerB} from '#src/discord/view-reducers/info-viewer.ts';
import {discordEmbedCreate} from '#src/dynamo/operations/embed.ts';
import {infoCreate} from '#src/dynamo/operations/info.ts';
import type {DInfo} from '#src/dynamo/schema/discord-info.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import type {Embed} from 'dfx/types';
import {v4} from 'uuid';


const createInfoEmbed = (s: St, kind: str, order: num, embed?: Embed) => E.gen(function * () {
    const embedId = v4();
    const infoId = v4();

    yield * discordEmbedCreate({
        type        : 'DiscordEmbed',
        pk          : embedId,
        sk          : 'now',
        gsi_embed_id: embedId,

        version: '1.0.0',
        created: dtNow(),
        updated: dtNow(),

        original_type     : 'DiscordInfo',
        original_pk       : s.server_id,
        original_sk       : infoId,
        original_server_id: s.server_id,
        original_user_id  : s.user_id,

        embed: embed!,
    });

    yield * infoCreate({
        type          : 'DiscordInfo',
        pk            : s.server_id,
        sk            : infoId,
        version       : '1.0.0',
        created       : dtNow(),
        updated       : dtNow(),
        kind          : kind as DInfo['kind'],
        embed_id      : embedId,
        selector_label: embed!.title!,
        selector_order: order,
    });
});


export const InfoViewerCreatorB = NewB.as(makeId(RK_OPEN, 'IVC'));
const Submit = SubmitB.as(makeId(RK_SUBMIT, 'IVC'));
const KindS = SingleS.as(makeId(RK_UPDATE, 'IVCK'), {
    placeholder: PLACEHOLDER_INFO_KIND,
    options    : SELECT_INFO_KIND,
});
const PositionS = SingleS.as(makeId(RK_UPDATE, 'ICVP'), {
    placeholder: PLACEHOLDER_POSITION,
    options    : SELECT_POSITIONS,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const persisted = decodePersist(s.description);

    const Kind = KindS.fromMap(s.cmap).setDefaultValuesIf(KindS.id.predicate, extractPersist(persisted, ax, KindS));
    const Position = PositionS.fromMap(s.cmap).setDefaultValuesIf(PositionS.id.predicate, extractPersist(persisted, ax, PositionS));

    if (Submit.clicked(ax)) {
        yield * createInfoEmbed(s, Kind.values[0], parseInt(Position.values[0]), s.editor);
    }

    return {
        ...s,
        title      : LABEL_TITLE_NEW_INFO,
        description: encodePersist(
            Kind,
            Position,
        ),

        editor: asEditor({
            ...s.editor
            ?? {
                title      : 'New Info Embed',
                description: 'New Info Description',
            },
            footer: {
                text: 'last updated',
            },
            timestamp: dtNowIso(),
        }),
        viewer: unset,
        status: unset,

        sel1: Kind.render({
            disabled:
                Submit.clicked(ax),
        }),
        sel2: Position.render({
            disabled:
                Submit.clicked(ax),
        }),
        row3: [
            EmbedEditorB.fwd(InfoViewerCreatorB.id).render({
                disabled:
                    Submit.clicked(ax),
            }),
        ],

        submit:
            Submit.clicked(ax)
                ? Submit.as(InfoViewerCreatorB.id).render({
                    label: 'Create Another Info Page',
                })
                : Submit.render({
                    disabled:
                        !Kind.values.length
                        || !Position.values.length,
                }),

        back: BackB.as(InfoViewerB.id),
    };
});


export const infoViewerCreatorReducer = {
    [InfoViewerCreatorB.id.predicate]: view,
    [Submit.id.predicate]            : view,
    [KindS.id.predicate]             : view,
    [PositionS.id.predicate]         : view,
};
