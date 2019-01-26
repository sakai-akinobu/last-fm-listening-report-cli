import * as fs from 'fs';
import * as path from 'path';
import * as commander from 'commander';

import * as tableFormatter from './table-formatter';
import * as apiUser from './api/user';

const PACKAGE_JSON_FILE_PATH = path.join(__dirname, '../../package.json');

if (
  !fs.existsSync(PACKAGE_JSON_FILE_PATH) ||
  !fs.statSync(PACKAGE_JSON_FILE_PATH).isFile()
) {
  process.stderr.write('package.json does not found.\n');
  process.exit(1);
}

let packageJson: {version: string} | null;
try {
  packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE_PATH).toString());
} catch (e) {
  process.stderr.write(`Failed to parse package.json file.\n${e.message}\n`);
  process.exit(1);
}

const {apiKey, user} = commander
  .version(packageJson!.version)
  .option('-k, --api-key [api-key]', 'API key generated by last.fm. See also https://www.last.fm/api')
  .option('-u, --user [user]', 'User name on Last.fm.')
  .parse(process.argv);

Promise.all([
  apiUser.getRecentTracks(apiKey, user),
  apiUser.getTopAlbums(apiKey, user),
  apiUser.getTopArtists(apiKey, user),
  apiUser.getTopTracks(apiKey, user),
])
.then(([
  recentTracks,
  topAlbums,
  topArtists,
  topTracks,
]) => {
  process.stdout.write(
    [
      tableFormatter.recentTracks(recentTracks),
      tableFormatter.topAlbums(topAlbums),
      tableFormatter.topArtists(topArtists),
      tableFormatter.topTracks(topTracks),
    ].join('\n'),
  );
})
.catch(e => {
  process.stderr.write(`${e.message}\n`);
});
