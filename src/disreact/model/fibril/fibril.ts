import {S} from '#src/disreact/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem/elem.ts'
import type {Root} from '#src/disreact/model/entity/root.ts'
import * as MsgPack from '@msgpack/msgpack'
import {pipe, Record} from 'effect'
import * as Data from 'effect/Data'
import * as Equal from 'effect/Equal'
import * as pako from 'pako'
import {Polymer} from '#src/disreact/model/fibril/polymer.ts'
import type { EF } from './ef'


export * from '#src/disreact/model/fibril/polymer.ts'
export * from '#src/disreact/model/fibril/monomer.ts'
export * as Fibril from '#src/disreact/model/fibril/fibril.ts'
export type Fibril = never

export type Hydrant = typeof Hydrant.Type

export const Hydrant = S.transform(
  S.String,
  S.Struct({
    id     : S.String,
    props  : S.Any,
    strands: S.Record({key: S.String, value: Polymer.Chain}),
  }),
  {
    strict: true,
    encode: (hydrant) => deflate(hydrant),
    decode: (hash) => inflate(hash),
  },
)

const deflate = (data: any) =>
  pipe(
    MsgPack.encode(data),
    pako.deflate,
    (binary) => Buffer.from(binary).toString('base64url'),
  )

const inflate = (encoded: string) =>
  pipe(
    Buffer.from(encoded, 'base64url'),
    pako.inflate,
    MsgPack.decode,
  ) as any


export type Strand = {
  pc    : number
  rc    : number
  stack : Polymer.Chain
  saved : Polymer.Chain
  queue : any[]
  elem? : Elem.Task
  nexus?: Nexus | undefined
}

export const isSameStrand = (self: Strand) => {
  const a = self.stack
  const b = self.saved

  if (a.length !== b.length) {
    return false
  }

  const stackData = Data.array(self.stack.map((s) => s === null ? null : Data.struct(s)))
  const priorData = Data.array(self.saved.map((s) => s === null ? null : Data.struct(s)))

  return Equal.equals(stackData, priorData)
}

export const makeStrand = (): Strand =>
  ({
    rc   : 0,
    pc   : 0,
    stack: [],
    saved: [],
    queue: [],
  })

export const cloneStrand = (self: Strand): Strand => {
  if (self.queue.length > 0) {
    throw new Error('Queue is not empty.')
  }

  const {elem, nexus, ...rest} = self

  return structuredClone(rest)
}


export type Nexus = {
  id     : string
  props  : Hydrant
  strands: {[id: string]: Strand}
  next: {
    id   : string | null
    props: any
  }
  queue   : EF.Queue
  request?: any
  root?   : Root | undefined
}

export const makeNexus = (props?: any): Nexus =>
  ({
    id     : '-',
    props  : props ?? {},
    strands: {},
    next   : {
      id   : '-',
      props: {},
    },
    queue: [],
  })

export const decodeNexus = (hydrant: Hydrant): Nexus =>
  ({
    id     : hydrant.id,
    props  : hydrant.props,
    strands: Record.map(hydrant.strands, (stack) =>
      ({
        rc   : 1,
        pc   : 0,
        stack,
        saved: [],
        queue: [],
      }),
    ),
    next: {
      id   : hydrant.id,
      props: hydrant.props,
    },
    queue: [],
  })

export const encodeNexus = (self: Nexus): Hydrant =>
  ({
    id     : self.id,
    props  : self.props,
    strands: Record.map(self.strands, (node) => node.stack),
  })

export const cloneNexus = (self: Nexus): Nexus => {
  const {root, strands, ...rest} = self

  const cloned = structuredClone(rest) as Nexus
  cloned.strands = Record.map(strands, (node) => cloneStrand(node))
  return cloned
}

export namespace λ {
  const NODE = {current: null as Strand | null}
  export const get = () => NODE.current!
  export const set = (node: Strand) => {NODE.current = node}
  export const clear = () => {NODE.current = null}
}
