#!/usr/bin/env node

const { readFileSync, existsSync } = require("fs");
const { exec } = require("child_process");
const { program } = require("commander");

const { Octokit } = require("@octokit/core");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function sh(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error);
      }
      resolve(stdout.trim());
    });
  });
}

program
  .option("-e, --environment <environment>", "Deployment environment")
  .action(async (options) => {
    const branch = await sh("git rev-parse --abbrev-ref HEAD");
    const origin = await sh("git remote get-url origin");
    let [base, parent] = origin.split("/").reverse();
    base = base.replace(/\.git$/, "");
    parent = parent.split(":").pop();
    const {
      environment = "production",
      ref = branch,
      owner = parent,
      repo = base,
    } = options;
    let version;
    if (existsSync("package.json")) {
      const pkg = JSON.parse(readFileSync("package.json") || "{}");
      ({ version } = pkg || {});
    }

    console.log({ owner, repo, ref, environment, version });
    const resp = await octokit.request(
      "POST /repos/{owner}/{repo}/deployments",
      {
        owner,
        repo,
        ref,
        auto_merge: false,
        required_contexts: [],
        environment,
        description: `Deploy request for ref:${ref} on ${environment}`,
        payload: { version },
      }
    );
    console.log(resp);
    process.exit();
  });
program.parse(process.argv);
