document.addEventListener("DOMContentLoaded", function () {
  const generateBtn = document.getElementById("generate-resume-btn");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-pdf-btn");

  // Disable copy & download buttons until resume is generated
  copyBtn.disabled = true;
  downloadBtn.disabled = true;

  generateBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Stop form from refreshing the page

    const name = document.getElementById("fullName").value;
    const title = document.getElementById("title").value;
    const experience = document.getElementById("experience").value;
    const skills = document.getElementById("skills").value;
    const education = document.getElementById("education").value;

    // Check if all fields are filled
    if (!name || !title || !experience || !skills || !education) {
      alert("Please fill out all fields before generating the resume.");
      return;
    }

    const prompt = `You are a professional resume writer. Based on the candidate information below, write a clean, modern resume using this exact structure. Do not add commentary or explanations. Write the resume as if the applicant is speaking (first-person implied style), not about them. Do not refer to the person by name in the content.

    Template:
    # [Full Name]

    A professional summary (3–5 lines) that highlights the candidate’s background, years of experience, technical strengths, and industry focus. Avoid repetition and generalities.

    ## Experience

    **[Job Title]**  
    [Company Name] — [Start Date] to [End Date or Present]  
    - Key responsibility or achievement #1  
    - Key responsibility or achievement #2  
    - Key responsibility or achievement #3  
    - Technologies, tools, or methods used (if relevant)

    ## Skills
    - List relevant technical and soft skills in bullet format  
    - (Keep this section concise and relevant)
    ## Education

    **[Degree]**  
    [University Name], [Graduation Year]  
    - (Optional: Add GPA, awards, or relevant coursework)

    Candidate info:
    Full Name: ${name}
    Job Title: ${title}
    Experience: ${experience}
    Skills: ${skills}
    Education: ${education}`;

    generateWithCohere(prompt);
  });

  async function generateWithCohere(prompt) {
    const resumeOutput = document.getElementById("resume-output");
    resumeOutput.innerText = "Generating resume...";

    try {
      const response = await fetch("/.netlify/functions/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "command-light",
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      // Enable copy & download
      copyBtn.disabled = false;
      downloadBtn.disabled = false;

      if (data.generations && data.generations[0]) {
        resumeOutput.innerText = data.generations[0].text;
      } else {
        resumeOutput.innerText = "Something went wrong. Please try again.";
      }
    } catch (error) {
      console.error("Error:", error);
      resumeOutput.innerText =
        "Failed to generate resume. Check your API key or connection.";
    }
  }

  copyBtn.addEventListener("click", function () {
    const resumeText = document.getElementById("resume-output").innerText;
    navigator.clipboard
      .writeText(resumeText)
      .then(() => {
        alert("Resume copied to clipboard!");
      })
      .catch((err) => {
        alert("Failed to copy resume.");
        console.error(err);
      });
  });

  downloadBtn.addEventListener("click", async function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const resumeText = document.getElementById("resume-output").innerText;

    const margin = 10;
    const maxLineWidth = 180; // width inside margins
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;

    const lines = doc.splitTextToSize(resumeText, maxLineWidth);

    let cursorY = margin;

    lines.forEach((line) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage(); // create a new page
        cursorY = margin; // reset Y position
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    doc.save("resume.pdf");
  });
});
