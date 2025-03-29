import type {HookError} from '#src/disreact/model/error.ts'
import {E, pipe} from '#src/disreact/re-exports.ts'
import {Elem} from '#src/disreact/model/entity/elem/elem.ts'
import type {Root} from '#src/disreact/model/entity/root.ts'
import {Dispatcher} from '#src/disreact/model/hooks/Dispatcher.ts'
import type {UnknownException} from 'effect/Cause'
import {FC} from './entity/comp/fc'
import {Fibril} from '#src/disreact/model/fibril/fibril'

export * as LifecycleSingle from '#src/disreact/model/lifecycle-single.ts'
export type LifecycleSingle = never


export const render = (root: Root, self: Elem.Task): E.Effect<Elem.Any[], HookError | UnknownException, Dispatcher> =>
  pipe(
    E.andThen(Dispatcher, (dispatch) => dispatch.lock),
    E.andThen(() => {
      Fibril.λ.set(self.strand)
      const strand = Fibril.λ.get()
      strand.nexus = root.nexus
      self.strand.pc = 0
      self.strand.elem = self
      strand.nexus.strands[self.id!] = self.strand

      if (FC.isSync(self.type)) {
        return E.succeed(Elem.renderSync(self))
      }
      if (FC.isAsync(self.type)) {
        return Elem.renderAsync(self)
      }
      if (FC.isEffect(self.type)) {
        return Elem.renderEffect(self)
      }

      return Elem.renderUnknown(self)
    }),
    E.tap(() => {
      Fibril.λ.clear()
      return E.andThen(Dispatcher, (dispatch) => dispatch.unlock)
    }),
    E.map((children) => {
      self.strand.pc = 0
      self.strand.saved = structuredClone(self.strand.stack)
      self.strand.rc++

      const filtered = children.filter(Boolean) as Elem.Any[]

      for (let i = 0; i < filtered.length; i++) {
        const node = filtered[i]

        if (!Elem.isPrim(node)) {
          Elem.connectChild(self, node, i)
        }
      }

      return filtered
    }),
    E.catchAll((e) => {
      Fibril.λ.clear()
      return E.tap(E.fail(e), E.andThen(Dispatcher, (dispatch) => dispatch.unlock))
    }),
  )
