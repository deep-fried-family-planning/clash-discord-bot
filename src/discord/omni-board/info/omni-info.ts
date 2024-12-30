import {Cv, Ev} from '#discord/entities/basic';
import {makeMessage} from '#discord/entities/basic/node-view.ts';
import {useEffect} from '#discord/entities/hooks/use-effect.ts';
import {useRestEmbedRef} from '#discord/entities/hooks/use-rest-embed-ref.ts';
import {useRestRef} from '#discord/entities/hooks/use-rest-ref.ts';
import {useState} from '#discord/entities/hooks/use-state.ts';
import type {SelectOp} from '#pure/dfx';
import {CSL, g} from '#pure/effect';
import {OPTION_UNAVAILABLE} from '#src/constants/select-options.ts';
import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniBoard} from '#src/discord/omni-board/omni-board.ts';
import {MD} from '#src/internal/pure/pure.ts';


export const OmniInfo = makeMessage('OmniInfo', () => {
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
    Ev.Controller({
      title      : 'Server Info',
      description: MD.content(
        'Start',
      ),
    }),
    Ev.Basic({
      ref        : infoEmbedRef,
      title      : 'No Info Page Selected',
      description: 'Click below to start',
    }),
    Cv.Select({
      ref        : selectKindRef,
      placeholder: 'Select Kind',
      options    : OPTION_UNAVAILABLE,
      onClick    : (event) => {
        setKind(event.values);
      },
    }),
    Cv.Select({
      ref        : selectInfoRef,
      placeholder: 'Select Page',
      options    : OPTION_UNAVAILABLE,
      onClick    : (event) => {
        setInfoId(event.values);
      },
    }),
    NavButtons({
      back: OmniBoard,
    }),
  ];
});
