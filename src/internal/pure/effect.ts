import {Order} from 'effect';

export {
    Effect as E,
    Console as CSL,
    Data as D,
    DateTime as DT,
    Redacted as RDT,
    Config as CFG,
    Context as CTX,
    Layer as L,
    Cache as C,
    Logger as Logger,
    LogLevel,
    LogSpan,
    Schema as S,
    Brand as B,
    RateLimiter as RL,
    Metric as Metric,
    Order as ORD,
    Option as O,
    Equal as EQ,
    flow,
    pipe,
} from 'effect';


export const ORDS = Order.string;
export const ORDSR = Order.reverse(Order.string);
export const ORDN = Order.number;
export const ORDNR = Order.reverse(Order.number);
