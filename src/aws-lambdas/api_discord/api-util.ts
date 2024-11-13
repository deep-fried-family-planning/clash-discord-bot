import {badRequest} from '@hapi/boom';

export const tryBody = <T>(body?: string | null): T => {
    try {
        if (!body) {
            throw badRequest('unparsable json');
        }

        return JSON.parse(body) as T;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (e) {
        throw badRequest('unparsable json');
    }
};

export const respond = ({status, body}: {status: number; body: object | string}) => ({
    statusCode: status,
    body      : JSON.stringify(body),
});
