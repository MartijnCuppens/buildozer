const c = require('copyfiles');
const glob = require('glob');
const configs = require('./configs.js');

// Copy files & folders
async function copy(cb) {
  let copyLocations = [];
  // Loop over all configurations and get the locations of files which need to be copied
  await configs.then(configurations => {
    configurations.forEach(config => {
      // Skip if no copy config is present
      if (Array.isArray(config.copy)) {
        copyLocations = copyLocations.concat(config.copy);
      }
    });
  });

  if (copyLocations.length === 0) {
    // Return callback if nothing needs to be copied
    cb();
  }

  let locationsProcessed = 0;
  const filesCopied = [];
  return new Promise(
    (() => {
      copyLocations.forEach(location => {
        glob(location.src, {}, (err, paths) => {
          if (err) {
            throw err;
          }

          paths.forEach(p => {
            const up = p.split('/').length - 1;

            filesCopied.push({
              src: p,
              dest: location.dest
            });

            c([p, location.dest], {up}, () => {
              // If the last location is processed
              if (++locationsProcessed === copyLocations.length) {
                logCopiedFiles(filesCopied);
                // Return callback after all locations are processed
                cb();
              }
            });
          });
        });
      });
    })
  );
}

function logCopiedFiles(filesCopied) {
  if (filesCopied.length > 0) {
    const log = require('fancy-log');
    const chalk = require('chalk');

    // Log all copied files
    if (process.argv.includes('--verbose')) {
      const indent = '           '; // Align with gulp output
      let message = chalk.cyan('Files copied:');

      filesCopied.forEach(file => {
        message += `\n${indent}- ${chalk.bold(file.src)} to\n${indent}  ${chalk.bold(file.dest)}`;
      });
      log(message);
    } else if (filesCopied.length === 1) {
      log(`${chalk.bold('1 file')} copied.`);
    } else {
      log(`${chalk.bold(`${filesCopied.length} files`)} copied.`);
    }
  }
}

module.exports = copy;
