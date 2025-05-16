import * as fs from 'fs';

export const deleteUploadFile = (path: string) => {
  fs.unlink(path, (err) => {
    if (err) throw err;

    console.log('File is deleted.');
  });
};
