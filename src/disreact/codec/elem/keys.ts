export * as Keys from '#src/disreact/codec/elem/keys.ts';
export type Keys = never;

export const props          = 'props',
             children       = 'children',
             nodes          = 'nodes',
             type           = 'type',
             id             = 'id',
             ids            = 'ids',
             idx            = 'idx',
             components     = 'components',
             emoji          = 'emoji',
             primitive      = 'primitive',
             fields         = 'fields',
             embeds         = 'embeds',
             options        = 'options',
             default_values = 'default_values',
             handler        = 'handler',
             onclick        = 'onclick',
             onselect       = 'onselect',
             onsubmit       = 'onsubmit',
             buttons        = 'button',
             image          = 'image',
             message        = 'message';

export const ephemeral = 'ephemeral',
             entry     = 'entry',
             modal     = 'modal';

export const reserved = {
  onclick,
  onselect,
  onsubmit,
};
