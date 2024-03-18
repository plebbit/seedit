<img src="https://github.com/plebeius-eth/assets/blob/main/seedit-logo.png" width="378" height="123">

A GUI for plebbit similar to old.reddit 

_Telegram group for this repo https://t.me/seeditreact_

## To run locally

1. Install Node v18 (Download from https://nodejs.org)
2. Install Yarn: `npm install -g yarn`
3. `yarn install --frozen-lockfile` to install Seedit dependencies
4. `yarn start` to run the web client

### Scripts:

- Web client: `yarn start`
- Electron client (must start web client first): `yarn electron`
- Electron client and don't delete data: `yarn electron:no-delete-data`
- Web client and electron client: `yarn electron:start`
- Web client and electron client and don't delete data: `yarn electron:start:no-delete-data`

### Build:

The linux/windows/mac/android build scripts are in https://github.com/plebbit/seedit/blob/master/.github/workflows/release.yml
