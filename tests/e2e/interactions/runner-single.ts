import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FileToServe, runTests } from '../runner';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);

if (process.argv.length < 3) {
	console.log('Usage: runner-single PATH_TO_TEST_STANDALONE_MODULE <TEST_FILE_1> [TEST_FILE_2 ...]');
	process.exit(1);
}

const testStandalonePath = process.argv[2];
const testCaseFile = process.argv[3] ? resolve(process.argv[3]) : '';

if (!testCaseFile) {
	console.error('runner-single: missing TEST_CASE_FILE argument');
	process.exit(1);
}

// Pass rectangle-flow.js (or any test case file) to the single-test harness via env
process.env.TEST_CASE_FILE = testCaseFile;

const filesToServe: FileToServe[] = [
	{
		name: 'test.js',
		filePath: resolve(testStandalonePath),
		envVar: 'TEST_STANDALONE_PATH',
	},
];

// Run the dedicated single-case harness
const singleHarness = resolve(currentDirectory, './interactions-test-single.ts');
void runTests([singleHarness], filesToServe, 5 * 60 * 1000);
