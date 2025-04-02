import {EH} from '#src/disreact/model/entity/eh.ts'
import {Elem} from '#src/disreact/model/entity/elem.ts'
import {Props} from '#src/disreact/model/entity/props.ts'
import {Root} from '#src/disreact/model/entity/root.ts'
import {Fibril} from '#src/disreact/model/fibril/fibril.ts'
import {Relay, relayPartial, RelayStatus} from '#src/disreact/model/Relay.ts'
import {E, ML, pipe} from '#src/disreact/re-exports.ts'
import {Lifecycle} from 'src/disreact/model/lifecycle.ts'

export * as Lifecycles from '#src/disreact/model/lifecycles.ts'
export type Lifecycles = never

export const handleEvent = (root: Root, event: any) =>
  E.suspend(() => {
    const stack = ML.make<Elem>(root.elem)

    while (ML.tail(stack)) {
      const elem = ML.pop(stack)!

      if (Elem.isRest(elem)) {
        if (elem.props.custom_id === event.id || elem.ids === event.id) {
          return pipe(
            EH.apply(elem.handler, event),
            E.andThen(() => Relay.sendStatus(RelayStatus.Handled())),
            E.tap(() => Lifecycle.notifyOnHandlePiped(root)),
          )
        }
      }

      for (let i = 0; i < elem.nodes.length; i++) {
        const node = elem.nodes[i]
        if (!Elem.isPrim(node)) {
          ML.append(stack, elem.nodes[i])
        }
      }
    }

    return E.fail(new Error('Event not handled'))
  })


export const initialize = (root: Root) =>
  pipe(
    initializeSubtree(root, root.elem),
    E.as(root),
  )

export const initializeSubtree = (root: Root, elem: Elem) => E.gen(function* () {
  const stack = ML.make<Elem>(elem)

  let hasSentPartial = false

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!

    if (Elem.isTask(elem)) {
      elem.nodes = yield* Lifecycle.renderElemPiped(root, elem)
    }
    else if (!hasSentPartial) {
      hasSentPartial = yield* relayPartial(elem)
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i]

      if (!Elem.isPrim(node)) {
        Elem.connectChild(elem, node, i)
        Root.mountElem(root, node)
        ML.append(stack, node)
      }
    }
  }

  return elem
})


export const hydrate = (root: Root) => pipe(
  E.iterate(ML.make<Elem>(root.elem), {
    while: (stack) => !!ML.tail(stack),
    body : (stack) =>
      pipe(
        E.suspend(() => {
          const elem = ML.pop(stack)!

          if (Elem.isTask(elem)) {
            if (root.nexus.strands[elem.id!]) {
              elem.strand = root.nexus.strands[elem.id!]
              elem.strand.nexus = root.nexus
            }

            return pipe(
              Lifecycle.renderElemPiped(root, elem),
              E.map((children) => {
                elem.nodes = children
                return elem
              }),
            )
          }

          return E.succeed(elem as Elem)
        }),
        E.map((elem) => {
          for (let i = 0; i < elem.nodes.length; i++) {
            const node = elem.nodes[i]

            if (!Elem.isPrim(node)) {
              Elem.connectChild(elem, node, i)
              Root.mountElem(root, node)
              ML.append(stack, node)
            }
          }
          return stack
        }),
      ),
  }),
  E.as(root),
)


export const rerender = (root: Root) => E.gen(function* () {
  const stack = ML.empty<[Elem, Elem.Any[]]>()
  let hasSentPartial = false

  if (Elem.isRest(root.elem)) {
    for (let i = 0; i < root.elem.nodes.length; i++) {
      const node = root.elem.nodes[i]

      if (Elem.isPrim(node)) {
        continue
      }
      else if (Elem.isTask(node)) {
        ML.append(stack, [node, yield* Lifecycle.renderElemPiped(root, node)])
      }
      else {
        ML.append(stack, [node, node.nodes])
      }
    }
  }
  else {
    ML.append(stack, [root.elem, yield* Lifecycle.renderElemPiped(root, root.elem)])
  }

  while (ML.tail(stack)) {
    const [parent, rs] = ML.pop(stack)!
    const maxlen = Math.max(parent.nodes.length, rs.length)

    for (let i = 0; i < maxlen; i++) {
      const curr = parent.nodes[i]
      const rend = rs[i]

      if (!curr) {
        if (Elem.isPrim(rend)) {
          parent.nodes[i] = rend
        }
        else {
          yield* mountSubtree(root, rend)
          parent.nodes[i] = rend
        }
      }
      else if (!rend) {
        if (Elem.isPrim(curr)) {
          delete parent.nodes[i]
        }
        else {
          dismountSubtree(root, curr)
          delete parent.nodes[i]
        }
      }

      else if (Elem.isPrim(curr)) {
        if (Elem.isPrim(rend)) {
          if (curr !== rend) {
            parent.nodes[i] = rend
          }
        }
        else if (Elem.isRest(rend)) {
          yield* mountSubtree(root, rend)
          parent.nodes[i] = rend
        }
        else {
          yield* mountSubtree(root, rend)
          parent.nodes[i] = rend
        }
      }

      else if (Elem.isRest(curr)) {
        if (!hasSentPartial) {
          hasSentPartial = yield* relayPartial(curr)
        }

        if (Elem.isPrim(rend)) {
          dismountSubtree(root, curr)
          parent.nodes[i] = rend
        }
        else if (Elem.isRest(rend)) {
          if (curr.type !== rend.type) {
            dismountSubtree(root, curr)
            yield* mountSubtree(root, rend)
            parent.nodes[i] = rend
          }
          if (!Props.isEqual(curr.props, rend.props)) {
            curr.props = rend.props
          }
          ML.append(stack, [curr, rend.nodes])
        }
        else {
          dismountSubtree(root, curr)
          yield* mountSubtree(root, rend)
          parent.nodes[i] = rend
        }
      }

      else {
        if (Elem.isPrim(rend)) { // Task => Primitive
          dismountSubtree(root, curr)
          parent.nodes[i] = rend
        }
        else if (Elem.isRest(rend) || curr.idn !== rend.idn) { // Task => Rest or Task => Task
          dismountSubtree(root, curr)
          yield* mountSubtree(root, rend)
          parent.nodes[i] = rend
        }
        else if (
          Props.isEqual(curr.props, rend.props) && // Task Changed
          Fibril.isSameStrand(curr.strand)
        ) {
          ML.append(stack, [curr, rend.nodes])
        }
        else {
          const rerendered = yield* Lifecycle.renderElemPiped(root, curr)
          ML.append(stack, [curr, rerendered])
        }
      }
    }
  }

  return root
})


export const mountSubtree = (root: Root, elem: Elem) => E.gen(function* () {
  const stack = ML.make<Elem>(elem)

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!

    if (Elem.isTask(elem)) {
      Root.mountTask(root, elem)
      elem.nodes = yield* Lifecycle.renderElemPiped(root, elem)
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i]

      if (!Elem.isPrim(node)) {
        ML.append(stack, node)
      }
    }
  }
})

export const dismountSubtree = (root: Root, elem: Elem) => {
  const stack = ML.make<Elem>(elem)

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!

    if (Elem.isTask(elem)) {
      Root.dismountTask(root, elem)
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i]

      if (!Elem.isPrim(node)) {
        ML.append(stack, node)
      }
    }
  }
}
