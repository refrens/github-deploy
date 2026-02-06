# github-deploy

`github-deploy` is a simple, yet powerful command-line utility for creating deployments on GitHub.

[![npm version](https://badge.fury.io/js/github-deploy.svg)](https://badge.fury.io/js/github-deploy)

## Features

- **Easy Deployment**: Deploy to production environment on GitHub with a single command.
- **Target Environment**: Use the `-e` flag to specify an alternative deployment environment.
- **Version Tracking**: Automatically includes your project's version from `package.json` in the deployment payload.
- **Custom Payload**: Add arbitrary data to the deployment payload using JSON.
- **Dry-Run Mode**: Preview deployment requests without making actual API calls.
- **Verbose Output**: Control output detail with `-V`, `-VV`, or `-VVV` flags.
- **Simple Authentication**: Authenticate using the `GITHUB_TOKEN` environment variable.

## Prerequisites

Before using `github-deploy`, ensure that you have:

- Node.js installed on your machine.
- A GitHub account with a repository to deploy.
- A generated `GITHUB_TOKEN` with the required permissions set as an environment variable for authentication.

## Installation

Install `github-deploy` globally using npm to use it from anywhere on your system:

```sh
npm install -g github-deploy
```

Alternatively, you can use it directly without installing by using npx:

```sh
npx github-deploy
```

## Usage

### Basic Usage

By default, this will deploy to the production environment:

```sh
github-deploy
```

### Specify Environment

To deploy to a different environment, use the `-e` or `--environment` flag:

```sh
github-deploy -e staging
```

### Custom Payload

Add arbitrary data to the deployment payload using the `-p` or `--payload` flag with a JSON string:

```sh
github-deploy --payload '{"deployer":"john","buildNumber":123}'
```

The custom payload will be merged with the version from `package.json`. For example, if your version is `1.0.0` and you pass the above payload, the final payload will be:

```json
{
  "version": "1.0.0",
  "deployer": "john",
  "buildNumber": 123
}
```

### Dry-Run Mode

Preview what would be sent to the GitHub API without actually making the request:

```sh
github-deploy --dry-run
```

This is useful for testing and debugging your deployment configuration.

### Verbose Output

Control the amount of output detail using the `-V` flag. You can stack it for more verbosity:

- **No flag (default)**: Minimal output - just deployment ID and URL

```sh
github-deploy
# ✅ Deployment created: 123456789
# URL: https://api.github.com/repos/owner/repo/deployments/123456789
```

- **`-V`**: Basic deployment information

```sh
github-deploy -V
# Shows: ID, URL, State, Created at
```

- **`-VV`**: Detailed JSON output

```sh
github-deploy -VV
# Shows formatted JSON with deployment details
```

- **`-VVV`**: Full API response

```sh
github-deploy -VVV
# Shows complete response from GitHub API
```

### Combining Options

You can combine multiple options:

```sh
github-deploy -e staging --dry-run -VV --payload '{"region":"us-east-1"}'
```

## Setting Up Authentication

For github-deploy to authenticate with GitHub, you must provide a GITHUB_TOKEN environment variable. Follow these steps to set it up:

- Generate a new personal access token (PAT) on GitHub with the necessary permissions for creating deployments.
- Set the GITHUB_TOKEN environment variable on your machine. How you set this variable depends on your operating system and shell. For example, in a Unix-like environment, you can add the following line to your .bashrc, .zshrc, or equivalent:

```sh
export GITHUB_TOKEN="your_token_here"
```

## Contributing

Contributions to github-deploy are welcome! Whether it's reporting a bug, discussing improvements, or submitting a pull request, all contributions are appreciated.
