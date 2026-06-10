const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.png'));

Promise.all(files.map(f => {
  const p = path.join(publicDir, f);
  return sharp(p).metadata().then(meta => ({ file: f, meta }));
})).then(results => {
  console.log('Public PNG files:', results);
}).catch(console.error);
