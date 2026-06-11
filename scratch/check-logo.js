const sharp = require('sharp');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'public', 'logo', 'Logo_Desktop.png');

sharp(imgPath)
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    // Let's count non-transparent pixels in each row from top to bottom
    const rowCount = new Array(info.height).fill(0);
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const alpha = info.channels === 4 ? data[idx + 3] : 255;
        if (alpha > 0) {
          rowCount[y]++;
        }
      }
    }
    
    // Find the first and last row with content
    let firstRow = -1;
    let lastRow = -1;
    for (let y = 0; y < info.height; y++) {
      if (rowCount[y] > 0) {
        if (firstRow === -1) firstRow = y;
        lastRow = y;
      }
    }
    
    // Let's also check left/right crop
    const colCount = new Array(info.width).fill(0);
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const alpha = info.channels === 4 ? data[idx + 3] : 255;
        if (alpha > 0) {
          colCount[x]++;
        }
      }
    }
    
    let firstCol = -1;
    let lastCol = -1;
    for (let x = 0; x < info.width; x++) {
      if (colCount[x] > 0) {
        if (firstCol === -1) firstCol = x;
        lastCol = x;
      }
    }
    
    console.log('Horizontal content range:', firstCol, 'to', lastCol, 'of', info.width);
    console.log('Vertical content range:', firstRow, 'to', lastRow, 'of', info.height);
  })
  .catch(err => {
    console.error(err);
  });
