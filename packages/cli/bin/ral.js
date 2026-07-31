#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { validateSession } from '../../spec/src/index.js';
import { evaluateSession, benchmarkSessions } from '../../evaluator/src/index.js';
import { redactObject } from '../../security/src/index.js';

const rawArgs = process.argv.slice(2);
const command = rawArgs.shift();

function parseArgs(args) {
  const options = {};
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value.startsWith('--')) {
      const key = value.slice(2);
      const next = args[index + 1];
      if (next !== undefined && !next.startsWith('--')) {
        options[key] = next;
        index += 1;
      } else {
        options[key] = true;
      }
    } else {
      positional.push(value);
    }
  }
  return { options, positional };
}

const { options, positional } = parseArgs(rawArgs);
const load = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, data) => {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};

function printReport(report) {
  console.log(`Score: ${report.score}/100 (${report.grade})`);
  console.log(`Latency p95: ${report.metrics.latency.p95 ?? 'n/a'}ms`);
  console.log(`Interruption recovery: ${report.metrics.interruption.score}%`);
  console.log(`Tool success: ${report.metrics.tools.score}%`);
  console.log(`Consent compliance: ${report.metrics.consent.score}%`);
  console.log(`Privacy score: ${report.metrics.privacy.score}%`);
  if (report.findings.length) {
    console.log('Findings:');
    report.findings.forEach(finding => console.log(`- [${finding.severity}] ${finding.code}: ${finding.message}`));
  }
}

async function main() {
  if (!command || ['help', '--help', '-h'].includes(command)) {
    console.log('ral <validate|evaluate|benchmark|compare|redact|init> ...');
    return;
  }

  if (command === 'validate') {
    const [file] = positional;
    if (!file) throw new Error('Usage: ral validate <session.json>');
    const result = validateSession(load(file));
    if (!result.valid) {
      result.errors.forEach(error => console.error(`- ${error}`));
      process.exitCode = 1;
    } else {
      console.log('Valid RAL Session Spec 1.0 document.');
    }
    return;
  }

  if (command === 'evaluate') {
    const [file] = positional;
    if (!file) throw new Error('Usage: ral evaluate <session.json>');
    const threshold = Number(options['fail-under'] ?? 0);
    const report = evaluateSession(load(file), { failUnder: threshold });
    if (options.output) save(options.output, report);
    printReport(report);
    if (!report.passed) process.exitCode = 1;
    return;
  }

  if (command === 'benchmark') {
    const [directory] = positional;
    if (!directory) throw new Error('Usage: ral benchmark <fixtures-dir>');
    const threshold = Number(options['fail-under'] ?? 0);
    const files = fs.readdirSync(directory).filter(file => file.endsWith('.json')).sort();
    const sessions = files.map(file => load(path.join(directory, file)));
    const report = benchmarkSessions(sessions, { failUnder: threshold });
    if (options.output) save(options.output, report);
    console.log(`Sessions: ${report.summary.sessions}`);
    console.log(`Average score: ${report.summary.averageScore}`);
    console.log(`Passed: ${report.summary.passed}; Failed: ${report.summary.failed}`);
    if (report.summary.failed) process.exitCode = 1;
    return;
  }

  if (command === 'compare') {
    const [baselineFile, candidateFile] = positional;
    if (!baselineFile || !candidateFile) throw new Error('Usage: ral compare <baseline-report.json> <candidate-report.json>');
    const baseline = load(baselineFile);
    const candidate = load(candidateFile);
    const delta = Math.round((candidate.score - baseline.score) * 100) / 100;
    console.log(`Baseline: ${baseline.score}`);
    console.log(`Candidate: ${candidate.score}`);
    console.log(`Delta: ${delta >= 0 ? '+' : ''}${delta}`);
    if (delta < 0) process.exitCode = 1;
    return;
  }

  if (command === 'redact') {
    const [file] = positional;
    if (!file) throw new Error('Usage: ral redact <session.json> --output safe.json');
    const output = options.output || file.replace(/\.json$/, '-redacted.json');
    save(output, redactObject(load(file)));
    console.log(`Wrote ${output}`);
    return;
  }

  if (command === 'init') {
    const [file = 'session.json'] = positional;
    const template = {
      specVersion: '1.0',
      id: 'example-session',
      language: 'en-US',
      startedAt: new Date().toISOString(),
      events: [{ at: 0, type: 'consent.granted' }]
    };
    save(file, template);
    console.log(`Wrote ${file}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch(error => {
  console.error(`ral: ${error.message}`);
  process.exitCode = 1;
});
