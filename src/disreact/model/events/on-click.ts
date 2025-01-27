import type {Rest} from '#src/disreact/api/index.ts';
import type {DisReactNode} from '#src/disreact/model/tree/node.ts';
import type {Discord} from 'dfx/index';



type Row = Discord.ActionRow;
type NotRow = Exclude<Discord.Component, Discord.ActionRow>;


export const findOnClickTargets = (
  ix: Rest.Interaction,
  clone: DisReactNode,
) => {
  const restTarget = findRestTarget(ix.data.custom_id, ix.message!.components as Row[]);

  const attemptedByCustomId = findNodeByProp(clone, 'custom_id', ix.data.custom_id);

  return {
    rest : restTarget,
    clone: attemptedByCustomId,
  };
};


export const findRestTarget = (
  custom_id: string,
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
        rdx    = i;
        cdx    = j;
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
