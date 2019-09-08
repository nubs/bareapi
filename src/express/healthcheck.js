const healthcheck = async (req, res) => {
  res.status(200).json({ status: 'OK' }).end();
};

export default healthcheck;
