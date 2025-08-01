import * as S from 'effect/Schema';
import * as Data from 'effect/Data';
import * as Spec from '#disreact/engine/internal/JsxSpec.ts';

const RehydrantId = S.TemplateLiteralParser(
  ...Spec.ControlledId.params,
  '/', S.String,
);

export const isRehydrantCustomId = S.is(RehydrantId);

const parseRehydrantCustomIdFragment = (id: string) => {
  const [,fragment] = id.split('/');
  return fragment as string;
};

export const appendRehydrantCustomIdFragment = (id: string, fragment: string) => {
  return `${id}/${fragment}`;
};

export const impureMergeHydratorString = (hydrator: string, components: any[]) => {
  const required = hydrator.length;

  if (required > 4000) {
    return false;
  }

  const controlled = [] as any[];
  let available = 0;

  for (let i = 0; i < components.length; i++) {
    const c = components[i];
    const id = c.custom_id;

    if (
      id !== undefined &&
      'custom_id' in c &&
        Spec.isControlledId(c.custom_id)
    ) {
      const space = 99 - c.custom_id.length;
      controlled.push([c, `/${hydrator.substring(available, available + space)}`]);
      available += space;
    }
  }

  if (available < required) {
    return false;
  }

  const index = 0;

  for (let i = 0; i < controlled.length; i++) {
    const [component, fragment] = controlled[i];



    const id = component.custom_id;
    const hydrant = id.substring(id.indexOf('/') + 1);
    const index = components.indexOf(component);
  }
};

export const isMessageRehydratable = (message: any) => {
  return true;
};
