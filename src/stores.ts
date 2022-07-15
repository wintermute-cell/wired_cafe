import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store';

export enum ProgressType {
    UNDEFINED,
    TASK,
    TIME,
}

export const progressType: Writable<ProgressType> = writable(ProgressType.UNDEFINED);

export const taskList: Writable<Array<string>> = writable(['One Task']);

export const workTime: Writable<number> = writable(-1);

export const checkup: Writable<boolean> = writable(false);