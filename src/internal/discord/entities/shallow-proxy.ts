export const make = () => new Proxy({}, {
    get() {
        return {

        };
    },
    set() {
        return true;
    },
});
