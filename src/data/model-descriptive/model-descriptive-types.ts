import type {num} from '#src/data/types-pure.ts';

export type Descriptive1D = {
    n_samples: num;
    mean     : num;
    median   : num;
    mode     : num;
    std_dev  : num;
    min      : num;
    max      : num;
};

export type HitRate = {
    n_samples: num;
    n_success: num;
};
