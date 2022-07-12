import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store';

export enum ProgressType {
    UNDEFINED,
    TASK,
    TIME,
}

export const progressType: Writable<ProgressType> = writable(ProgressType.UNDEFINED);

export const taskList: Writable<Array<string>> = writable(['One Task']);
