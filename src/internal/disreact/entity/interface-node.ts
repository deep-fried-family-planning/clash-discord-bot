import {Ar, Arr, pipe} from '#pure/effect';
import {Cv, Ev, Tx, VDialog, VMessage} from '#src/internal/disreact/entity/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const makeEntrypoint = (...rows: readonly (Ev.T | Cv.T[])[]) => VMessage.make(
  pipe(
    rows.filter((row) => !Arr.isArray(row)) as Ev.T[],
    Ar.map(Ev.render),
  ),
  pipe(
    rows.filter(Arr.isArray) as Cv.T[][],
    Ar.map((row) => pipe(row, Ar.map(Cv.toVirtual))),
  ),
  Tx.Public,
);


export const makeEntrypointEdit = (...rows: readonly (Ev.T | Cv.T[])[]) => VMessage.make(
  pipe(
    rows.filter((row) => !Arr.isArray(row)) as Ev.T[],
    Ar.map(Ev.render),
  ),
  pipe(
    rows.filter(Arr.isArray) as Cv.T[][],
    Ar.map((row) => pipe(row, Ar.map(Cv.toVirtual))),
  ),
  Tx.PublicUpdate,
);


export const makeEphemeral = (...rows: readonly (Ev.T | Cv.T[])[]) => VMessage.make(
  pipe(
    rows.filter((row) => !Arr.isArray(row)) as Ev.T[],
    Ar.map(Ev.render),
  ),
  pipe(
    rows.filter(Arr.isArray) as Cv.T[][],
    Ar.map((row) => pipe(row, Ar.map(Cv.toVirtual))),
  ),
  Tx.Private,
);


export const makeEphemeralEdit = (...rows: readonly (Ev.T | Cv.T[])[]) => VMessage.make(
  pipe(
    rows.filter((row) => !Arr.isArray(row)) as Ev.T[],
    Ar.map(Ev.render),
  ),
  pipe(
    rows.filter(Arr.isArray) as Cv.T[][],
    Ar.map((row) => pipe(row, Ar.map(Cv.toVirtual))),
  ),
  Tx.PrivateUpdate,
);


export const makeDialog = (title: str, ...rows: Cv.T[][]) => VDialog.make(
  title,
  pipe(
    rows,
    Ar.map((row) => pipe(row, Ar.map(Cv.toVirtual))),
  ),
);
