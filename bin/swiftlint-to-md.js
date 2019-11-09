#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const input = process.argv.length > 2 ? process.argv[2] : null;
if (input == null) {
  console.log('No input file specified');
  process.exit(1);
}

const rootPrefix = path.dirname(path.resolve(input));
const lintResults = JSON.parse(fs.readFileSync(input));

let output = 'summary';
if (process.argv.length > 3) {
  output = process.argv[3];
}

if (output === 'text') {
  outputText();
} else {
  outputSummary();
}

function outputText() {
  let files = {};
  lintResults.forEach(function(finding) {
    const fileName = finding.file.replace(rootPrefix + '/', '');
    if (files[fileName] == null) {
      files[fileName] = {
        findings: [finding]
      };
    } else {
      files[fileName].findings.push(finding);
    }
  });

  Object.keys(files).forEach(function(key) {
    console.log('### ' + key);
    console.log(' ');
    console.log('Finding | Line | Description ');
    console.log('------- | ---- | ------------');

    files[key].findings.forEach(function(finding) {
      let output = '';
      if (finding.severity === 'Warning') {
        output += ':warning: ';
      } else {
        output += ':rotating_light: ';
      }
      output += finding.rule_id + ' | ';
      output += finding.line + ' | ';
      output += finding.reason;
      console.log(output);
    });
    console.log(' ');
  });
}

function outputSummary() {
  let warnings = 0;
  let errors = 0;
  lintResults.forEach(function(finding) {
    if (finding.severity === 'Warning') {
      warnings += 1;
    } else {
      errors += 1;
    }
  });

  console.log('### SwiftLint Summary:');
  console.log(' ');
  console.log('- :warning: ' + warnings.toString() + ' Warning(s)');
  console.log('- :rotating_light: ' + errors.toString() + ' Error(s)');
}
