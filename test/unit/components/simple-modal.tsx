import {usePage} from '#src/disreact/index.ts';
import {SimpleMessage} from '#test/unit/components/simple-message.tsx';
import * as E from 'effect/Effect';

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
  const page = usePage([SimpleMessage]);

  return (
    <modal
      custom_id={'SimpleModal'}
      title={'Hello World!'}
      onsubmit={(event: any) => E.gen(function* () {
        yield* SimpleModalService.log(event);
        page.next(SimpleMessage, {title: event.custom_id});
      })}
    >
      <textinput label={'SimpleTextValue'} value={'Ope'}/>
    </modal>
  );
};
