import {S} from '#src/disreact/re-exports.ts'

export * as Monomer from '#src/disreact/model/fibril/monomer.ts'
export type Monomer =
  | Null
  | State
  | Dependency
  | Modal
  | Message

export type Null = null
export type State = {s: any}
export type Dependency = {d: any}
export type Modal = {m: any}
export type Message = {e: any}

export const Null = S.Null
export const State = S.Struct({s: S.Any})
export const Dependency = S.Struct({d: S.Any})
export const Modal = S.Struct({m: S.Any})
export const Message = S.Struct({e: S.Any})
export const Any = S.Union(Null, State, Dependency, Modal, Message)

export const isNull = (self: Monomer): self is Null => self === null
export const isState = (self: Monomer): self is State => !!self && 's' in self
export const isDependency = (self: Monomer): self is Dependency => !!self && 'd' in self
export const isModal = (self: Monomer): self is Modal => !!self && 'm' in self
export const isMessage = (self: Monomer): self is Message => !!self && 'e' in self
