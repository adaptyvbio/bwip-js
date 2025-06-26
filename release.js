#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Helper functions
const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

const exec = (cmd, options = {}) => {
  try {
    return execSync(cmd, { encoding: 'utf8', ...options });
  } catch (error) {
    throw new Error(`Command failed: ${cmd}\n${error.message}`);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major, or specific version

// Validate version type
const validTypes = ['patch', 'minor', 'major'];
const isValidType = validTypes.includes(versionType) || /^\d+\.\d+\.\d+/.test(versionType);

if (!isValidType) {
  log.error(`Invalid version type: ${versionType}`);
  console.log('\nUsage:');
  console.log('  node release.js [patch|minor|major|x.y.z]');
  console.log('\nExamples:');
  console.log('  node release.js           # Bumps patch version (default)');
  console.log('  node release.js patch     # Bumps patch version: 1.0.0 -> 1.0.1');
  console.log('  node release.js minor     # Bumps minor version: 1.0.0 -> 1.1.0');
  console.log('  node release.js major     # Bumps major version: 1.0.0 -> 2.0.0');
  console.log('  node release.js 1.2.3     # Sets specific version');
  process.exit(1);
}

async function release() {
  try {
    // Check if working directory is clean
    log.info('Checking git status...');
    const status = exec('git status --porcelain');
    if (status.trim()) {
      log.error('Working directory is not clean. Please commit or stash your changes.');
      console.log('\nUncommitted changes:');
      console.log(status);
      process.exit(1);
    }
    log.success('Working directory is clean');

    // Get current version
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentVersion = packageJson.version;
    log.info(`Current version: ${currentVersion}`);

    // Update version in package.json
    log.info(`Bumping version (${versionType})...`);
    const newVersion = exec(`npm version ${versionType} --no-git-tag-version`).trim();
    log.success(`New version: ${newVersion}`);

    // Update version in source files
    log.info('Updating version in source files...');
    const exportsPath = path.join('src', 'exports.js');
    if (fs.existsSync(exportsPath)) {
      let exportsContent = fs.readFileSync(exportsPath, 'utf8');
      const date = new Date().toISOString().split('T')[0];
      exportsContent = exportsContent.replace(
        /const BWIPJS_VERSION = '[^']+'/,
        `const BWIPJS_VERSION = '${newVersion} (${date})'`
      );
      fs.writeFileSync(exportsPath, exportsContent);
      log.success('Updated src/exports.js');
    }

    // Update version in build script
    const buildScriptPath = 'build-with-bun.js';
    if (fs.existsSync(buildScriptPath)) {
      let buildContent = fs.readFileSync(buildScriptPath, 'utf8');
      const date = new Date().toISOString().split('T')[0];
      buildContent = buildContent.replace(
        /content\.replace\(\/__BWIPJS_VERS__\/g, '[^']+'\)/,
        `content.replace(/__BWIPJS_VERS__/g, '${newVersion} (${date})')`
      );
      fs.writeFileSync(buildScriptPath, buildContent);
      log.success('Updated build-with-bun.js');
    }

    // Build the project
    log.info('Building project...');
    exec('bun run build');
    log.success('Build completed');

    // Run tests
    log.info('Running tests...');
    exec('npm test');
    log.success('Tests passed');

    // Create git commit
    log.info('Creating git commit...');
    exec('git add -A');
    exec(`git commit -m "Release version ${newVersion}"`);
    log.success(`Created commit for version ${newVersion}`);

    // Create git tag
    log.info('Creating git tag...');
    exec(`git tag -a v${newVersion} -m "Version ${newVersion}"`);
    log.success(`Created tag v${newVersion}`);

    // Push to remote
    log.info('Pushing to remote...');
    exec('git push');
    exec('git push --tags');
    log.success('Pushed commits and tags to remote');

    console.log(`\n${colors.green}🎉 Release ${newVersion} completed successfully!${colors.reset}`);
    console.log('\nNext steps:');
    console.log('1. The GitHub Action will automatically publish to npm');
    console.log('2. Or manually trigger the workflow from GitHub Actions');
    console.log(`3. Create a GitHub release for tag v${newVersion} to trigger automatic publishing`);

  } catch (error) {
    log.error(`Release failed: ${error.message}`);
    
    // Try to clean up if something went wrong after version bump
    try {
      log.warn('Attempting to reset changes...');
      exec('git reset --hard HEAD');
      log.success('Reset completed');
    } catch (resetError) {
      log.error('Failed to reset changes');
    }
    
    process.exit(1);
  }
}

// Run the release
release();