import type {CxVR, ExVi} from '#dfdis';
import * as Router from './router.ts';


const cx = [
  // fully stateful
  '/v2/:defer/:root/:view/:row/:col/s/:name/:data/:action/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/s/:name/:data/:action/c/:type/:mode/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/s/:name/:data/:action/:mod?*',

  // stateful (data)
  '/v2/:defer/:root/:view/:row/:col/sd/:name/:data/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/sd/:name/:data/c/:type/:mode/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/sd/:name/:data/:mod?*',

  // stateful (action)
  '/v2/:defer/:root/:view/:row/:col/sa/:name/:action/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/sa/:name/:action/c/:type/:mode/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/sa/:name/:action/:mod?*',

  // not stateful
  '/v2/:defer/:root/:view/:row/:col/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/p/:p_group/:p_num/:p_now/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/c/:type/:mode/:mod?*',
  '/v2/:defer/:root/:view/:row/:col/:mod?*',
];


export const cxRouter = {
  build: Router.build<CxVR.T>(cx),
  parse: Router.parse<CxVR.T>(cx),
  set  : Router.set<CxVR.T>,
};


const ex = [
  '/:root/:view/:row/e/:name/:type/p/:p_group/:p_num/:p_now/:mod?*',
  '/:root/:view/:row/e/:name/:type/:mod?*',

  '/:root/:view/:row/e/:name/:type/p/:p_group/:p_num/:p_now/:mod?*',
  '/:root/:view/:row/p/:p_group/:p_num/:p_now/:mod?*',
];


export const defaultExRouter = {
  build: Router.build<ExVi.T>(ex),
  parse: Router.parse<ExVi.T>(ex),
  set  : Router.set<ExVi.T>,
};
