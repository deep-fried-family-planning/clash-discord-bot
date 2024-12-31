import {SingleSelect} from '#discord/entities/component-view.ts';
import {BasicEmbed, TitleEmbed} from '#discord/entities/embed-view.ts';
import {setValueSelected} from '#discord/entities/helpers.ts';
import {makeMessage} from '#discord/entities/node-view.ts';
import {useComponentReducer} from '#discord/hooks/use-component-reducer.ts';
import {useRestEmbedRef} from '#discord/hooks/use-embed-ref.ts';
import {g} from '#pure/effect';
import {SELECT_INFO_KIND} from '#src/constants/ix-constants.ts';
import {OPTION_UNAVAILABLE} from '#src/constants/select-options.ts';
import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniStart} from '#src/discord/omni-board/omni-start.ts';
import {MD} from '#src/internal/pure/pure.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


const useOmniInfoReducer = useComponentReducer({
  name: 'oinfo',
  spec: {
    section: 'Select',
    page   : 'Select',
  },
  initial: {
    section: {
      placeholder: 'Select Section',
      options    : SELECT_INFO_KIND,
    },
    page: {
      placeholder: 'Select Info Page',
      options    : OPTION_UNAVAILABLE,
    },
  },
  actions: {
    selectSection: (state, payload: str) => g(function * () {
      state.section.options = setValueSelected([payload], state.section.options);

      state.page.placeholder = payload;

      state.page.options = setValueSelected([], state.page.options);


      return state;
    }),
    selectPage: (state, payload: str) => g(function * () {
      state.page.options = setValueSelected([payload], state.page.options);
      return state;
    }),
  },
});


export const OmniInfo = makeMessage('OmniInfo', () => {
  // const [kind, setKind]       = useState('kind', 'none');
  // const [infoId, setInfoId]   = useState('info', 'none');
  // const [options, setOptions] = useState('options', OPTION_UNAVAILABLE as SelectOp[]);

  const [store, dispatch] = useOmniInfoReducer();

  // const kindRef              = useComponentRef('kind');
  // const infoRef              = useComponentRef('info');
  const [embedRef, setEmbed] = useRestEmbedRef('info');

  // useViewEffect(store.current.section.max_options);


  return [
    TitleEmbed({
      title      : 'Server Info',
      description: MD.content(
        'Start',
      ),
    }),
    BasicEmbed({
      ref        : embedRef,
      title      : 'No Info Page Selected',
      description: 'Click below to start',
    }),
    SingleSelect({
      ref    : store.refs.section,
      onClick: (event) => g(function * () {
        // setKind(event.first);
        //
        // console.log(event.ix.guild_id);
        // console.log(event.first);
        //
        // const ops = pipe(
        //   yield * infoQueryByServer({pk: event.ix.guild_id!}),
        //   sortByL(
        //     ORD.mapInput(ORDN, (i) => i.selector_order ?? 100),
        //     ORD.mapInput(ORDS, (i) => i.selector_label ?? i.name ?? 'ope'),
        //     ORD.mapInput(ORD.Date, (i) => i.updated),
        //   ),
        //   mapL((i) => ({
        //     label      : i.selector_label ?? i.name!,
        //     description: i.selector_desc!,
        //     value      : i.embed_id!,
        //     default    : false,
        //   })),
        // );
        //
        // ops[0].default = true;
        //
        // setOptions(ops);
        // setInfoId(ops[0].value);
        // setEmbed(viewInfoEmbed(yield * MenuCache.embedRead(ops[0].value)));

        dispatch(store.actions.selectSection, event.first);
      }),
    }),
    SingleSelect({
      ref    : store.refs.page,
      onClick: (event) => g(function * () {
        dispatch(store.actions.selectPage, event.first);

        // console.log('first', event.first);
        //
        // const ops = pipe(
        //   yield * infoQueryByServer({pk: event.ix.guild_id!}),
        //   sortByL(
        //     ORD.mapInput(ORDN, (i) => i.selector_order ?? 100),
        //     ORD.mapInput(ORDS, (i) => i.selector_label ?? i.name ?? 'ope'),
        //     ORD.mapInput(ORD.Date, (i) => i.updated),
        //   ),
        //   mapL((i) => ({
        //     label      : i.selector_label ?? i.name!,
        //     description: i.selector_desc!,
        //     value      : i.embed_id!,
        //     default    : i.embed_id === event.first,
        //   })),
        // );
        // setOptions(ops);
        // setInfoId(event.first);
        // setEmbed(viewInfoEmbed(yield * MenuCache.embedRead(event.first)));
      }),
    }),
    NavButtons({
      back: OmniStart,
    }),
  ];
});
