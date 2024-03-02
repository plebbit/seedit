import {execSync} from 'child_process'
import path from 'path'
import {fileURLToPath} from 'url'
const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)))
const conventionalChangelog = path.join(dirname, '..', 'node_modules', '.bin', 'conventional-changelog')

// sometimes release-count 1 is empty
let releaseChangelog = 
  execSync(`${conventionalChangelog} --preset angular --release-count 1`).toString() || 
  execSync(`${conventionalChangelog} --preset angular --release-count 2`).toString()

// format
releaseChangelog = releaseChangelog.trim().replace(/\n\n+/g, '\n\n')

const releaseBody = `Progressive web app mirrors:
- https://seedit.eth.limo
- https://seedit.eth.link
- https://cloudflare-ipfs.com/ipns/seedit.eth (insecure, no subdomain isolation)

CLI client:
- https://github.com/plebbit/plebbit-cli/releases/latest

${releaseChangelog}`

console.log(releaseBody)