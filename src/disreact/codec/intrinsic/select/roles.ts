import {Default} from '#src/disreact/codec/intrinsic/select/default.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {declareHandler, declareHandlerElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';
import {DAPI} from 'src/disreact/codec/dapi/dapi.ts';

export * as Roles from '#src/disreact/codec/intrinsic/select/roles.ts';
export type Roles = never;

export const TAG  = 'roles',
             NORM = Keys.components;

export const EventData = S.Struct({
  data: DAPI.Component.RoleSelectData,
});

export const Handler = declareHandler(EventData);

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

export const encode = (self: any, acc: any) => {
  return {
    type      : DAPI.Component.ACTION_ROW,
    components: [{
      type          : DAPI.Component.ROLE_SELECT,
      custom_id     : self.props.custom_id ?? self.ids,
      placeholder   : self.props.placeholder ?? acc[Keys.primitive]?.[0],
      min_values    : self.props.min_values,
      max_values    : self.props.max_values,
      default_values: self.props.default_values ?? acc[Keys.default_values],
      disabled      : self.props.disabled,
    }],
  };
};
