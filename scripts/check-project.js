#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const required = [
    'README.md',
    'LICENSE',
    'NOTICE',
    'SECURITY.md',
    'CONTRIBUTING.md',
    'ACCEPTABLE_USE.md',
    'ROADMAP.md',
    'src/utils/evaluation.js',
    'src/utils/consent.js',
    'src/utils/providerRegistry.js',
];

const missing = required.filter(relative => !fs.existsSync(path.join(process.cwd(), relative)));
if (missing.length) {
    console.error(`Missing required project files:\n${missing.join('\n')}`);
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
if (packageJson.name !== 'realtime-agent-lab') {
    console.error('Unexpected package name');
    process.exit(1);
}
if (!String(packageJson.license).startsWith('GPL-3.0')) {
    console.error('GPL license metadata must be preserved');
    process.exit(1);
}

console.log('Project checks passed.');
