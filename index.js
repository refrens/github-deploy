#!/usr/bin/env node

/**
 * GitHub Deployment CLI Tool
 * Creates GitHub deployments via the API with support for custom payloads,
 * dry-run mode, and configurable verbosity levels.
 */

const { readFileSync, existsSync } = require("fs");
const { exec } = require("child_process");
const { program } = require("commander");

const { Octokit } = require("@octokit/core");

// Initialize Octokit with GitHub token from environment
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

/**
 * Callback function for commander to count verbose flags.
 * Each -V flag adds 1 to the verbosity level.
 * @param {string} v - The flag value
 * @param {number} total - The current total count
 * @return {number} The incremented count
 */
function increaseVerbosity(v, total) {
  return total + 1;
}

// Configure CLI options
program
  .option("-e, --environment <environment>", "Deployment environment")
  .option(
    "-d, --dry-run",
    "Dry run mode - log payload without making API request",
  )
  .option("-p, --payload <json>", "Additional payload data as JSON string")
  .option(
    "-V, --verbose",
    "Verbose output (-V, -VV, -VVV for increasing verbosity)",
    increaseVerbosity,
    0,
  )
  .action(async (options) => {
    // Get current git branch and remote origin URL
    const branch = await sh("git rev-parse --abbrev-ref HEAD");
    const origin = await sh("git remote get-url origin");

    // Parse repository owner and name from git remote URL
    // Handles both HTTPS and SSH URLs (e.g., git@github.com:owner/repo.git)
    let [base, parent] = origin.split("/").reverse();
    base = base.replace(/\.git$/, ""); // Remove .git extension
    parent = parent.split(":").pop(); // Extract owner from SSH format
    // Extract and set defaults for CLI options
    const {
      environment = "production", // Default to production environment
      ref = branch, // Default to current branch
      owner = parent, // Default to parsed owner from git remote
      repo = base, // Default to parsed repo name from git remote
      dryRun = false,
      payload: customPayload,
      verbose = 0,
    } = options;
    // Read version from package.json if it exists
    let version;
    if (existsSync("package.json")) {
      const pkg = JSON.parse(readFileSync("package.json") || "{}");
      ({ version } = pkg || {});
    }

    // Parse custom payload if provided
    let additionalPayload = {};
    if (customPayload) {
      try {
        additionalPayload = JSON.parse(customPayload);
      } catch (error) {
        console.error("Error parsing custom payload JSON:", error.message);
        process.exit(1);
      }
    }

    // Merge version and custom payload
    // Custom payload fields will override version if a version key is provided
    const payload = { version, ...additionalPayload };

    // Construct the GitHub API request data
    const requestData = {
      owner,
      repo,
      ref,
      auto_merge: false, // Don't auto-merge default branch into ref
      required_contexts: [], // No required CI/CD checks
      environment,
      description: `Deploy request for ref:${ref} on ${environment}`,
      payload,
    };

    // Show deployment parameters if verbose mode is enabled
    if (verbose > 0) {
      console.log({ owner, repo, ref, environment, payload });
    }

    // Dry-run mode: display what would be sent without making the API call
    if (dryRun) {
      console.log("\n🏃 DRY RUN MODE - No API request will be made");
      console.log("\nRequest that would be sent:");
      console.log(JSON.stringify(requestData, null, 2));
      console.log("\nAPI endpoint:");
      console.log(`POST /repos/${owner}/${repo}/deployments`);
      process.exit(0);
    }

    // Create the deployment via GitHub API
    const resp = await octokit.request(
      "POST /repos/{owner}/{repo}/deployments",
      requestData,
    );

    // Handle output based on verbosity level
    if (verbose === 0) {
      // No verbose flag: just deployment ID and URL
      console.log(`✅ Deployment created: ${resp.data.id}`);
      console.log(`URL: ${resp.data.url}`);
    } else if (verbose === 1) {
      // -V: Basic deployment info
      console.log(`✅ Deployment created`);
      console.log(`ID: ${resp.data.id}`);
      console.log(`URL: ${resp.data.url}`);
      console.log(`State: ${resp.data.state}`);
      console.log(`Created at: ${resp.data.created_at}`);
    } else if (verbose === 2) {
      // -VV: More detailed info
      console.log(`✅ Deployment created`);
      console.log(
        JSON.stringify(
          {
            id: resp.data.id,
            url: resp.data.url,
            state: resp.data.state,
            environment: resp.data.environment,
            ref: resp.data.ref,
            sha: resp.data.sha,
            creator: resp.data.creator?.login,
            created_at: resp.data.created_at,
            updated_at: resp.data.updated_at,
            payload: resp.data.payload,
          },
          null,
          2,
        ),
      );
    } else {
      // -VVV or more: Full response
      console.log(`✅ Deployment created`);
      console.log(JSON.stringify(resp, null, 2));
    }

    process.exit();
  });
program.parse(process.argv);
