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

let sha = null;
if (process.argv.length > 4) {
  sha = process.argv[4];
}

let repoUrl = null;
if (process.argv.length > 5) {
  repoUrl = process.argv[5];
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
    if (sha != null && repoUrl != null) {
      console.log(
        '### [' + repoUrl + '/blob/' + sha + '/' + key + '](' + key + ')'
      );
    } else {
      console.log('### ' + key);
    }

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
      if (sha != null && repoUrl != null) {
        output +=
          '[' +
          repoUrl +
          '/blob/' +
          sha +
          '/' +
          key +
          '#L' +
          finding.line +
          '](' +
          finding.line +
          ') | ';
        output +=
          '[' +
          repoUrl +
          '/blob/' +
          sha +
          '/' +
          key +
          '#L' +
          finding.line +
          '](' +
          finding.reason +
          ') | ';
      } else {
        output += finding.line + ' | ';
        output += finding.reason;
      }
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
