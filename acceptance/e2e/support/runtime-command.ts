import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
const execute = promisify(execFile);
const rtk = (process.env.PATH ?? '')
	.split(delimiter)
	.map((directory) => join(directory, 'rtk'))
	.find(existsSync);
export function runRuntimeCommand(command: string, args: string[]) {
	return execute(rtk ?? command, rtk ? ['proxy', command, ...args] : args, {
		cwd: resolve(import.meta.dirname, '../../..'),
		timeout: 60000
	});
}
