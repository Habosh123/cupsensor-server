module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('CupSensor API works');
  }

  return res.status(200).json({
    ok: true,
    method: req.method
  });
};