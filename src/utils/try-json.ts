import * as console from 'node:console';

export const tryJson = <T>(body: T): T => {
    try {
        return JSON.parse(body as string) as T;
    }
    catch (e) {
        console.error(e);
        return {} as T;
    }
};
