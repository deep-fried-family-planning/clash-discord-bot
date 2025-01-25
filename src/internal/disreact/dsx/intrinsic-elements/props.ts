import type {Children} from '#disreact/dsx/intrinsic-elements/index.ts';



export type Call<Attributes, Child> = Attributes & {children: Children.Any<Child>};

export type Model<Attributes, Child> = Attributes & {children: Children.Many<Child>};

export type Leaf<Attributes> = Attributes;
