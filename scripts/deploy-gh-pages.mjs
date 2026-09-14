#!/usr/bin/env node
/**
 * deploy-gh-pages.mjs
 * Deploy the built site to GitHub Pages.
 *
 * Prerequisites:
 *   - gh CLI installed and authenticated (gh auth login)
 *   - Or use git push subtree manually
 *
 * Usage:
 *   npm run deploy
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

const BUILD_DIR = 'build';
const DEPLOY_BRANCH = 'gh-pages';

console.log('🚀 Deploying faakt.io to GitHub Pages...\n');

// Step 1: Check build exists
if (!fs.existsSync(BUILD_DIR)) {
	console.error(`❌ Build directory "${BUILD_DIR}" not found. Run "npm run build" first.`);
	process.exit(1);
}

// Step 2: Check if gh CLI is available
let hasGh = false;
try {
	execSync('gh --version', { stdio: 'pipe' });
	hasGh = true;
} catch {
	console.log('ℹ️  gh CLI not found. Falling back to git subtree.\n');
}

if (hasGh) {
	// Use gh-pages via gh CLI if available (simpler)
	try {
		// Create a gh-pages branch or use existing
		const branches = execSync('git branch --list', { encoding: 'utf-8' });
		if (!branches.includes(DEPLOY_BRANCH)) {
			console.log(`   Creating ${DEPLOY_BRANCH} branch...`);
			execSync(`git checkout --orphan ${DEPLOY_BRANCH}`, { stdio: 'pipe' });
			execSync('git rm -rf .', { stdio: 'pipe' });
			// Copy build contents to root
			execSync(`cp -r ${BUILD_DIR}/* .`, { stdio: 'pipe' });
			execSync(`cp ${BUILD_DIR}/. . -r`, { stdio: 'pipe' });
			execSync('git add .', { stdio: 'pipe' });
			execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'pipe' });
			execSync(`git push origin ${DEPLOY_BRANCH}`, { stdio: 'pipe' });
			execSync('git checkout main', { stdio: 'pipe' });
		} else {
			// Use gh to deploy
			execSync(`npx gh-pages --dist ${BUILD_DIR} --dotfiles`, { stdio: 'pipe' });
		}
		console.log(`✅ Deployed to ${DEPLOY_BRANCH} branch.`);
		console.log('   Go to: https://lukas.github.io/thak.io/');
	} catch (err) {
		console.error('❌ Deploy failed:', err.message);
		console.log('\nTry manually:');
		console.log(`  npx gh-pages --dist ${BUILD_DIR} --dotfiles`);
		process.exit(1);
	}
} else {
	// Manual approach
	try {
		execSync(`npx gh-pages --dist ${BUILD_DIR} --dotfiles`, { stdio: 'pipe' });
		console.log(`✅ Deployed to ${DEPLOY_BRANCH} branch.`);
		console.log('   Your site will be available at GitHub Pages.');
	} catch (err) {
		console.error('❌ Deploy failed:', err.message);
		console.log('\nInstall gh-pages: npm install --save-dev gh-pages');
		console.log(`Then run: npx gh-pages --dist ${BUILD_DIR} --dotfiles`);
		process.exit(1);
	}
}