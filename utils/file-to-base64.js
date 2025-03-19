const fs = require("fs");

const saveBase64File = (base64String, outputPath) => {
  return new Promise((resolve, reject) => {
    const data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(data, "base64");

    fs.writeFile(outputPath, buffer, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

module.exports = saveBase64File;
