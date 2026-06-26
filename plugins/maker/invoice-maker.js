// File: plugins/maker/invoice-maker.js
'use strict';

const axios = require('axios');

module.exports = {
  id:          'maker-invoice-maker',
  name:        'Invoice-maker',
  category:    'Maker',
  path:        '/api/maker/invoice-maker',
  method:      'GET',
  description: 'Invoice image generator',

  params: [
    {
      name: 'store',
      required: true,
      example: 'NEOXR CREATIVE',
      description: 'Input store',
    },
    {
      name: 'invoice',
      required: true,
      example: '1234ABCD',
      description: 'Input invoice',
    },
    {
      name: 'date',
      required: true,
      example: '06/05/2025',
      description: 'Input date',
    },
    {
      name: 'status',
      required: true,
      example: 'paid',
      description: 'Input status',
    },
    {
      name: 'image',
      required: true,
      example: 'https://i.ibb.co.com/kt5fyrg/qr.jpg',
      description: 'Input image',
      isImage: true,
      isMedia: true,
    },
    {
      name: 'items',
      required: true,
      example: '[{"name":"Pecel Ayam","unit":"1x","price":20000},{"name":"Bebek Penyet","unit":"1x","price":35000},{"name":"Es Susu","unit":"1x","price":15000}]',
      description: 'Input items',
    },
    {
      name: 'total',
      required: true,
      example: '60000',
      description: 'Input total',
    }
  ],

  handler: async (req, getInput, res) => {
    const store = getInput(req, 'store');
    const invoice = getInput(req, 'invoice');
    const date = getInput(req, 'date');
    const status = getInput(req, 'status');
    const image = getInput(req, 'image');
    const items = getInput(req, 'items');
    const total = getInput(req, 'total');
    if (!store) return { ok: false, status: 400, message: "Parameter 'store' wajib diisi." };
    if (!invoice) return { ok: false, status: 400, message: "Parameter 'invoice' wajib diisi." };
    if (!date) return { ok: false, status: 400, message: "Parameter 'date' wajib diisi." };
    if (!status) return { ok: false, status: 400, message: "Parameter 'status' wajib diisi." };
    if (!image) return { ok: false, status: 400, message: "Parameter 'image' wajib diisi." };
    if (!items) return { ok: false, status: 400, message: "Parameter 'items' wajib diisi." };
    if (!total) return { ok: false, status: 400, message: "Parameter 'total' wajib diisi." };

    try {
      const { data } = await axios.get('https://api.neoxr.eu/api/invoice-maker', {
        params: {
          store,
          invoice,
          date,
          status,
          image,
          items,
          total,
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
