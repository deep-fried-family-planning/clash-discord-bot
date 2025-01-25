import {createRootElement} from '#disreact/dsx/create-element.ts';
import {ExampleDialog, JsxExample, SubComponent} from '#src/discord/jsx-example.tsx';
import {encodeHooks} from '#disreact/model/hooks/hook-codec.ts';
import {createRootMap, cloneFromRootMap} from '#disreact/model/root-map.ts';
import {renderTree} from '#disreact/model/tree/render.ts';
import {encodeTreeAsMessage} from '#disreact/runtime/codec.ts';
import {inspectLog} from '#src/internal/pure/pure.ts';


const root = createRootElement(JsxExample, {});
const root2 = createRootElement(ExampleDialog, {});

const rootMap = createRootMap([
  root,
  root2,
]);

console.log(rootMap[JsxExample.name][SubComponent.name].name);

const original = cloneFromRootMap(rootMap, JsxExample.name, JsxExample.name);
const clone = cloneFromRootMap(rootMap, JsxExample.name, JsxExample.name);
const clone2 = cloneFromRootMap(rootMap, ExampleDialog.name, ExampleDialog.name);

inspectLog('')(encodeTreeAsMessage(clone));
inspectLog('')(encodeTreeAsMessage(clone2));

// console.log(root.state.stack);
//
// renderTree(root);
//
// console.log(root.state.stack);
//
// renderTree(root);

// console.log(encodeHooks(root.state));
// const prms = new URLSearchParams([['tihng', JSON.stringify(root.state.stack)]]);
//
//
// console.log();
// console.log(encodeURIComponent(JSON.stringify(root.state.stack)));
// console.log(prms.get('tihng'));
// console.log();
// console.log(JSON.parse(decodeURIComponent(prms.get('tihng')!)));
// inspectLog((JSON.parse(decodeURIComponent(prms.get('tihng')!))));
