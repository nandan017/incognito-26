const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY, // Pulled safely from Netlify Settings
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: "INCOGNITO HQ", email: 'hareshhare685@gmail.com' },
      to: [{ email: data.email, name: data.name }],
      subject: `[CLASSIFIED] DOSSIER: ${data.name.toUpperCase()}`,
      htmlContent: `
        <div style="background:#0a0a08; color:#ff0000; font-family:monospace; padding:30px; border:3px solid #ff0000;">
          <h1>INCOGNITO-26</h1>
          <p><strong>AGENT:</strong> ${data.name}</p>
          <p><strong>EVENT:</strong> ${data.event}</p>
          <p><strong>HUB:</strong> ${data.college}</p>
        </div>`
    })
  });

  const result = await response.json();
  return {
    statusCode: response.status,
    body: JSON.stringify(result)
  };
};