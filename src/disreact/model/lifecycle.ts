import {Elem} from '#src/disreact/model/entity/elem.ts'
import type {Root} from '#src/disreact/model/entity/root.ts'
import {EF} from '#src/disreact/model/fibril/ef.ts'
import {Fibril} from '#src/disreact/model/fibril/fibril'
import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts'
import {Relay, Status} from '#src/disreact/model/Relay.ts'
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts'
import {E, pipe, type RT} from '#src/disreact/re-exports.ts'
import {FC} from 'src/disreact/model/entity/fc.ts'

export * as Lifecycle from '#src/disreact/model/lifecycle.ts'
export type Lifecycle = never

export const renderElemPiped = (root: Root, self: Elem.Task) =>
  pipe(
    E.andThen(HooksDispatcher, (dispatch) => dispatch.lock),
    E.andThen(() => {
      Fibril.λ.set(self.strand)
      self.strand.nexus = root.nexus
      self.strand.pc = 0
      self.strand.elem = self
      self.strand.nexus.strands[self.id!] = self.strand

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
      return E.andThen(HooksDispatcher, (dispatch) => dispatch.unlock)
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
      return E.tap(E.fail(e), E.andThen(HooksDispatcher, (dispatch) => dispatch.unlock))
    }),
    E.tap(() => renderEffectAtNodePiped(root, self)),
  )


export const renderEffectPiped = (root: Root, ef: EF) =>
  pipe(
    EF.applyEffect(ef),
    E.tap(() => notifyPiped(root)),
  )

export const renderEffectAtNodePiped = (root: Root, node: Elem.Task) => {
  if (!node.strand.queue.length) {
    return E.void
  }

  const effects = Array<RT<typeof renderEffectPiped>>(node.strand.queue.length)
  for (let i = 0; i < effects.length; i++) {
    effects[i] = renderEffectPiped(root, node.strand.queue[i])
  }

  return pipe(
    E.all(effects),
    E.asVoid,
  )
}


export const notifyPiped = (root: Root) => {
  const curr = root.nexus
  const next = root.nexus.next

  if (next.id === null) {
    return pipe(
      Relay.setOutput(null),
      E.andThen(() => Relay.sendStatus(
        Status.Close()),
      ),
    )
  }

  if (next.id !== curr.id) {
    return pipe(
      SourceRegistry.checkout(next.id, next.props),
      E.andThen((next) => Relay.setOutput(next)),
      E.andThen(() => Relay.sendStatus(
        Status.Next({
          id   : next.id!,
          props: next.props,
        })),
      ),
    )
  }

  return E.void
}


export const notifyOnHandlePiped = (root: Root) =>
  E.suspend(() => {
    const curr = root.nexus
    const next = root.nexus.next

    if (next.id === null) {
      return pipe(
        Relay.setOutput(null),
        E.andThen(() => Relay.sendStatus(
          Status.Close()),
        ),
      )
    }

    if (next.id !== curr.id) {
      return pipe(
        SourceRegistry.checkout(next.id, next.props),
        E.andThen((next) => Relay.setOutput(next)),
        E.andThen(() => Relay.sendStatus(
          Status.Next({
            id   : next.id!,
            props: next.props,
          })),
        ),
      )
    }

    return pipe(
      Relay.setOutput(root),
      E.andThen(() => Relay.sendStatus(
        Status.Next({
          id   : curr.id!,
          props: curr.props,
        }),
      )),
    )
  })
