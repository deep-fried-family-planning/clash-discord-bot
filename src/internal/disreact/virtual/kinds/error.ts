import {D} from '#pure/effect';


export class Critical extends D.TaggedError('CriticalFailure')<{}> {}
export class Impossible extends D.TaggedError('ImpossibleError')<{}> {}


export class DevMistake extends D.TaggedError('DevMistake')<{}> {}


export class NotImplemented extends D.TaggedError('NotImplemented')<{}> {}


export class NodeUnavailable extends D.TaggedError('NodeUnavailable')<{}> {}


export class NodeNotFound extends D.TaggedError('NodeNotFound')<{}> {}

export class PipelineNotFound extends D.TaggedError('PipelineNotFound')<{}> {}


export class NodeNotMounted extends D.TaggedError('NodeNotMounted')<{}> {}
export class MemoryUnavailable extends D.TaggedError('MemoryUnavailable')<{}> {}
export class MemoryExpired extends D.TaggedError('MemoryExpired')<{}> {}


export class ComponentRangeError extends D.TaggedError('ComponentRangeError')<{}> {}
export class ModelReferenceError extends D.TaggedError('ModelReferenceError')<{}> {}
export class ComponentReferenceError extends D.TaggedError('ComponentReferenceError')<{}> {}
export class ComponentUnknownError extends D.TaggedError('ComponentUnknownError')<{}> {}
export class EmbedReferenceError extends D.TaggedError('EmbedReferenceError')<{}> {}
export class UnknownInteraction extends D.TaggedError('UnknownInteraction')<{}> {}
