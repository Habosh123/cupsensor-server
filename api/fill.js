const axios = require('axios');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('CupSensor API works');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const secret = req.headers['x-device-secret'];

    if (secret !== process.env.DEVICE_SECRET) {
      return res.status(403).json({ ok: false, error: 'Wrong secret' });
    }

    const fill = Number(req.body.fill || 0);
    const cups = Number(req.body.cups || 0);
    const distance = Number(req.body.distance || 0);
    const deviceId = req.body.device_id || 'cup_sensor_01';

    if (fill < 90) {
      return res.status(200).json({ ok: true, sent: false });
    }

    const message =
      '⚠️ Контейнер для кофейных стаканчиков заполнен\n\n' +
      'Устройство: ' + deviceId + '\n' +
      'Заполнение: ' + fill + '%\n' +
      'Количество стаканчиков: ' + cups + '\n' +
      'Расстояние: ' + distance + ' мм\n\n' +
      'Необходимо очистить контейнер.';

    const vkResponse = await axios.post(
      'https://api.vk.com/method/messages.send',
      null,
      {
        params: {
          access_token: process.env.VK_GROUP_TOKEN,
          v: '5.199',
          peer_id: process.env.VK_PEER_ID,
          random_id: Date.now(),
          message
        }
      }
    );

    if (vkResponse.data.error) {
      return res.status(500).json({
        ok: false,
        vk_error: vkResponse.data.error
      });
    }

    return res.status(200).json({ ok: true, sent: true });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};