let ParamsStore = new URLSearchParams();


export const setParamStore = (params: URLSearchParams) => {
    ParamsStore = new URLSearchParams();
};


export const clearParamStore = () => {
    ParamsStore = new URLSearchParams();
};


export {ParamsStore};
