# Cloudflare Workers - Enhanced Development Experience

This is a fork of the [blue / green deployments for Cloudflare Workers](https://github.com/peasey/cloudflare-workers-blue-green-poc) repo.

This repo contains a minimal example from a proof of concept to enhance the local development experience for Cloudflare Workers. The principles of substitutable dependencies and execution context are implemented to enable Node.js and VS Code to be used for local development, testing and debugging. The Serverless Framework plugin in this repo is extended to create "logical environments" that enable side by side deployment use cases such as multiple developers working in the same account, or CI/CD processes deploying ephemeral resources.

There is an [accompanying blog post](https://blog.peasey.co.uk/blog/enhancing-the-development-experience-for-cloudflare-workers) for this repo.

## Configuration

The configuration is handled by `dotenv` so the first thing you need to do is add a .env file to the root of the repo with the following environment variables:

| Variable              | Comment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLOUDFLARE_ACCOUNT_ID | This should be set to your Cloudflare **Account ID** and can be found in the _Overview_ page under the _API_ section in the Cloudflare dashboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CLOUDFLARE_ZONE_ID    | This should be set to your Cloudflare **Zone ID** and can be found in the _Overview_ page under the _API_ section in the Cloudflare dashboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CLOUDFLARE_AUTH_KEY   | This should be set to your API key which you can find in the Cloudflare dashboard under the _API_ section and then _Get your API token_ -> _API tokens_ tab -> _Global API Key_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CLOUDFLARE_AUTH_EMAIL | This should be set to the email address you use to sign into your Cloudflare account.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| HOST                  | This should be set to the API host you want to use in your routes, i.e. api.somewhere.com.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ENVIRONMENT           | This should be set to the logical environment you are deploying to in the physical account. It defaults to 'prod', and when the environment is 'prod', it deploys the route at the root of the host (above), i.e. api.somewhere.com/my/route*. When you specify an environment other than 'prod', the routes are deployed using the environment as a suffix on the host and prefix to the route, i.e. api.somewhere.com/env/my/route*. This is useful if you want multiple logical environments in a single account, i.e. many developers working in a development account (api.devsite.com/alex/my/route*) or for deploying PRs as part of CI/CD processes etc (api.devsite.com/pr32/my/route*). |

<br>

> Note: You need to ensure you have the required DNS records and TLS certs configured. For example, if your HOST is api.somewhere.com, you need the following DNS A records for the _somewhere.com_ domain to support api.somewhere.com, blue.api.somewhere.com and green.api.somewhere.com, your TLS cert should also have those domains as alternative names, or be a wildcard cert.

## Installation

```bash
> npm install
```

## Running

I've created some npm scripts to simplify the commands when wrapped with configuration. Replace _somewhere.com_ with the host you configured in the **.env** file below:

### Initial deploy to the default slot (blue):

```bash
> npm run deploy
> curl https://blue-api.somewhere.com/account
> "Processing account resource from blue slot..."
```

### Activate the blue slot:

```bash
> npm run activate-slot:blue
> curl https://api.somewhere.com/account
> "Processing account resource from blue slot..."
```

> Note: you cold also just run `npm run rotate` above to activate the slot.

### Deploy to the other slot (green):

```bash
> npm run deploy
> curl https://green-api.somewhere.com/account
> "Processing account resource from green slot..."
```

### Rotate to the other slot:

```bash
> npm run rotate
> curl https://api.somewhere.com/account
> "Processing account resource from green slot..."
```

### Remove all slots/workers:

```bash
> npm run remove
```

## Local development, debugging and testing

An approach to local development, debugging and testing is discussed here:

https://blog.peasey.co.uk/blog/enhancing-the-development-experience-for-cloudflare-workers

### Entry point

We don't use the Cloudflare entry point script as it's non-trivial to hook into and modify the execution context, so instead we reduce what we do in the Cloudflare entry point script to simply loading our resource and responding with the resource response. This way we can use the resource (i.e. [src/resources/account.js](./src/resources/account.js)) as our entry point for local development, debugging and testing.

### Test scripts

Corresponding test scripts can be created in the [testing](./testing) directory for the resources, each script can use the [runner](testing/runner.js) to create an event payload and run the resource as shown in the [account](./testing/resources/account.js) example.

You could have multiple scripts for each resource that test different scenarios.

### Debugging in VS Code

The [launch.json](./.vscode/launch.json) file in the .vscode directory has a configuration named **Debug resource**. This configuration enables you to hit F5 while you have a test script open in the editor and it will launch into the debugger and hit your breakpoints etc.

## Using a logical environment

Logical environments are a way to allow multiple deployments of the same logical resource in a single physical Cloudflare account. They enable side by side use cases such as multiple developers working on the same resources in a 'dev' account, or a CI/CD process deploying ephemeral resources for every pull/merge request. They work by using an environment label as part of the route and script names to namespace and distinguish one version of the same resource from another.

To create a logical environment, add an _ENVIRONMENT_ variable to the **.env** file as explained in the table above, for example **ENVIRONMENT=alex**. Notice the environment (alex) prefixes the route and is part of the worker script name in the examples below:

### Initial deploy to the default slot (blue):

```bash
> npm run deploy
> curl https://blue-api.somewhere.com/alex/account
> "Processing account resource in alex environment from blue slot..."
```

### Activate the blue slot by rotating:

```bash
> npm run rotate
> curl https://api.somewhere.com/alex/account
> "Processing account resource in alex environment from blue slot..."
```

### Deploy to the other slot (green):

```bash
> npm run deploy
> curl https://green-api.somewhere.com/alex/account
> "Processing account resource in alex environment from green slot..."
```

### Rotate to the other slot:

```bash
> npm run rotate
> curl https://api.somewhere.com/alex/account
> "Processing account resource in alex environment from green slot..."
```

### Remove all slots/workers:

```bash
> npm run remove
```
