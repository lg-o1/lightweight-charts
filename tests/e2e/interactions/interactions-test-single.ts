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
// 强制使用 Puppeteer 内置浏览器（Chromium），不读取外部 Chrome 配置
// 不设置 executablePath / channel，避免依赖系统 Chrome

	let browser: Browser;

before(async () => {
	console.log('[single] TEST_STANDALONE_PATH=%s TEST_CASE_FILE=%s', testStandalonePath, singleTestFile);
	expect(testStandalonePath, `path to test standalone module must be passed via ${testStandalonePathEnvKey}`).to.have.length.greaterThan(0);
	expect(singleTestFile, 'TEST_CASE_FILE env is required').to.have.length.greaterThan(0);

	// 仅使用 Puppeteer 自带浏览器（Chromium）
	browser = await puppeteer.launch(puppeteerOptions);
});

void it('run single case', { timeout: 60000 }, async () => {
	const page = await browser.newPage();
	await page.setViewport({ width: 600, height: 600 });

	const errors: string[] = [];
	page.on('console', (msg) => {
		const type = msg.type();
		const text = msg.text();
		if (type === 'error' || type === 'warn') {
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
