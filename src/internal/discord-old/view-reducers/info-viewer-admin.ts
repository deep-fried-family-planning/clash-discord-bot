import {DELIM_DATA} from '#src/internal/discord-old/constants/delim.ts';
import {SELECT_INFO_KIND, SELECT_POSITIONS} from '#src/internal/discord-old/constants/ix-constants.ts';
import {LABEL_TITLE_EDIT_INFO} from '#src/internal/discord-old/constants/label.ts';
import {PLACEHOLDER_INFO_KIND, PLACEHOLDER_POSITION} from '#src/internal/discord-old/constants/placeholder.ts';
import {REF_EMBED_ID, REF_INFO_ID, REF_INFO_KIND, REF_INFO_POSITION} from '#src/internal/discord-old/constants/reference.ts';
import {RK_DELETE, RK_DELETE_CONFIRM, RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/internal/discord-old/constants/route-kind.ts';
import {MenuCache} from '#src/internal/discord-old/dynamo/cache/menu-cache.ts';
import {discordEmbedCreate, discordEmbedDelete, discordEmbedRead} from '#src/internal/discord-old/dynamo/operations/embed.ts';
import {infoCreate, infoDelete, infoRead} from '#src/internal/discord-old/dynamo/operations/info.ts';
import type {DInfo} from '#src/internal/discord-old/dynamo/schema/discord-info.ts';
import {asConfirm, asEditor, asSuccess, unset} from '#src/internal/discord-old/components/component-utils.ts';
import {AdminB, BackB, DeleteB, DeleteConfirmB, SingleS, SubmitB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {dtNow, dtNowIso} from '#src/internal/discord-old/util/markdown.ts';
import {EmbedEditorB} from '#src/internal/discord-old/view-reducers/editors/embed-editor.ts';
import {InfoNavS, InfoViewerB, KindNavS} from '#src/internal/discord-old/view-reducers/info-viewer.ts';
import {E} from '#src/internal/pure/effect.ts';

export const InfoViewerAdminB = AdminB.as(makeId(RK_OPEN, 'IVA'));
const Submit = SubmitB.as(makeId(RK_SUBMIT, 'IVA'));
const Delete = DeleteB.as(makeId(RK_DELETE, 'IVA'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RK_DELETE_CONFIRM, 'IVA'));
const KindS = SingleS.as(makeId(RK_UPDATE, 'IVAK'), {
  placeholder: PLACEHOLDER_INFO_KIND,
  options    : SELECT_INFO_KIND,
});
const PositionS = SingleS.as(makeId(RK_UPDATE, 'IVAP'), {
  placeholder: PLACEHOLDER_POSITION,
  options    : SELECT_POSITIONS,
});

const view = (s: St, ax: Ax) => E.gen(function* () {
  let infoKind = '';
  let infoId = '';
  let embedId = '';
  let position = '';

  let Position = PositionS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, ax.selected.map((s) => s.value));
  let Kind = KindS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, ax.selected.map((s) => s.value));

  if (InfoViewerAdminB.clicked(ax)) {
    infoKind = KindNavS.fromMap(s.cmap).values[0];

    const [info, embed] = InfoNavS.fromMap(s.cmap).values[0].split(DELIM_DATA);

    infoId = info;
    embedId = embed;
  }
  else {
    infoKind = s.reference[REF_INFO_KIND];
    infoId = s.reference[REF_INFO_ID];
    embedId = s.reference[REF_EMBED_ID];
    position = s.reference[REF_INFO_POSITION];
  }

  if (ax.id.predicate === InfoViewerAdminB.id.predicate || ax.id.nextPredicate === InfoViewerAdminB.id.predicate) {
    const info = yield* infoRead({pk: s.server_id, sk: infoId});

    Position = Position.setDefaultValuesIf(Position.id.predicate, [`${info.selector_order ?? '25'}`]);
    Kind = Kind.setDefaultValuesIf(Kind.id.predicate, [infoKind]);
    position = Position.values[0];
  }

  if (ax.id.predicate === Position.id.predicate) {
    position = Position.values[0];
  }

  if (ax.id.predicate === Kind.id.predicate) {
    infoKind = Kind.values[0];
  }

  if (DeleteConfirm.clicked(ax)) {
    yield* infoDelete({pk: s.server_id, sk: infoId});
    yield* discordEmbedDelete(embedId);
    yield* MenuCache.embedInvalidate(embedId);
  }

  if (Submit.clicked(ax)) {
    const info = yield* infoRead({pk: s.server_id, sk: infoId});
    const embed = yield* discordEmbedRead(embedId);

    yield* infoCreate({
      ...info,
      updated       : dtNow(),
      kind          : infoKind as DInfo['kind'],
      selector_order: parseInt(position),
      selector_label: embed.embed.title,
    });
    yield* discordEmbedCreate({
      ...embed,
      updated: dtNow(),
      embed  : s.editor!,
    });
    yield* MenuCache.embedInvalidate(embedId);
  }

  return {
    ...s,
    title      : LABEL_TITLE_EDIT_INFO,
    description: unset,
    reference  : {
      [REF_INFO_KIND]    : infoKind,
      [REF_INFO_ID]      : infoId,
      [REF_EMBED_ID]     : embedId,
      [REF_INFO_POSITION]: position,
    },

    editor: asEditor({
      ...s.viewer,
      ...s.editor,
      timestamp: dtNowIso(),
    }),
    viewer: unset,
    status:
      Submit.clicked(ax) ? asSuccess({description: 'Info Embed Edited. Changes may take up to 10 minutes to appear.'})
        : Delete.clicked(ax) ? asConfirm({description: 'Are you sure you want to delete this embed?'})
          : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Info Embed Deleted. Changes may take up to 10 minutes to appear.'})
            : unset,

    sel1: Kind.render({
      disabled:
        Delete.clicked(ax)
        || DeleteConfirm.clicked(ax)
        || Submit.clicked(ax),
    }),
    sel2: Position.render({
      disabled:
        Delete.clicked(ax)
        || DeleteConfirm.clicked(ax)
        || Submit.clicked(ax),
    }),

    row3: [
      EmbedEditorB.fwd(InfoViewerAdminB.id).render({
        disabled:
          Delete.clicked(ax)
          || DeleteConfirm.clicked(ax)
          || Submit.clicked(ax),
      }),
    ],

    submit: Submit.render({
      disabled:
        Submit.clicked(ax)
        || Delete.clicked(ax)
        || DeleteConfirm.clicked(ax)
        || !Kind.values.length
        || !Position.values.length,
    }),
    delete:
      (
        Delete.clicked(ax) ? DeleteConfirm
          : Delete
      ).render({
        disabled:
          Submit.clicked(ax)
          || DeleteConfirm.clicked(ax),
      }),
    back: BackB.as(InfoViewerB.id),
  } satisfies St;
});

export const infoViewerAdminReducer = {
  [InfoViewerAdminB.id.predicate]: view,
  [Submit.id.predicate]          : view,
  [Delete.id.predicate]          : view,
  [DeleteConfirm.id.predicate]   : view,
  [KindS.id.predicate]           : view,
  [PositionS.id.predicate]       : view,
};
