const path = require('path');
const fs = require('fs-extra');

function collectFiles(filePath, results, fileFilter, dirFilter) {
  const files = fs.readdirSync(filePath);
  if (!files) {
    console.warn(err);
  } else {
    files.forEach((filename) => {
      const filedir = path.posix.join(filePath, filename);
      const stats = fs.statSync(filedir);
      if (!stats) {
        console.warn(`${filedir}: invalid file stats.`);
      } else {
        const isFile = stats.isFile();
        const isDir = stats.isDirectory();
        if (isFile) {
          if (fileFilter && typeof fileFilter === 'function') {
            if (fileFilter(filedir)) {
              results.push(filedir);
            }
          } else {
            results.push(filedir);
          }
        }
        let digIn = true;
        if (dirFilter && typeof dirFilter === 'function') {
          if (!dirFilter(filedir)) {
            digIn = false;
          }
        }
        if (isDir && digIn) {
          collectFiles(filedir, results, fileFilter, dirFilter);
        }
      }
    });
  }
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  }
  return false;
}

module.exports = {
  collectFiles,
  randomNum,
  recursiveIssuer
};
