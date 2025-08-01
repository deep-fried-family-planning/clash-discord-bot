import * as S from 'effect/Schema';
import * as Data from 'effect/Data';
import * as Spec from '#disreact/codec/JsxSpec.ts';

const RehydrantId = S.TemplateLiteralParser(
  ...Spec.ControlledId.params,
  '/', S.String,
);

export const isRehydrantCustomId = S.is(RehydrantId);

const parseRehydrantCustomIdFragment = (id: string) => {
  const [,fragment] = id.split('/');
  return fragment as string;
};

export const impureMergeHydratorString = (hydrator: string, components: any[]) => {
  const totalRequired = hydrator.length;
  let totalAvailable = 0;

  if (totalRequired > 4000) {
    return false;
  }

  const controlled = [] as any[];

  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    const id = component.custom_id;

    if (
      id !== undefined &&
      'custom_id' in component &&
        Spec.isControlledId(component.custom_id)
    ) {
      const available = 99 - component.custom_id.length;
      controlled.push([component, `/${hydrator.substring(totalAvailable, totalAvailable + available)}`]);
      totalAvailable += available;
    }
  }

  if (totalAvailable < totalRequired) {
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
