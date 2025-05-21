import {RehydrantEncoder} from '#src/disreact/mode/RehydrantEncoder.ts';
import {Rehydrator} from '#src/disreact/mode/Rehydrator.ts';
import type {Rehydrant} from '#src/disreact/mode/entity/rehydrant.ts';
import {pipe} from 'effect/Function';
import * as Lifecycle from './lifecycle.ts';
import * as E from 'effect/Effect';
