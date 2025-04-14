import {Default} from '#src/disreact/codec/rest-elem/component/default.ts';
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {declareHandlerElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {DAPI} from '../../dapi/dapi';

export * as Users from '#src/disreact/codec/rest-elem/component/users.ts';
export type Users = never;

export const TAG  = 'users',
             NORM = Keys.components;

export const EventData = S.Struct({
  data: DAPI.Component.UserSelectData,
});

export const Handler = Trigger.declareHandler(EventData);

export const Children = S.Union(
  Default.Element,
);

export const Attributes = declareProps(
  S.Struct({
    custom_id      : S.optional(S.String),
    placeholder    : S.optional(S.String),
    min_values     : S.optional(S.Number),
    max_values     : S.optional(S.Number),
    disabled       : S.optional(S.Boolean),
    [Keys.onselect]: Handler,
  }),
);

export const Element = declareHandlerElem(
  TAG,
  Attributes,
  Handler,
);

export const encode = (self: Elem, acc: any) => {
  return {
    type      : DAPI.Component.ACTION_ROW,
    components: [{
      type          : DAPI.Component.USER_SELECT,
      custom_id     : self.props.custom_id ?? self.ids,
      placeholder   : self.props.label ?? acc[Keys.primitive]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.props.default_values ?? acc[Keys.default_values],
      disabled      : self.props.disabled,
    }],
  };
};
