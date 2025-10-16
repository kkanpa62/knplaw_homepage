#!/usr/bin/env node
/**
 * Simple health check script used by `npm test` to ensure the exported site
 * keeps its critical redirect and stays free from unwanted Windows stream
 * sidecar files (e.g. `:Zone.Identifier`).
 */
const fs = require('fs');
const path = require('path');

/**
 * Collects errors instead of throwing immediately so that we can report all
 * detected issues in a single run.
 */
const problems = [];

// Validate that the root index.html exists and contains the redirect logic.
const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');

try {
	// Read the root index file once; reuse its contents for multiple checks.
	const indexHtml = fs.readFileSync(indexPath, 'utf8');

	if (!indexHtml.trim()) {
		problems.push('index.html is empty; the root should redirect to /language/ko/.');
	}

	const hasMetaRefreshRedirect =
		/<meta\s+http-equiv=["']refresh["']\s+content=["'][^"']*url=\/language\/ko\/?/i.test(indexHtml) ||
		/<meta\s+http-equiv=["']refresh["']\s+content=["'][^"']*url=language\/ko\/?/i.test(indexHtml);
	if (!hasMetaRefreshRedirect) {
		problems.push('index.html is missing the meta refresh redirect to language/ko/.');
	}

	const hasJsRedirect =
		/window\.location\.replace\(['"]\/language\/ko\/?['"]\)/.test(indexHtml) ||
		/window\.location\.replace\(['"]language\/ko\/?['"]\)/.test(indexHtml);
	if (!hasJsRedirect) {
		problems.push('index.html is missing the JavaScript redirect fallback for language/ko/.');
	}
} catch (error) {
	problems.push(`Failed to read index.html: ${error.message}`);
}

/**
 * Recursively scan the project tree to ensure we do not commit Windows
 * alternate data stream artifacts (files containing `:` such as
 * `:Zone.Identifier`) that break static hosting setups on Linux.
 */
const scanForForbiddenNames = (dirPath) => {
	for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
		const entryPath = path.join(dirPath, entry.name);

		if (entry.name.includes(':')) {
			problems.push(`Remove Windows ADS artifact: ${path.relative(rootDir, entryPath)}`);
		}

		if (entry.isDirectory()) {
			scanForForbiddenNames(entryPath);
		}
	}
};

scanForForbiddenNames(rootDir);

if (problems.length) {
	console.error('Static validation failed:\n');
	for (const issue of problems) {
		console.error(`- ${issue}`);
	}
	process.exitCode = 1;
} else {
	console.log('Static validation passed ✅');
}
