import {getSecret} from '#src/api/aws-ssm.ts';
import {secretKey, SECRETS} from '#src/constants/secret-keys.ts';

export const SECRET_COC_KEY = /* @__PURE__ */ await getSecret(/* @__PURE__ */ secretKey(SECRETS.COC_KEY______________));
