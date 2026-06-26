// File: plugins/ai/ai-detector.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'ai-ai-detector',
  name:        'Ai-detector',
  category:    'Ai',
  path:        '/api/ai/ai-detector',
  method:      'GET',
  description: 'AI-authorship detection from text',

  params: [
    {
      name: 'text',
      required: true,
      example: 'Hello! How can I assist you today? If you\'re interested in the Web3 Neobank mentioned in the search query, I can provide more information about its features and benefits. It\'s an easy-to-use Crypto Bank Super-App that allows you to trade, save, and spend both crypto and fiat. You can pay with a custom fiat & crypto debit card at any of Mastercard’s 90 million merchants worldwide. The app offers unbeatable benefits for every cardholder, including up to 5% back on spending and multiple choices from  100 digital subscriptions. There are different card types available, such as Basic, Black, Silver, Gold, Platinum, and Diamond, each with varying points. The app also supports top-up and withdrawal instantaneously using your personal IBAN and SEPA or FPS. It\'s a fully licensed crypto exchange with Basic or Pro features to support all your trading needs. You can buy and sell 100  Cryptocurrencies, with Credit Card, Bank Transfer or Other Cryptos. The app also allows you to set responsible crypto savings goals and earn yield responsibly, with the freedom to withdraw any time.',      description: 'Input text',
    }
  ],

  handler: async (req, getInput, res) => {
    const text = getInput(req, 'text');
    if (!text) return { ok: false, status: 400, message: "Parameter 'text' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/ai-detector', {
        params: {
          text,
          apikey: 'yMb35i',
        },
        timeout: 20000,
        headers: { Accept: 'application/json', 'User-Agent': 'ElynnAPI/1.0' },
      });

      if (!data?.status) return { ok: false, status: 502, message: data?.message || 'Upstream error.' };
      return { ok: true, result: data.data };
    } catch (err) {
      return { ok: false, status: 500, message: err.message || 'Internal server error.' };
    }
  },
};
