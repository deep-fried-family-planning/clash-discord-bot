import {BasicEmbed, EmbedController} from '#discord/entities/exv.ts';
import {Row, Select} from '#discord/entities/vc.ts';
import {makeView} from '#discord/entities/view.ts';
import {useRestEmbedRef} from '#discord/simulation/hooks/use--rest-embed-ref.ts';
import {useEffect} from '#discord/simulation/hooks/use-effect.ts';
import {useRestRef} from '#discord/simulation/hooks/use-rest-ref.ts';
import {useState} from '#discord/simulation/hooks/use-state.ts';
import type {SelectOp} from '#pure/dfx';
import {CSL, g} from '#pure/effect';
import {OPTION_UNAVAILABLE} from '#src/constants/select-options.ts';
import {Nav} from '#src/discord/omni-board/nav.ts';
import {OmniBoard} from '#src/discord/omni-board/omni-board.ts';
import {MD} from '#src/internal/pure/pure.ts';
import console from 'node:console';


export const OmniInfo = makeView('OmniInfo', () => {
  const [kind, setKind]              = useState('kind', [{value: 'nope'}] as SelectOp[]);
  const [infoId, setInfoId]          = useState('info', [{value: 'nope'}]);
  const [infoEmbedRef, setInfoEmbed] = useRestEmbedRef('info');
  const selectKindRef                = useRestRef('kind');
  const selectInfoRef                = useRestRef('info');

  useEffect(kind[0].value, g(function * () {
    yield * CSL.debug('info id', infoId);

    setInfoEmbed({
      description: MD.content(
        'kind',
        JSON.stringify(kind),
        JSON.stringify(infoId),
      ),
    });
  }));

  return [
    EmbedController({
      title      : 'Server Info',
      description: MD.content(
        'Start',
      ),
    }),
    BasicEmbed({
      ref        : infoEmbedRef,
      title      : 'No Info Page Selected',
      description: 'Click below to start',
    }),
    Row(
      Select({
        accessor   : selectKindRef,
        placeholder: 'Select Kind',
        options    : OPTION_UNAVAILABLE,
        onClick    : (values) => {
          console.info(values);
          setKind(values);
        },
      }),
    ),
    Row(
      Select({
        accessor   : selectInfoRef,
        placeholder: 'Select Page',
        options    : OPTION_UNAVAILABLE,
        onClick    : (values) => {
          console.info('selected info', values);
          setInfoId(values);
        },
      }),
    ),
    Nav({
      back: OmniBoard.name,
    }),
  ];
});
