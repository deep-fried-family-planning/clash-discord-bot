import {D} from '#pure/effect';


export class DevMistake extends D.TaggedError('DevMistake')<{}> {}


export class NotImplemented extends D.TaggedError('NotImplemented')<{}> {}


export class NodeUnavailable extends D.TaggedError('NodeUnavailable')<{}> {}


export class NodeNotFound extends D.TaggedError('NodeNotFound')<{}> {}

export class PipelineNotFound extends D.TaggedError('PipelineNotFound')<{}> {}


export class NodeNotMounted extends D.TaggedError('NodeNotMounted')<{}> {}
