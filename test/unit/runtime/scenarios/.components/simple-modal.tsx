import {E} from '#src/disreact/utils/re-exports.ts';

export const SimpleModalServiceLogger = vi.fn((event: any) => E.void);

export class SimpleModalService extends E.Service<SimpleModalService>()('test/SimpleModalService', {
  effect: E.gen(function* () {
    return {
      log: (event: any) => SimpleModalServiceLogger(event),
    };
  }),
  accessors: true,
}) {}

export const SimpleModal = () => {
  return (
    <modal
      custom_id={'SimpleModal'}
      title={'Hello World!'}
      onsubmit={(event: any) => E.gen(function* () {
        yield* SimpleModalService.log(event);
      })}
    >
      <textinput label={'SimpleTextValue'}/>
    </modal>
  );
};
