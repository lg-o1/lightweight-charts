#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, access, readdir } from 'node:fs/promises';
import { watch } from 'node:fs';
import YAML from 'yaml';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const templatesDir = path.resolve(__dirname, 'templates');
const SUPPORTED_SCHEMA_VERSION = 1;
const FEATURE_FLAG_PREFIX = 'drawingTools';

const GENERATED_LOCATIONS = Object.freeze({
	tool: (tool, baseOutDir) => path.join(baseOutDir, 'src/drawing/tools/__generated__', `${tool}.ts`),
	runtime: (tool, baseOutDir) => path.join(baseOutDir, 'src/drawing/runtime/__generated__', `${tool}.ts`),
	test: (tool, baseOutDir) => path.join(baseOutDir, 'tests/unittests/drawing/__generated__', `${tool}.spec.ts`),
	doc: (tool, baseOutDir) => path.join(baseOutDir, 'docs/drawing-tools/__generated__', `${tool}.md`),
});

async function pathExists(candidate) {
	try {
		await access(candidate);
		return true;
	} catch {
		return false;
	}
}

// Recursively walk a directory (skipping any "__generated__" folders)
async function walkDir(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const results = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === '__generated__') {
				continue;
			}
			results.push(...await walkDir(full));
		} else {
			results.push(full);
		}
	}
	return results;
}

function ensureTrailingNewline(content) {
	const normalized = content.replace(/\r\n/g, '\n');
	return normalized.endsWith('\n') ? normalized : `${normalized}\n`;
}

function toPascalCase(value) {
	return value
		.toString()
		.replace(/[-_\s]+(.)?/g, (_, chr = '') => chr.toUpperCase())
		.replace(/^[a-z]/, (char) => char.toUpperCase())
		.replace(/[^0-9a-zA-Z]/g, '');
}

function toCamelCase(value) {
	const pascal = toPascalCase(value);
	return pascal.length === 0 ? pascal : pascal[0].toLowerCase() + pascal.slice(1);
}

function renderList(items, formatter, fallback = '- _None_') {
	if (!Array.isArray(items) || items.length === 0) {
		return fallback;
	}
	return items.map(formatter).join('\n');
}

