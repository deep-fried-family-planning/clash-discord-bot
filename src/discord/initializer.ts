// import {E, g} from '#pure/effect';
// import {DisReact} from '#src/internal/disreact/create-disreact.ts';
// import {CI, ConI, EI, HI} from '#src/internal/disreact/interface/index.ts';
// import console from 'node:console';
//
//
//
// const Mutual = () => {
//   const [nodes, setNext] = HI.useNext({Test});
//
//
//   return ConI.makePrivate(
//     EI.Header({
//       title      : 'Mutual',
//       description: `0`,
//     }),
//     CI.Row(
//       CI.PrimaryButton({
//         label  : `Does it work? 0`,
//         onClick: (event) => g(function * () {
//           yield * E.logDebug('effect hello world!');
//           console.log(event);
//           // setTitle(title + 1);
//         }),
//       }),
//       CI.SuccessButton({
//         label  : 'Mutex',
//         onClick: () => {
//           setNext(nodes.Test);
//         },
//       }),
//     ),
//   );
// };
//
//
// const Test = () => {
//   // const [title, setTitle] = makeUseState('nope');
//   const [next, setRoute] = HI.useNext({Mutual});
//
//
//   return ConI.makePrivate(
//     EI.Header({
//       title      : 'Mutex',
//       description: '0',
//     }),
//     CI.Row(
//       CI.PrimaryButton({
//         auths  : [Auth.MFA()],
//         label  : 'Hello World',
//         onClick: () => {
//         },
//       }),
//       CI.SuccessButton({
//         label  : 'Test',
//         onClick: () => {
//           setRoute(next.Mutual);
//         },
//       }),
//       CI.DangerButton({
//         label  : 'Close',
//         onClick: () => {
//           Un.setClose(true);
//         },
//       }),
//     ),
//   );
// };
//
//
// export const Starter = () => {
//   const [next, setRoute] = HI.useNext({Test, Mutual});
//
//
//   return ConI.makePublic(
//     EI.Header({
//       title      : 'Starter',
//       description: '0',
//     }),
//     CI.Row(
//       CI.PrimaryButton({
//         label  : 'Hello World',
//         onClick: () => {
//           console.log('hello world!!!');
//         },
//       }),
//       CI.SuccessButton({
//         label  : 'Next',
//         onClick: () => {
//           setRoute(next.Test);
//         },
//       }),
//     ),
//   );
// };
//
//
// export const DeepFryerDisReact = DisReact.makeLayer({Starter});
