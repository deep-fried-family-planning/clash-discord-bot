// /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment */
//
//
//
// import {emptyHookState} from '#disreact/danger/globals.ts';
// import {decodeHooks} from '#disreact/model/hooks/hooks.ts';
// import {DialogTag} from '#disreact/dsx/intrinsic.ts';
//
//
//
// export const decodeRenderRoot = (root: any, hookParams: URLSearchParams) => {
//   const states = decodeHooks(hookParams);
//
//   if (root.name in states) {
//     const state = states[root.name];
//
//     mountActiveHooks(state);
//
//     const output = root.render();
//     output.state = dismountActiveHooks();
//     return output;
//   }
//   else {
//     const state = emptyHookState();
//     state.id    = root.name;
//     mountActiveHooks(state);
//
//     const output = root.render();
//     output.state = dismountActiveHooks();
//     return output;
//   }
// };
//
//
// export const withoutFunctions = (root: any) => {
//   return root.children;
// };
//
//
// export const rerenderRoot = (root: any) => {
//   // root.state = root.state ?? emptyHookState();
//   //
//   // mountActiveHooks(root.state);
//   //
//   // // const output = root.render();
//   // //
//   // // root.state          = dismountActiveHooks();
//   // // root.props.children = output;
//
//   return root.render();
// };
//
//
// export const encodeRoot = (root: any) => {
//   const state = root.state ?? emptyHookState();
//
//   const output = encodeNode(root);
// };
//
//
// const encodeNode = (root: any, node: any) => {
//   const type = typeof node.type;
//
//   if (type === 'function') {
//
//   }
//
//   if (node.type === DialogTag) {
//     return {
//       custom_id: '',
//     };
//   }
//
//   if (node.children.length) {
//     return node.children.map((child: any) => encodeNode(root, child));
//   }
//
//   if (type === 'function') {
//     return node.props.children;
//   }
// };
//
//
// const encodeNodes = (root: any, nodes: any[]) => {
//
// };
