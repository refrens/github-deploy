# github-deploy

`github-deploy` is a simple, yet powerful command-line utility for creating deployments on GitHub.

[![npm version](https://badge.fury.io/js/github-deploy.svg)](https://badge.fury.io/js/github-deploy)

## Features

- **Easy Deployment**: Deploy to production environment on GitHub with a single command.
- **Target Environment**: Use the `-e` flag to specify an alternative deployment environment.
- **Version Tracking**: Automatically includes your project's version from `package.json` in the deployment payload.
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
By default, this will deploy to the production environment. To deploy to a different environment, use the -e or --environment flag followed by the name of your target environment:
```sh
github-deploy -e staging
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
