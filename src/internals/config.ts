import {Cfg} from '#src/utils/effect.ts';
import {secretKey, SECRETS} from '#src/internals/secret-keys.ts';

export const CONFIG_DISCORD = Cfg.all([
    Cfg.string(secretKey(SECRETS.COC_KEY______________)),
    Cfg.string(secretKey(SECRETS.COC_USER_____________)),
    Cfg.string(secretKey(SECRETS.COC_PASSWORD_________)),
]);

export const CONFIG_COC = Cfg.all([
    Cfg.string(secretKey(SECRETS.COC_KEY______________)),
    Cfg.string(secretKey(SECRETS.COC_USER_____________)),
    Cfg.string(secretKey(SECRETS.COC_PASSWORD_________)),
]);
