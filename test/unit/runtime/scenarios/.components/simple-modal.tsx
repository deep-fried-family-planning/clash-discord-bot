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
      title={'Hello World!'}
      onsubmit={(event: any) => {
        return SimpleModalService.log(event);
      }}
    >
      <textinput label={'test text'}/>
    </modal>
  );
};
