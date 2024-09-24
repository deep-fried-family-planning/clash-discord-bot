type N = {readonly name: string};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const cmdName = <T extends N, U extends N, V extends N>(n1: T, n2: U, n3: V) => `${n1.name}-${n2.name}-${n3.name}`;
