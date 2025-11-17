/// <reference types="node" />
import { expect } from 'chai';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import puppeteer, { Browser, HTTPResponse, launch as launchPuppeteer } from 'puppeteer';

import { Interaction, runInteractionsOnPage } from '../helpers/perform-interactions';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);

const dummyContent = readFileSync(
	join(currentDirectory, 'helpers', 'test-page-dummy.html'),
	{ encoding: 'utf-8' }
);

function generatePageContent(
	standaloneBundlePath: string,
	testCaseCode: string
): string {
	return dummyContent
		.replace('PATH_TO_STANDALONE_MODULE', standaloneBundlePath)
		.replace('TEST_CASE_SCRIPT', testCaseCode);
}

const testStandalonePathEnvKey = 'TEST_STANDALONE_PATH';
const testStandalonePath: string = process.env[testStandalonePathEnvKey] || '';
const singleTestFile: string = process.env.TEST_CASE_FILE || '';

interface InternalWindow {
	initialInteractionsToPerform: () => Interaction[];
	finalInteractionsToPerform: () => Interaction[];
	finishedSetup: Promise<() => void>;
	afterInitialInteractions?: () => void;
	afterFinalInteractions: () => void;
}

void describe('Single interaction test', () => {
const puppeteerOptions: Parameters<typeof launchPuppeteer>[0] = {
	headless: true,
};
if (process.env.NO_SANDBOX) {
	puppeteerOptions.args = ['--no-sandbox', '--disable-setuid-sandbox'];
}
// 如果提供了可执行路径则优先使用，以提升 Windows/CI 稳定性
if (process.env.PUPPETEER_EXECUTABLE_PATH && typeof process.env.PUPPETEER_EXECUTABLE_PATH === 'string') {
	(puppeteerOptions as any).executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
}

	let browser: Browser;

before(async () => {
	console.log('[single] TEST_STANDALONE_PATH=%s TEST_CASE_FILE=%s', testStandalonePath, singleTestFile);
	expect(
		testStandalonePath,
		`path to test standalone module must be passed via ${testStandalonePathEnvKey}`
	).to.have.length.greaterThan(0);
	expect(singleTestFile, 'TEST_CASE_FILE env is required').to.have.length.greaterThan(0);

	// 与多用例版保持一致：三段式回退启动策略（executablePath -> channel=chrome -> channel=chromium）
	const tryLaunch = async (opts: any, label: string): Promise<Browser> => {
		try {
			console.log('[single] puppeteer.launch attempt=%s opts=%o', label, {
				headless: opts?.headless,
				args: opts?.args,
				executablePath: opts?.executablePath,
				channel: opts?.channel,
			});
			const b = await puppeteer.launch(opts);
			console.log('[single] puppeteer.launch attempt=%s success', label);
			return b;
		} catch (err) {
			console.error(
				'[single] puppeteer.launch attempt=%s failed: %s',
				label,
				(err instanceof Error ? err.stack ?? err.message : String(err))
			);
			throw err;
		}
	};

	try {
		// 尝试 1：使用 executablePath（若提供）+ headless
		browser = await tryLaunch(puppeteerOptions, 'executablePath/headless');
	} catch (_e1) {
		try {
			// 尝试 2：使用系统 Chrome 通道
			const optsChrome: any = { ...puppeteerOptions };
			delete optsChrome.executablePath;
			optsChrome.channel = 'chrome';
			browser = await tryLaunch(optsChrome, 'channel=chrome');
		} catch (_e2) {
			// 尝试 3：使用系统 Chromium 通道
			const optsChromium: any = { ...puppeteerOptions };
			delete optsChromium.executablePath;
			optsChromium.channel = 'chromium';
			browser = await tryLaunch(optsChromium, 'channel=chromium');
		}
	}
});

void it('run single case', { timeout: 60000 }, async () => {
	const page = await browser.newPage();
	await page.setViewport({ width: 600, height: 600 });

	const errors: string[] = [];
	page.on('console', (msg) => {
		const type = msg.type();
		const text = msg.text();
		// Ignore warnings to avoid CI flakiness (e.g., Chrome parser-blocking/document.write notices)
		if (type === 'warn') {
			console.log(`[console.warn] ${text}`);
			return;
		}
		if (type === 'error') {
			errors.push(`[console.${type}] ${text}`);
		} else {
			console.log(`[console.${type}] ${text}`);
		}
	});
	page.on('pageerror', (error: Error) => errors.push(error.message));
	page.on('response', (response: HTTPResponse) => {
		if (!response.ok()) { errors.push(`Network error: ${response.url()} status=${response.status()}`); }
	});

	const testCaseCode = readFileSync(resolve(singleTestFile), { encoding: 'utf-8' });
	const pageContent = generatePageContent(testStandalonePath, testCaseCode);
	await page.setContent(pageContent, { waitUntil: 'load' });
	await page.evaluate(() => (window as unknown as InternalWindow).finishedSetup);
	await runInteractionsOnPage(page);
	await page.close();

	if (errors.length !== 0) {
		throw new Error(`Page has errors:\n${errors.join('\n')}`);
	}
	expect(errors.length).to.be.equal(0);
});

	after(async () => {
		await browser.close();
	});
});
