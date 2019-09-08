import path from 'path';

const version = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../version.json'));
};

export default version;
