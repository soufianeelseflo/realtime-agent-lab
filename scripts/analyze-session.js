#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { evaluateSession } = require('../src/utils/evaluation');

const inputPath = process.argv[2];
if (!inputPath) {
    console.error('Usage: node scripts/analyze-session.js <session.json>');
    process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), inputPath);
let parsed;
try {
    parsed = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
} catch (error) {
    console.error(`Unable to read session: ${error.message}`);
    process.exit(1);
}

const events = Array.isArray(parsed) ? parsed : parsed.events;
const report = evaluateSession(events);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
