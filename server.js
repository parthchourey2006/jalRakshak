// ============================================
// JalRakshak Backend Server
// Node.js + Express + Twilio SMS
// ============================================
// 
// SETUP INSTRUCTIONS:
// 1. npm init -y
// 2. npm install express twilio cors dotenv
// 3. Create .env file with your credentials
// 4. node server.js
// ============================================

require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Twilio Client ----
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ---- SMS Route ----
app.post('/send-alert', async (req, res) => {
  const { to, area, detected, baseline, deviation, severity, timeSlot } = req.body;

  if (!to || !area) {
    return res.status(400).json({ success: false, error: 'Missing fields: to, area required' });
  }

  const emoji = severity === 'danger' ? 'CRITICAL' : 'WARNING';
  const message = `JalRakshak ${emoji}: Zone ${area}, Deviation +${deviation}%. Pipe leakage suspected. Check immediately.`;

  try {
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to  // e.g. "+919876543210"
    });

    console.log(`✅ SMS sent to ${to} | SID: ${sms.sid} | Area: ${area}`);
    res.json({ success: true, sid: sms.sid, message: 'SMS sent successfully' });

  } catch (err) {
    console.error('❌ Twilio error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Health Check ----
app.get('/', (req, res) => {
  res.json({ 
    status: 'JalRakshak Server Running ✅',
    version: '1.0.0',
    endpoints: { smsAlert: 'POST /send-alert' }
  });
});

// ---- Start ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n💧 JalRakshak Backend running on http://localhost:${PORT}`);
  console.log(`📡 SMS alerts ready via Twilio\n`);
});
