const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const input = JSON.parse(event.body);

    let prompt;

    if (input.rawResumeText) {
      // Raw resume from file upload
      prompt = `
The following is the raw text of a resume. Please update and format it to a modern, professional standard:
---
${input.rawResumeText}
`;
    } else {
      // Structured input from form
      const { fullName, title, experience, skills, education } = input;

      prompt = `
Generate a professional resume for the following user:

Name: ${fullName}
Title: ${title}

Experience:
${experience.join("\n")}

Skills:
${skills.join(", ")}

Education:
${education}

Format the resume in a clean, structured layout with clear sections.
`;
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a professional resume writer.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    const result = await response.json();
    const text =
      result.choices?.[0]?.message?.content || "Resume generation failed.";

    return {
      statusCode: 200,
      body: JSON.stringify({ result: text }),
    };
  } catch (err) {
    console.error("Resume generation error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
