import axios from 'axios';

const DEFAULT_ADDRESS = 'Комсомольский проспект 113А, главный корпус';
const DEFAULT_LOCATION = 'Второй этаж, у кабинета 201';

export default async function handler(req, res) {

  if (req.method === 'GET') {
    return res.status(200).send('CupSensor API works');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed'
    });
  }

  try {

    const secret = req.headers['x-device-secret'];

    if (secret !== process.env.DEVICE_SECRET) {
      return res.status(403).json({
        ok: false,
        error: 'Wrong secret'
      });
    }

    const fill = Number(req.body.fill || 0);
    const compartment = Number(req.body.compartment || 0);

    const compartmentSize =
      req.body.compartment_size ||
      (
        compartment === 1 ? 'S' :
        compartment === 2 ? 'M' :
        compartment === 3 ? 'L' :
        'не указан'
      );

    const compartmentLabel =
      req.body.compartment_label ||
      `Отсек ${compartmentSize}`;

    const address =
      req.body.address ||
      DEFAULT_ADDRESS;

    const location =
      req.body.location ||
      DEFAULT_LOCATION;

    if (fill < 80) {
      return res.status(200).json({
        ok: true,
        sent: false,
        reason: 'fill < 80'
      });
    }

    const message =
      `⚠️ Контейнер заполнен на ${fill}%\n\n` +
      `📍 Адрес: ${address}\n` +
      `🏫 Расположение: ${location}\n` +
      `🗂 ${compartmentLabel}`;

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

    return res.status(200).json({
      ok: true,
      sent: true,
      message,
      vk: vkResponse.data
    });

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }

}