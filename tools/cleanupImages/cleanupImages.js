const fs = require('fs');

const imagePath = '../../apps/legosort/src/assets/parts';

fs.readdir(imagePath, (err, files) => {
  files = files.filter(file => {
    return file.split('.')[0].replace(/[0-9]/g, '') !== '';
  });
  console.log(files);
  files.forEach(file => {
    fs.unlinkSync(imagePath + '/' + file);
  })
});
