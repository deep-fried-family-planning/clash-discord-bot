import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';


export type StaticGraph = {[k in string]: string | StaticGraph};


let complete    = false,
    staticGraph = {} as {};


export const generateStaticGraph = (trees: DisReactAbstractNode[]) => {
  complete    = false;
  staticGraph = {};

  // stuff

  Object.freeze(staticGraph);
  complete    = true;
};

export const isStaticGraphComplete = () => complete;

export const getStaticGraph = () => staticGraph;
