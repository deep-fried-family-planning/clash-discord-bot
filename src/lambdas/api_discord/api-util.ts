import {badRequest} from '@hapi/boom';

export const DISCORD_PING = {type: 1};
export const DISCORD_PONG = {type: 1};

export const tryBody = <T>(body?: string | null): T => {
    try {
        if (!body) {
            throw badRequest('unparsable json');
        }

        return JSON.parse(body) as T;
    }
    catch (e) {
        throw badRequest('unparsable json');
    }
};

export const respond = ({status, body}: {status: number; body: object}) => ({
    statusCode: status,
    body      : JSON.stringify(body),
});
