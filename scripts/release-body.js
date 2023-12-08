const {execSync} = require('child_process')
const path = require('path')
const conventionalChangelog = path.join('node_modules', '.bin', 'conventional-changelog')

// sometimes release-count 1 is empty
let releaseChangelog = 
  execSync(`${conventionalChangelog} --preset angular --release-count 1`).toString() || 
  execSync(`${conventionalChangelog} --preset angular --release-count 2`).toString()

// format
releaseChangelog = releaseChangelog.trim().replace(/\n\n+/g, '\n\n')

const releaseBody = `Progressive web app mirrors:
- https://plebones.eth.limo
- https://plebones.eth.link
- https://cloudflare-ipfs.com/ipns/plebones.eth (insecure, no subdomain isolation)

CLI client:
- https://github.com/plebbit/plebbit-cli/releases/latest

${releaseChangelog}`

console.log(releaseBody)