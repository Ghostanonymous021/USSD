/**
 * SafeWithdraw – USSD Backend
 */

const AfricasTalking = require('africastalking');

const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';
const AT_API_KEY = process.env.AT_API_KEY || 'SUA_API_KEY_AQUI';
const AT_SENDER_ID = process.env.AT_SENDER_ID || 'SafeWithdraw';

const africastalking = AfricasTalking({
  username: AT_USERNAME,
  apiKey: AT_API_KEY
});
const sms = africastalking.SMS;

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 4; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function parseUssdInput(text) {
  if (!text || text.trim() === '') {
    return { level: 0, parts: [] };
  }
  const parts = text.split('*');
  return { level: parts.length, parts };
}

function getSimulatedBalance(phoneNumber) {
  return 50000;
}

async function sendTokenSMS(phoneNumber, token, amount) {
  const message = `SafeWithdraw: Token ${token}
Valor: ${amount} MT
Valido por 24h
De este codigo + o seu numero a quem for levantar.`;

  try {
    const result = await sms.send({
      to: [phoneNumber],
      message: message,
      from: AT_SENDER_ID
    });
    console.log('SMS enviado:', result);
    return true;
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { sessionId, phoneNumber, text, serviceCode } = req.body || {};

  console.log('--- Novo pedido USSD ---');
  console.log('phoneNumber:', phoneNumber);
  console.log('text:', text);
  console.log('serviceCode:', serviceCode);

  let response = '';

  try {
    const { level, parts } = parseUssdInput(text);

    if (level === 0) {
      response = `CON Digite o seu PIN:`;
    }
    else if (level === 1) {
      const pin = parts[0];

      if (!/^\d{4}$/.test(pin)) {
        response = `END PIN invalido. Deve ter 4 digitos.`;
      } else {
        const balance = getSimulatedBalance(phoneNumber);
        let amount = 230;

        if (serviceCode) {
          const codeParts = serviceCode.replace(/#/g, '').split('*').filter(Boolean);
          if (codeParts.length >= 3) {
            const possibleAmount = parseInt(codeParts[codeParts.length - 1], 10);
            if (!isNaN(possibleAmount) && possibleAmount > 0) {
              amount = possibleAmount;
            }
          }
        }

        if (balance >= amount) {
          const token = generateToken();
          sendTokenSMS(phoneNumber, token, amount).catch(console.error);

          response = `END Token gerado: ${token}
Valor: ${amount} MT
Valido por 24h

De este codigo + o seu numero a quem for levantar.`;
        } else {
          response = `END Saldo insuficiente.
Tente novamente com um valor menor.`;
        }
      }
    }
    else {
      response = `END Sessao terminada.`;
    }

  } catch (error) {
    console.error('Erro no handler:', error);
    response = `END Ocorreu um erro. Tente novamente.`;
  }

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(response);
};