async function renderTemplate(name, replacements) {
	const filePath = path.join(templatesDir, name);
	if (!(await pathExists(filePath))) {
		throw new Error(`Template "${name}" not found at ${filePath}`);
	}

	const raw = (await readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');

	// Collect unique placeholders
	const tokenMatches = raw.match(/{{(\w+)}}/g) || [];
	const tokens = Array.from(new Set(tokenMatches)).map((t) => t.slice(2, -2));

	// Ensure every placeholder has a replacement
	const missing = tokens.filter((key) => !Object.prototype.hasOwnProperty.call(replacements, key));
	if (missing.length > 0) {
		throw new Error(`Template "${name}" missing replacements for: ${missing.join(', ')}`);
	}

	const rendered = raw.replace(/{{(\w+)}}/g, (_match, key) => String(replacements[key]));

	// Safety: no unresolved placeholders should remain
	if (/{{\w+}}/.test(rendered)) {
		throw new Error(`Template "${name}" has unresolved placeholders.`);
	}

	return rendered;
}

async function loadSpec(tool, explicitPath) {
	const candidates = [];

	if (explicitPath) {
		candidates.push(path.resolve(projectRoot, explicitPath));
	} else {
		candidates.push(
			path.join(projectRoot, 'packages/specs', `${tool}.json`),
			path.join(projectRoot, 'packages/specs', `${tool}.yaml`),
			path.join(projectRoot, 'packages/specs', `${tool}.yml`)
		);
	}

	for (const candidate of candidates) {
		if (await pathExists(candidate)) {
			const raw = await readFile(candidate, 'utf8');
			const ext = path.extname(candidate).toLowerCase();
			const spec = ext === '.json' ? JSON.parse(raw) : YAML.parse(raw);
			return { spec, specPath: candidate };
		}
	}

	throw new Error(
		`Unable to locate spec for tool "${tool}". Checked:\n${candidates.map((c) => `  - ${c}`).join('\n')}`
	);
}

function validateSpec(spec) {
	const errors = [];

	if (!spec || typeof spec !== 'object') {
		errors.push('Spec should be an object.');
	// Additional checks (Wave1 readiness)
	// 1) featureFlag alignment with toolId
	try {
		if (typeof spec.featureFlag === 'string' && typeof spec.toolId === 'string') {
			const tid = spec.toolId.trim();
			if (!spec.featureFlag.endsWith(`.${tid}`)) {
				errors.push(`Field "featureFlag" should end with ".${tid}" to align with toolId.`);
			}
		}
	} catch {}

	// 2) options type/default checks (best-effort)
	if (Array.isArray(spec.options)) {
		for (let i = 0; i < spec.options.length; i++) {
			const opt = spec.options[i] ?? {};
			if (typeof opt.name !== 'string' || opt.name.trim() === '') {
				errors.push(`options[${i}].name must be a non-empty string.`);
			}
			if (typeof opt.type !== 'string' || opt.type.trim() === '') {
				errors.push(`options[${i}].type must be a non-empty string.`);
			}
			if (Object.prototype.hasOwnProperty.call(opt, 'default')) {
				const dv = opt.default;
				const t = opt.type;
				if (t === 'string' && typeof dv !== 'string') errors.push(`options[${i}].default should be string`);
				if ((t === 'number' || t === 'float' || t === 'integer') && typeof dv !== 'number') errors.push(`options[${i}].default should be number`);
				if (t === 'boolean' && typeof dv !== 'boolean') errors.push(`options[${i}].default should be boolean`);
				if (t === 'enum') {
					if (!Array.isArray(opt.values)) {
						errors.push(`options[${i}].values must be an array for enum type.`);
					} else if (!opt.values.includes(dv)) {
						errors.push(`options[${i}].default must be one of options[${i}].values for enum type.`);
					}
				}
				if (typeof dv === 'function') {
					errors.push(`options[${i}].default must be serializable (function is not allowed).`);
				}
			}
		}
	}
	if (spec.serializableOptions !== undefined) {
		if (!Array.isArray(spec.serializableOptions)) {
			errors.push('Field "serializableOptions" must be an array of option names when provided.');
		}
	}

	return errors;
}

	// toolId
	if (typeof spec.toolId !== 'string' || spec.toolId.trim() === '') {
		errors.push('Field "toolId" must be a non-empty string.');
	}

	// featureFlag
	const flag = spec.featureFlag;
	if (typeof flag !== 'string' || flag.trim() === '') {
		errors.push('Field "featureFlag" must be a non-empty string.');
	} else {
		if (!flag.startsWith(`${FEATURE_FLAG_PREFIX}.`)) {
			errors.push(`Field "featureFlag" must start with "${FEATURE_FLAG_PREFIX}."`);
		}
		if (!/^[a-zA-Z0-9_.-]+$/.test(flag)) {
			errors.push('Field "featureFlag" may only contain [a-zA-Z0-9_.-].');
		}
	}

	// schemaVersion (optional, but if present must match)
	if (Object.prototype.hasOwnProperty.call(spec, 'schemaVersion')) {
		const v = spec.schemaVersion;
		if (typeof v !== 'number') {
			errors.push('Field "schemaVersion" must be a number when provided.');
		} else if (v !== SUPPORTED_SCHEMA_VERSION) {
			errors.push(`Unsupported "schemaVersion": ${v} (supported: ${SUPPORTED_SCHEMA_VERSION}).`);
		}
	}

	// kind (optional)
	if (Object.prototype.hasOwnProperty.call(spec, 'kind')) {
		const k = spec.kind;
		if (typeof k !== 'string' || k.trim() === '') {
			errors.push('Field "kind" must be a non-empty string when provided.');
		} else {
			const allowedKinds = new Set(['pane-primitive', 'series-primitive', 'series-primitive-collection']);
			if (!allowedKinds.has(k)) {
				errors.push('Field "kind" must be one of "pane-primitive" | "series-primitive" | "series-primitive-collection" when provided.');
			}
		}
	}

	// anchors
	if (!Array.isArray(spec.anchors) || spec.anchors.length === 0) {
		errors.push('Field "anchors" must be a non-empty array.');
	} else {
		spec.anchors.forEach((a, i) => {
			if (!a || typeof a.id !== 'string' || a.id.trim() === '') {
				errors.push(`anchors[${i}].id must be a non-empty string.`);
			}
			if (typeof a.type !== 'string' || a.type.trim() === '') {
				errors.push(`anchors[${i}].type must be a non-empty string.`);
			}
		});
	}

	// states
	if (!Array.isArray(spec.states) || spec.states.length === 0) {
		errors.push('Field "states" must be a non-empty array.');
	} else {
		const seen = new Set();
		for (const s of spec.states) {
			if (typeof s !== 'string' || s.trim() === '') {
				errors.push('Field "states" must contain non-empty strings.');
				break;
			}
			if (seen.has(s)) {
				errors.push('Field "states" contains duplicate values.');
				break;
			}
			seen.add(s);
		}
	}

	// handles
	if (!Array.isArray(spec.handles)) {
		errors.push('Field "handles" must be an array (it can be empty).');
	} else {
		const ids = new Set();
		spec.handles.forEach((h, i) => {
			if (!h || typeof h !== 'object') {
				errors.push(`handles[${i}] must be an object.`);
				return;
			}
			if (typeof h.id === 'string' && h.id !== '') {
				if (ids.has(h.id)) {
					errors.push(`handles[${i}].id "${h.id}" is duplicated.`);
				} else {
					ids.add(h.id);
				}
			}
		});
	}

	// views
	if (spec.views === undefined || typeof spec.views !== 'object' || spec.views === null) {
		errors.push('Field "views" must be provided and must be an object.');
	} else {
		if (!Object.prototype.hasOwnProperty.call(spec.views, 'pane')) {
			errors.push('Field "views.pane" must be provided.');
		}
	}

	// serialization
	if (!spec.serialization || typeof spec.serialization !== 'object') {
		errors.push('Field "serialization" must be provided.');
	} else {
		if (Object.prototype.hasOwnProperty.call(spec.serialization, 'version') &&
			typeof spec.serialization.version !== 'number') {
			errors.push('Field "serialization.version" must be a number when provided.');
		}
	}

	return errors;
}

async function buildOutputs(spec, { tool, specRelativePath, baseOutDir }) {
	const outputs = new Map();

	// Helper: prefer kind-specific template if present, otherwise fallback to generic
	async function renderKindTemplate(name, kind, replacements) {
		try {
			if (typeof kind === 'string' && kind.trim() !== '') {
				const candidate = path.join(templatesDir, kind, name);
				if (await pathExists(candidate)) {
					return await renderTemplate(path.join(kind, name), replacements);
				}
			}
			return await renderTemplate(name, replacements);
		} catch (err) {
			if (err instanceof Error && /Template ".*" not found/.test(err.message)) {
				return await renderTemplate(name, replacements);
			}
			throw err;
		}
	}

	const toolId = typeof spec.toolId === 'string' && spec.toolId.trim() !== '' ? spec.toolId : tool;
	const pascalName = toPascalCase(toolId);
	const camelName = toCamelCase(toolId);

	const specConst = `${camelName}Spec`;
	const primitiveClassName = `${pascalName}DrawingPrimitive`;
	const toolClassName = `${pascalName}DrawingTool`;
	const runtimeContextFunc = `create${pascalName}RuntimeContext`;
    const pointerHelperFunc = `${camelName}HandlePointer`;

	const specJson = JSON.stringify(spec, null, 2);
	const initialStateExpression = `${specConst}.states?.[0] ?? 'idle'`;
	const states = Array.isArray(spec.states) ? spec.states : [];
	const handles = Array.isArray(spec.handles) ? spec.handles : [];
	const anchors = Array.isArray(spec.anchors) ? spec.anchors : [];
	const options = Array.isArray(spec.options) ? spec.options : [];
	const kind = typeof spec.kind === 'string' ? spec.kind : undefined;

	const stateRegistration =
		states.length > 0
			? states.map((state) => `\t\tmachine.registerState('${state}', {});`).join('\n')
			: '\t\t// TODO: register state handlers';

	const pointerHandlers = [
		'\tprotected handlePointerClick(_event: DrawingPointerEvent): void {}',
		'\tprotected handlePointerMove(_event: DrawingPointerEvent): void {}',
		'\tprotected handlePointerCancel(): void {}',
	].join('\n');

	const toolTemplate = await renderKindTemplate('tool.ts.tpl', kind, {
		SPEC_CONST: specConst,
		SPEC_JSON: specJson,
		FEATURE_FLAG: spec.featureFlag ?? '',
		INITIAL_STATE: initialStateExpression,
		STATE_REGISTRATION: stateRegistration,
		POINTER_HANDLERS: pointerHandlers,
		PRIMITIVE_CLASS: primitiveClassName,
		TOOL_CLASS: toolClassName,
	});

	outputs.set(GENERATED_LOCATIONS.tool(tool, baseOutDir), toolTemplate);

	const runtimeTemplate = await renderKindTemplate('runtime.ts.tpl', kind, {
		RUNTIME_CONTEXT_FUNC: runtimeContextFunc,
		POINTER_HELPER_FUNC: pointerHelperFunc,
		TOOL_ID: toolId,
	});

	outputs.set(GENERATED_LOCATIONS.runtime(tool, baseOutDir), runtimeTemplate);

	const specPathNormalized = specRelativePath.replace(/\\/g, '/');
	const specPathNoExt = specPathNormalized.replace(/\.(json|ya?ml)$/i, '');
	const docTemplate = await renderKindTemplate('doc.md.tpl', kind, {
		TOOL_ID: toolId,
		FEATURE_FLAG: spec.featureFlag ?? '',
		SPEC_PATH_NO_EXT: specPathNoExt,
		ANCHOR_LIST: renderList(
			anchors,
			(anchor) => `- \`${anchor?.id ?? 'id'}\` (${anchor?.type ?? 'unknown'})`,
			'- _None_'
		),
		HANDLE_LIST: renderList(
			handles,
			(handle) => {
				const cursor = handle?.cursor ? ` cursor=${handle.cursor}` : '';
				return `- \`${handle?.id ?? 'id'}\` (${handle?.type ?? 'custom'}${cursor})`;
			},
			'- _None_'
		),
		STATE_LIST: renderList(states, (state) => `- \`${state}\``),
		OPTION_LIST: renderList(
			options,
			(option) => {
				const defaultValue = Object.prototype.hasOwnProperty.call(option ?? {}, 'default')
					? ` default=${JSON.stringify(option.default)}`
					: '';
				return `- \`${option?.name ?? 'option'}\` (${option?.type ?? 'unknown'}${defaultValue})`;
			},
			'- _None_'
		),
	});

	outputs.set(GENERATED_LOCATIONS.doc(tool, baseOutDir), docTemplate);

	const testTemplate = await renderKindTemplate('test.spec.ts.tpl', kind, {
		SPEC_CONST: specConst,
		TOOL_FILE_NAME: tool,
		TOOL_ID: toolId,
		FEATURE_FLAG: spec.featureFlag ?? '',
	});

	outputs.set(GENERATED_LOCATIONS.test(tool, baseOutDir), testTemplate);

	return outputs;
}

async function applyOutputs(outputs, { check }) {
	const diffs = [];

	for (const [absPath, content] of outputs) {
		const normalized = ensureTrailingNewline(content);
		if (check) {
			let existing = null;
			try {
				existing = await readFile(absPath, 'utf8');
			} catch (err) {
				if (err && err.code === 'ENOENT') {
					diffs.push({ path: absPath, reason: 'missing' });
					continue;
				}
				throw err;
			}

			if (ensureTrailingNewline(existing) !== normalized) {
				diffs.push({ path: absPath, reason: 'changed' });
			}
		} else {
			await mkdir(path.dirname(absPath), { recursive: true });
			await writeFile(absPath, normalized, 'utf8');
			console.log(`  wrote ${path.relative(projectRoot, absPath)}`);
		}
	}

	if (check) {
		if (diffs.length > 0) {
			console.error('drawing-tools-generator: differences detected:');
			for (const diff of diffs) {
				console.error(`  ${path.relative(projectRoot, diff.path)} (${diff.reason})`);
			}
			process.exitCode = 1;
		} else {
			console.log('drawing-tools-generator: no changes required.');
		}
	} else {
		console.log(`drawing-tools-generator: generated ${outputs.size} file(s).`);
	}
}

async function runGenerateCommand(argv) {
	const toolFromArg = argv.tool ?? 'rectangle';
	const outDir = argv.outDir ? path.resolve(projectRoot, argv.outDir) : projectRoot;

	if (argv.watch && argv.check) {
		throw new Error('Watch mode cannot be used together with --check.');
	}

	const { spec, specPath } = await loadSpec(toolFromArg, argv.spec);
	const validationErrors = validateSpec(spec);
	if (validationErrors.length > 0) {
		const message = validationErrors.map((err) => `  - ${err}`).join('\n');
		throw new Error(`Spec validation failed:\n${message}`);
	}

	const tool = spec.toolId ?? toolFromArg;
	const specRelativePath = path.relative(projectRoot, specPath);

	const outputs = await buildOutputs(spec, { tool, specRelativePath, baseOutDir: outDir });
	await applyOutputs(outputs, { check: argv.check });

	if (argv.watch) {
		console.log('drawing-tools-generator: watch mode enabled. Press Ctrl+C to exit.');
		let timer = null;

		const trigger = () => {
			clearTimeout(timer);
			timer = setTimeout(async () => {
				try {
					const { spec: reloaded } = await loadSpec(toolFromArg, specPath);
					const newOutputs = await buildOutputs(reloaded, { tool, specRelativePath, baseOutDir: outDir });
					await applyOutputs(newOutputs, { check: false });
				} catch (err) {
					console.error(`drawing-tools-generator: ${err instanceof Error ? err.message : err}`);
				}
			}, 100);
		};

		watch(specPath, { persistent: true }, (_event, filename) => {
			if (filename) {
				console.log(`spec change detected -> regenerating (${filename})`);
			}
			trigger();
		});

		if (await pathExists(templatesDir)) {
			watch(templatesDir, { persistent: true }, (_event, filename) => {
				if (filename) {
					console.log(`template change detected -> regenerating (${filename})`);
				}
				trigger();
			});
		}

		return new Promise(() => {});
	}
}

 // Verify handwritten entries contain the "// @generated-entry" marker
 // And ensure production code (src) does NOT import from any "__generated__" paths.
async function runCheckEntriesCommand(argv) {
 const toolsDir = argv.toolsDir ? path.resolve(projectRoot, argv.toolsDir) : path.join(projectRoot, 'src/drawing/tools');

 // 1) Check entry markers in handwritten tool files (skip __generated__)
 let files = [];
 if (await pathExists(toolsDir)) {
 	files = (await walkDir(toolsDir))
 		.filter((f) => f.endsWith('.ts') && !f.includes(`${path.sep}__generated__${path.sep}`));
 } else {
 	console.log('drawing-tools-generator: check-entries skipped (no tools dir).');
 }

 const missing = [];
 for (const f of files) {
 	const content = (await readFile(f, 'utf8')).replace(/\r\n/g, '\n');
 	if (!content.includes('// @generated-entry')) {
 		missing.push(f);
 	}
 }

 // 2) Restricted imports in production src (forbid importing from "__generated__")
 const srcDir = path.join(projectRoot, 'src');
 const restricted = [];

 if (await pathExists(srcDir)) {
 	const srcFiles = (await walkDir(srcDir))
 		.filter((f) =>
 			(f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.mts')) &&
 			!f.includes(`${path.sep}__generated__${path.sep}`) &&
 			!f.includes(`${path.sep}tests${path.sep}`)
 		);

 	const reStatic = /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
 	const reDynamic = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

 	for (const f of srcFiles) {
 		const content = (await readFile(f, 'utf8')).replace(/\r\n/g, '\n');
 		const isToolsEntry = (f.startsWith(toolsDir + path.sep) || f.includes(`${path.sep}src${path.sep}drawing${path.sep}tools${path.sep}`));
 		const isMarkedEntry = content.includes('// @generated-entry');
 		let m;
 		while ((m = reStatic.exec(content)) !== null) {
 			const spec = m[1];
 			if (spec.includes('__generated__') && !(isToolsEntry && isMarkedEntry)) {
 				restricted.push({ file: f, spec });
 			}
 		}
 		while ((m = reDynamic.exec(content)) !== null) {
 			const spec = m[1];
 			if (spec.includes('__generated__') && !(isToolsEntry && isMarkedEntry)) {
 				restricted.push({ file: f, spec });
 			}
 		}
 	}
 } else {
 	console.log('drawing-tools-generator: restricted-imports skipped (no src dir).');
 }

 // 3) Report
 if (missing.length > 0 || restricted.length > 0) {
 	if (missing.length > 0) {
 		console.error('drawing-tools-generator: check-entries missing marker in:');
 		for (const f of missing) {
 			console.error(`  ${path.relative(projectRoot, f)}`);
 		}
 	}
 	if (restricted.length > 0) {
 		console.error('drawing-tools-generator: restricted-imports found in production code (imports from __generated__ are forbidden):');
 		for (const r of restricted) {
 			console.error(`  ${path.relative(projectRoot, r.file)} -> ${r.spec}`);
 		}
 	}
 	process.exitCode = 1;
 } else {
 	console.log('drawing-tools-generator: check-entries ok.');
 	console.log('drawing-tools-generator: restricted-imports ok.');
 }
}

// Verify all generated files for all specs are up-to-date
async function runCheckGeneratedCommand(argv) {
	const specsDir = argv.specsDir ? path.resolve(projectRoot, argv.specsDir) : path.join(projectRoot, 'packages/specs');
	const outDir = argv.outDir ? path.resolve(projectRoot, argv.outDir) : projectRoot;

	if (!(await pathExists(specsDir))) {
		console.log('drawing-tools-generator: check-generated skipped (no specs dir).');
		return;
	}
	const specFiles = (await walkDir(specsDir)).filter((f) => /\.(json|ya?ml)$/i.test(f));
	if (specFiles.length === 0) {
		console.log('drawing-tools-generator: check-generated skipped (no spec files).');
		return;
	}

	for (const specPathAbs of specFiles) {
		try {
			const { spec } = await loadSpec('ignored', specPathAbs);
			const tool = spec.toolId ?? path.basename(specPathAbs).replace(/\.(json|ya?ml)$/i, '');
			const specRelativePath = path.relative(projectRoot, specPathAbs);
			const outputs = await buildOutputs(spec, { tool, specRelativePath, baseOutDir: outDir });
			await applyOutputs(outputs, { check: true });
		} catch (err) {
			console.error(`drawing-tools-generator: check-generated failed for ${path.relative(projectRoot, specPathAbs)}: ${err instanceof Error ? err.message : err}`);
			process.exitCode = 1;
		}
	}
}

// Lint all specs with validateSpec and report errors per file
async function runLintSpecsCommand(argv) {
	const specsDir = argv.specsDir ? path.resolve(projectRoot, argv.specsDir) : path.join(projectRoot, 'packages/specs');
	if (!(await pathExists(specsDir))) {
		console.log('drawing-tools-generator: lint-specs skipped (no specs dir).');
		return;
	}
	const specFiles = (await walkDir(specsDir)).filter((f) => /\.(json|ya?ml)$/i.test(f));
	if (specFiles.length === 0) {
		console.log('drawing-tools-generator: lint-specs skipped (no spec files).');
		return;
	}
	let issues = 0;
	for (const specPathAbs of specFiles) {
		try {
			const { spec } = await loadSpec('ignored', specPathAbs);
			const validationErrors = validateSpec(spec);
			if (validationErrors.length > 0) {
				issues += validationErrors.length;
				console.error(`\n${path.relative(projectRoot, specPathAbs)}:`);
				for (const e of validationErrors) {
					console.error(`  - ${e}`);
				}
			}
		} catch (err) {
			issues++;
			console.error(`\n${path.relative(projectRoot, specPathAbs)}: failed to load/parse (${err instanceof Error ? err.message : err})`);
		}
	}
	if (issues > 0) {
		console.error(`\nlint-specs: found ${issues} issue(s).`);
		process.exitCode = 1;
	} else {
		console.log('lint-specs: all specs passed validation.');
	}
}

function main() {
	yargs(hideBin(process.argv))
		.command(
			'generate [tool]',
			'Generate drawing tool artifacts from a TDS spec.',
			(yargsBuilder) =>
				yargsBuilder
					.positional('tool', {
						describe: 'Tool identifier (defaults to rectangle)',
						type: 'string',
					})
					.option('spec', {
						alias: 's',
						describe: 'Relative path to spec file (JSON or YAML)',
						type: 'string',
					})
					.option('outDir', {
						alias: 'o',
						describe: 'Alternative output directory (defaults to project root)',
						type: 'string',
					})
					.option('check', {
						describe: 'Verify that generated files are up-to-date without writing them',
						type: 'boolean',
						default: false,
					})
					.option('watch', {
						alias: 'w',
						describe: 'Watch spec/templates and regenerate on change',
						type: 'boolean',
						default: false,
					}),
			async (argv) => {
				try {
					await runGenerateCommand(argv);
				} catch (err) {
					console.error(`drawing-tools-generator: ${err instanceof Error ? err.message : err}`);
					process.exitCode = 1;
				}
			}
		)
		.command(
			'check-entries',
			'Verify handwritten tool entry files contain the // @generated-entry marker.',
			(yargsBuilder) =>
				yargsBuilder.option('toolsDir', {
					describe: 'Tools directory (defaults to src/drawing/tools)',
					type: 'string',
				}),
			async (argv) => {
				try {
					await runCheckEntriesCommand(argv);
				} catch (err) {
					console.error(`drawing-tools-generator: ${err instanceof Error ? err.message : err}`);
					process.exitCode = 1;
				}
			}
		)
		.command(
			'check-generated',
			'Verify all generated files for all specs are up-to-date.',
			(yargsBuilder) =>
				yargsBuilder
					.option('specsDir', {
						describe: 'Specs directory (defaults to packages/specs)',
						type: 'string',
					})
					.option('outDir', {
						describe: 'Output directory (defaults to project root)',
						type: 'string',
					}),
			async (argv) => {
				try {
					await runCheckGeneratedCommand(argv);
				} catch (err) {
					console.error(`drawing-tools-generator: ${err instanceof Error ? err.message : err}`);
					process.exitCode = 1;
				}
			}
		)
		.command(
			'lint-specs',
			'Validate all drawing tool specs and report issues.',
			(yargsBuilder) =>
				yargsBuilder.option('specsDir', {
					describe: 'Specs directory (defaults to packages/specs)',
					type: 'string',
				}),
			async (argv) => {
				try {
					await runLintSpecsCommand(argv);
				} catch (err) {
					console.error(`drawing-tools-generator: ${err instanceof Error ? err.message : err}`);
					process.exitCode = 1;
				}
			}
		)
		.demandCommand(1, 'You need to specify a command, e.g. "generate".')
		.strict()
		.help()
		.parse();
}

const isCLI = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isCLI) {
	main();
}

export {
	pathExists,
	ensureTrailingNewline,
	toPascalCase,
	toCamelCase,
	renderList,
	renderTemplate,
	loadSpec,
	validateSpec,
	buildOutputs,
	applyOutputs,
	runGenerateCommand,
	runCheckEntriesCommand,
	runCheckGeneratedCommand,
	runLintSpecsCommand,
	main,
	GENERATED_LOCATIONS,
	SUPPORTED_SCHEMA_VERSION,
	FEATURE_FLAG_PREFIX,
	projectRoot,
	templatesDir,
};
