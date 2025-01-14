import {createEffect} from '#src/internal/disreact/disreact.ts';
import {DevComponent, DevEmbed, DevHook, DevNode} from '#src/internal/disreact/entity/index.ts';


export const Entrypoint          = DevNode.makeEntrypoint;
export const EphemeralEntrypoint = DevNode.makeEphemeral;
export const Dialog              = DevNode.makeDialog;


export const Buttons = DevComponent.Row;
export const Button  = DevComponent._Button;
export const Text    = DevComponent.Text;


export const Controller  = DevEmbed.Controller;
export const DialogEmbed = DevEmbed.DialogLinked;
export const BasicEmbed  = DevEmbed.Basic;


export const useState           = DevHook.makeUseState;
export const useRestState       = DevHook.makeUseRestState;
export const useReducer         = DevHook.makeUseReducer;
export const useDialogRestState = DevHook.makeUseDialogRestState;
export const useRoute           = DevHook.makeUseRoute;


export const createDisReactEffect = createEffect;
