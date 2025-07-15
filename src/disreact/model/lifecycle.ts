import * as Polymer from '#disreact/model/core/Polymer.ts';
import * as Stack from '#disreact/model/core/Stack.ts';
import * as Elem from '#disreact/model/Elem.ts';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';

const mutex = E.unsafeMakeSemaphore(1),
      lock  = mutex.take(1),
      unlock = mutex.release(1);

const elementInitialize = (elem: Elem.Elem) => {

};

const elementHydrate = (elem: Elem.Elem) => {

};

const elementRerender = (elem: Elem.Elem) => {

};

const stackInitialize = (stack: Stack.Stack<Elem.Elem>) =>
  stack.pipe(
    Stack.pop,
    Elem.toEither,
    Either.map((elem) => {
      elem.polymer = Polymer.make(elem);

      return elem.pipe(
        Elem.renderGlobal,
        E.tap(Elem.flush),
        E.map(Elem.acceptRender),
        E.map(Stack.pushAllInto(stack)),
      );
    }),
    Either.mapLeft((elem) =>
      E.succeed(Stack.pushAll(stack, elem.children)),
    ),
    Either.merge,
  );

const stackHydrate = (stack: Stack.Stack<Elem.Elem>) =>
  stack.pipe(
    Stack.pop,
    Elem.toEither,
    Either.map((elem) => {
      elem.polymer = Polymer.make(elem);

      return elem.pipe(
        Elem.renderGlobal,
        E.map(Elem.acceptRender),
        E.map(Stack.pushAllInto(stack)),
      );
    }),
    Either.mapLeft((elem) =>
      E.succeed(Stack.pushAll(stack, elem.children)),
    ),
    Either.merge,
  );
