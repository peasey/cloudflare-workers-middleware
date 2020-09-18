# Cloudflare Workers - Blue / Green Deployments

This repo contains a minimal example from a proof of concept using the Serverless framework to enable blue / green deployments for Cloudflare Workers.

## Configuration

The configuration is handled by `dotenv` so the first thing you need to do is add a .env file to the root of the repo with the following environment variables:

| Variable              | Comment                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLOUDFLARE_ACCOUNT_ID | This should be set to your Cloudflare **Account ID** and can be found in the _Overview_ page under the _API_ section in the Cloudflare dashboard.                               |
| CLOUDFLARE_ZONE_ID    | This should be set to your Cloudflare **Zone ID** and can be found in the _Overview_ page under the _API_ section in the Cloudflare dashboard.                                  |
| CLOUDFLARE_AUTH_KEY   | This should be set to your API key which you can find in the Cloudflare dashboard under the _API_ section and then _Get your API token_ -> _API tokens_ tab -> _Global API Key_ |
| CLOUDFLARE_AUTH_EMAIL | This should be set to the email address you use to sign into your Cloudflare account.                                                                                           |
| HOST                  | This should be set to the API host you want to use in your routes, i.e. api.somewhere.com.                                                                                      |

<br>

> Note: You need to ensure you have the required DNS records and TLS certs configured. For example, if your HOST is api.somewhere.com, you need the following DNS A records for the _somewhere.com_ domain to support api.somewhere.com, blue.api.somewhere.com and green.api.somewhere.com, your TLS cert should also have those domains as alternative names, or be a wildcard cert.

## Installation

```bash
> npm install
```

## Running

I've created some npm scripts to simplify the commands when wrapped with configuration. Replace _somewhere.com_ with the host you configured in the .env file below:

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
> curl https://api.somewhere.com/account
> "Processing account resource from green slot..."
```
