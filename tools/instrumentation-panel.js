'use strict';

const inquirer = require('inquirer');
const request = require('request-promise-native');

async function main() {
  const endpoints = await request( {
    url: 'http://unix:/tmp/instrumentation.sock:/',
    method: 'get',
    json: true,
  } );
  const choices = [];
  for (let endpoint of endpoints) {
    const separator = new inquirer.Separator(endpoint.path);
    choices.push(separator);
    for (let instrumentation of endpoint.instrumentations) {
      choices.push({
        name: instrumentation,
        value: { path: endpoint.path, instrumentation: instrumentation },
        checked: endpoint.instrumented.includes(instrumentation),
      });
    }
  }

  const answers = await inquirer.prompt([
    {name: "endpoints", message: "Endpoints", choices: choices, type: "checkbox", pageSize: 20},
  ]);

  const payload = {};
  for (let answer of answers.endpoints) {
    const instrumentations = payload[answer.path] || [];
    instrumentations.push(answer.instrumentation);
    payload[answer.path] = instrumentations;
  }
  await request( {
    url: 'http://unix:/tmp/instrumentation.sock:/',
    method: 'post',
    json: true,
    body: payload,
  } )
}

main();
