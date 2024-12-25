import type {str} from '#src/internal/pure/types-pure';


export type UserMessage = {
    title     : str;
    message   : str;
    retryable?: boolean;
};


export type DeveloperMessage = {
    title  : str;
    message: str;
};
