import type {IxD} from '#src/internal/discord.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {DUser} from '#src/dynamo/schema/discord-user.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import type {CxId, CxSelect, DxText} from '#src/internal/ix-system/store/types-components.ts';
import type {CxButton} from '#src/internal/ix-system/store/make-component.ts';


export type Cx = {
    [k in str]: CxButton | CxSelect
};


export type Mx = {
    ex: Required<IxD>['message']['embeds'];
    cx: Cx;
};


export type Ax = {
    id      : CxId;
    selected: str[];
    dx: {
        [k in str]: DxText
    };
};


export type Rx = {
    ix: IxD;
    mx: Mx;
    ax: Ax;
};


export type Sx = {
    rx: Rx;

    user  : DUser;
    server: DServer;
};

