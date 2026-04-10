// Import Twilio library to send SMS
const twilio = require("twilio");

// Create Twilio client using credentials from .env
// This connects your backend with Twilio service
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,   // unique account ID
  process.env.TWILIO_AUTH_TOKEN     // secret key (like password)
);

// Reusable function to send SMS
// We pass:
// - to → receiver phone number
// - message → text content (OTP or alert)
const sendSMS = async ({ to, message }) => {
  // Call Twilio API to send message
  return await client.messages.create({
    body: message,                         // message content
    from: process.env.TWILIO_PHONE_NUMBER, // Twilio number (sender)
    to,                                    // user phone number (receiver)
  });
};

// Export function so we can use it in other files (like auth.service)
module.exports = { sendSMS };