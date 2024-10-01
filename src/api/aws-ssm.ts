import {GetParameterCommand, SSMClient} from '@aws-sdk/client-ssm';

export const aws_ssm = /* @__PURE__ */ new SSMClient({});

export const getSecret = /* @__PURE__ */ async (key: string) => {
    const cmd = new GetParameterCommand({
        Name          : key,
        WithDecryption: true,
    });

    const resp = await aws_ssm.send(cmd);

    return resp.Parameter!.Value!;
};
