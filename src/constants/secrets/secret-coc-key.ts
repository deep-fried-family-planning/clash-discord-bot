import {getSecret} from '#src/https/aws-ssm.ts';
import {secretKey, SECRETS} from '#src/internals/secret-keys.ts';

export const SECRET_COC_KEY = /* @__PURE__ */ await getSecret(/* @__PURE__ */ secretKey(SECRETS.COC_KEY______________));
