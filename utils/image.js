import fs from "fs";
export const deleteImage = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.error("Error deleting the image:", error);
    } else {
      console.log("Image deleted successfully");
    }
  });
};

export const saveBase64Image = (base64String, outputPath) => {
  return new Promise((resolve, reject) => {
    const data = base64String?.replace(/^data:application\/pdf;base64,/, "");
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
