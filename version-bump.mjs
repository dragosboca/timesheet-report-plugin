import { readFileSync, writeFileSync } from 'fs';

// Read minAppVersion from manifest.json
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const minAppVersion = manifest.minAppVersion;

// Update versions.json with the new version
let versions = {};
try {
    versions = JSON.parse(readFileSync('versions.json', 'utf8'));
} catch (e) {
    console.log('Could not find versions.json, creating a new one');
}
versions[manifest.version] = minAppVersion;

// Write updated versions.json
writeFileSync('versions.json', JSON.stringify(versions, null, '\t'));
