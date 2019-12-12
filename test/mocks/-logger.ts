import { NgConsole, NgLogger } from '../../src/logger';
import { $renderer } from './-renderer';

export const $console = new NgConsole();
export const $log = new NgLogger($renderer);
