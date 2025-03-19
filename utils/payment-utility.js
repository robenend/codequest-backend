const axios = require("axios");

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
}

const randomString = generateRandomString(16);

const makeTopUp = async (amount, phoneNumber) => {
  const requestUrl = "https://api.chapa.co/v1/transaction/initialize";
  const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
  const chapaCallbackUrl = process.env.CHAPA_CALLBACK_URL;
  const currency = "ETB";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${chapaSecretKey}`,
  };

  const randomString = generateRandomString(16);

  const data = {
    amount: amount,
    currency: currency,
    phoneNumber: phoneNumber,
    callbackUrl: chapaCallbackUrl,
    tx_ref: randomString,
  };

  try {
    const response = await axios.post(requestUrl, data, { headers });
    return response.data.data.checkout_url;
  } catch (error) {
    throw error;
  }
};

module.exports = { makeTopUp };
