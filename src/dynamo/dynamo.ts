export type CompKey<T extends {pk: unknown; sk: unknown}> = Pick<T, 'pk' | 'sk'> & {
  pk: string;
  sk: string;
};
