require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

async function sendVkMessage(text) {

  const response = await axios.post(
    'https://api.vk.com/method/messages.send',
    null,
    {
      params: {
        access_token: process.env.VK_GROUP_TOKEN,
        v: '5.199',
        peer_id: process.env.VK_PEER_ID,
        random_id: Date.now(),
        message: text
      }
    }
  );

  return response.data;
}

app.get('/', (req, res) => {
  res.send('CupSensor server works');
});

app.post('/api/fill', async (req, res) => {

  try {

    const secret = req.headers['x-device-secret'];

    if (secret !== process.env.DEVICE_SECRET) {

      return res.status(403).json({
        ok: false,
        error: 'Wrong secret'
      });

    }

    const fill = Number(req.body.fill || 0);

    if (fill < 90) {

      return res.json({
        ok: true,
        sent: false
      });

    }

    await sendVkMessage(
      '⚠️ Контейнер заполнен на 90%'
    );

    return res.json({
      ok: true,
      sent: true
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});

app.listen(PORT, () => {
  console.log('CupSensor server started on port ' + PORT);
});