import {E, ML} from '#src/disreact/re-exports.ts'
import {Elem} from '#src/disreact/model/entity/elem/elem.ts'
import type {Root} from '#src/disreact/model/entity/root.ts'
import {Intrinsic} from 'src/disreact/codec/rest-elem/index.ts'
import {Keys} from 'src/disreact/codec/rest-elem/keys.ts'


export const encodeRoot = (root: Root) => {
  const result = {} as any,
        list   = ML.make<[any, Elem.Any[]]>([result, [root.elem]]),
        args   = new WeakMap<Elem, any>()

  while (ML.tail(list)) {
    const [acc, cs] = ML.pop(list)!

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i]

      if (Elem.isPrim(c)) {
        acc[Keys.primitive] ??= []
        acc[Keys.primitive].push(c)
      }
      else if (args.has(c as any)) {
        if (Elem.isRest(c)) {
          const norm = Intrinsic.NORM[c.type as any]
          const encode = Intrinsic.ENC[c.type]
          const arg = args.get(c)!
          acc[norm] ??= []
          acc[norm].push(encode(c, arg))
        }
        else {
          //
        }
      }
      else if (!c.nodes.length) {
        if (Elem.isRest(c)) {
          const norm = Intrinsic.NORM[c.type as any]
          const encode = Intrinsic.ENC[c.type]
          const arg = {} as any
          args.set(c, arg)
          acc[norm] ??= []
          acc[norm].push(encode(c, arg))
        }
        else {
          //
        }
      }
      else {
        ML.append(list, [acc, cs.slice(i)])
        const arg = {} as any
        args.set(c, arg)

        if (Elem.isRest(c)) {
          ML.append(list, [arg, c.nodes])
        }
        else {
          ML.append(list, [acc, c.nodes])
        }

        break
      }
    }
  }

  return result
}


export class ElemEncoder extends E.Service<ElemEncoder>()('disreact/ElemEncoder', {
  succeed: {
    encodeRoot,
  },
  accessors: true,
}) {}
