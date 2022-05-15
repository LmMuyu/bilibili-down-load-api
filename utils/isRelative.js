module.exports = (path) => {
  const root = process.cwd();
  const isc = path.indexOf(root) > -1;

  return isc;
};
