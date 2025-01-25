import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';
import {findNodeByProp} from '#disreact/model/tree/traversals.ts';
import type {Ix} from '#src/internal/disreact/virtual/entities/dapi.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Discord} from 'dfx/index';



type Row = Discord.ActionRow;
type NotRow = Exclude<Discord.Component, Discord.ActionRow>;


export const findOnClickTargets = (
  rest: Ix,
  clone: DisReactAbstractNode,
) => {
  const restTarget = findRestTarget(rest.data.custom_id!, rest.message!.components! as Row[]);

  const attemptedByCustomId = findNodeByProp(clone, 'custom_id', rest.data.custom_id!);

  return {
    rest : restTarget,
    clone: attemptedByCustomId,
  };
};


const findRestTarget = (
  custom_id: str,
  components: Row[],
) => {
  let target: Discord.Button | Discord.SelectMenu | undefined;
  let rdx = 0;
  let cdx = 0;

  for (let i = 0; i < components.length; i++) {
    const row = components[i];

    for (let j = 0; j < row.components.length; j++) {
      const component = row.components[j] as NotRow;

      if (component.custom_id === custom_id) {
        if ('value' in component) throw new Error('cannot call text input');

        target = component;
        rdx = i;
        cdx = j;
        break;
      }
    }
  }

  return {
    row  : rdx,
    col  : cdx,
    value: target,
  };
};
