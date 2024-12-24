import * as Router from './router.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {CxVi, ExVi} from '../entities/index.ts';
export * as Router from './router.ts';

type thing = {
    root          : str;
    sc_name       : str;
    sc_data       : str;
    sc_action     : str;
    component_name: str;
    component_mode: str;
    view_name     : str;
    view_type     : str;
    page_port     : str;
    page_static   : str;
    page_current  : str;
    row           : str;
    col           : str;

};

const cx = [
    '/:root/:name/:data/:action/:type/:mode/:view/:mod/:pgp/:pgn/:pgx/:row/:col',
];


export const defaultCxRouter = {
    build: Router.build<CxVi.T>(cx),
    parse: Router.parse<CxVi.T>(cx),
    set  : Router.set<CxVi.T>,
};


const ex = [
    '/:root/:embed_name/:embed_mode/:page_port/:page_static/:page_current/:row',
];


export const defaultExRouter = {
    build: Router.build<ExVi.T>(ex),
    parse: Router.parse<ExVi.T>(ex),
    set  : Router.set<ExVi.T>,
};
