module.exports = async function handler(req, res) {
  // Só aceitamos POST
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Ler os dados que o Africa's Talking envia
    const body = req.body || {};
    const text = (body.text || '').trim();
    const phoneNumber = body.phoneNumber || '';
    const serviceCode = body.serviceCode || '';

    console.log('USSD Request:', { text, phoneNumber, serviceCode });

    let response = '';

    if (text === '') {
      // Primeira vez que marca o código
      response = 'CON Digite o seu PIN:';
    } else {
      // Já digitou o PIN
      const pin = text.split('*')[0];

      if (!/^\d{4}$/.test(pin)) {
        response = 'END PIN invalido. Deve ter 4 digitos.';
      } else {
        // Gerar token simples
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let token = '';
        for (let i = 0; i < 4; i++) {
          token += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        response = `END Token gerado: ${token}
Valor: 230 MT
Valido por 24h

De este codigo + o seu numero a quem for levantar.`;
      }
    }

    // Resposta obrigatória em texto simples
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(response);

  } catch (error) {
    console.error('Erro:', error);
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('END Ocorreu um erro. Tente novamente.');
  }
};
