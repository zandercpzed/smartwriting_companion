#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function readJSON(p){
  return JSON.parse(fs.readFileSync(p,'utf8').replace(/\n/g,'\n'))
}

function writeJSON(p,obj){
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n')
}

function bumpVersion(v){
  const parts = v.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.')
}

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const manifestPath = path.join(root, 'manifest.json');
const versionsPath = path.join(root, 'versions.json');

const pkg = readJSON(pkgPath);
const manifest = readJSON(manifestPath);
const versions = readJSON(versionsPath);

const oldVersion = pkg.version || manifest.version;
const newVersion = bumpVersion(oldVersion);

pkg.version = newVersion;
manifest.version = newVersion;

// update versions.json key from oldVersion to newVersion, preserving value if present
if (versions[oldVersion]){
  const val = versions[oldVersion];
  delete versions[oldVersion];
  versions[newVersion] = val;
} else {
  versions[newVersion] = manifest.minAppVersion || "0.15.0";
}

writeJSON(pkgPath, pkg);
writeJSON(manifestPath, manifest);
writeJSON(versionsPath, versions);

console.log(`${oldVersion} -> ${newVersion}`);
