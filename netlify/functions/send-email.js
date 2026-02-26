const fetch = require('node-fetch');

exports.handler = async (event) => {
  const data = JSON.parse(event.body);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY, // This pulls from your .env file
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: "INCOGNITO HQ", email: 'hareshhare685@gmail.com' }, // Your verified sender
      to: [{ email: data.email, name: data.name }],
      subject: `-----------------------`,
      htmlContent: data.htmlContent
    })
  });

  const result = await response.json();
  return {
    statusCode: response.status,
    body: JSON.stringify(result)
  };
};