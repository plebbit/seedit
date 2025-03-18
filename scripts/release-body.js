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

const releaseBody = `- Web app: https://seedit.app
- Mobile app: available for Android. Download link under "Assets" ⬇️
- Desktop app (full P2P node, run your own community): available for Mac/Windows/Linux. Download links under "Assets" ⬇️
- Command Line Interface (full P2P node, run your own community): https://github.com/plebbit/plebbit-cli/releases/latest

${releaseChangelog}`

console.log(releaseBody)