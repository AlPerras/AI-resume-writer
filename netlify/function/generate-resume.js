// netlify/functions/generate-resume.js

export async function handler(event, context) {
  const { prompt } = JSON.parse(event.body);

  const response = await fetch("https://api.cohere.ai/v1/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-light",
      prompt,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
