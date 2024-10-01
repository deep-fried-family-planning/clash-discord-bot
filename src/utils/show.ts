import console from 'node:console';

export const show = <T>(obj: T): T => {
    const thing = JSON.stringify(obj, null, 4);
    const bytes = JSON.stringify(obj, null);

    console.log('show', thing);
    console.log('kb', bytes.length / 1024);
    return obj;
};
