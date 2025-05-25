import pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "//mozilla.github.io/pdf.js/build/pdf.worker.js";

const useUploadBtn = document.getElementById("useUpload");
const useFormBtn = document.getElementById("useForm");
const uploadSection = document.getElementById("uploadSection");
const formSection = document.getElementById("formSection");

useUploadBtn.addEventListener("click", () => {
  uploadSection.classList.remove("hidden");
  formSection.classList.add("hidden");
  useUploadBtn.classList.add("active");
  useFormBtn.classList.remove("active");
});

useFormBtn.addEventListener("click", () => {
  formSection.classList.remove("hidden");
  uploadSection.classList.add("hidden");
  useFormBtn.classList.add("active");
  useUploadBtn.classList.remove("active");
});

const fileInput = document.getElementById("resumeFile");
const generateBtn = document.getElementById("generateBtn");
const output = document.getElementById("output");

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(" ") + "\n\n";
  }
  return fullText;
}

async function extractTextFromTxt(file) {
  return await file.text();
}

function getFormData() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    title: document.getElementById("title").value.trim(),
    experience: document
      .getElementById("workExperience")
      .value.trim()
      .split("\n"),
    skills: document.getElementById("skills").value.trim().split(","),
    education: document.getElementById("education").value.trim(),
  };
}

generateBtn.addEventListener("click", async () => {
  output.textContent = "";
  const file = fileInput.files[0];
  let payload;

  if (file) {
    output.textContent = "Extracting text from uploaded file...";
    try {
      let resumeText = "";
      if (file.type === "application/pdf") {
        resumeText = await extractTextFromPDF(file);
      } else if (file.type === "text/plain") {
        resumeText = await extractTextFromTxt(file);
      } else {
        alert("Unsupported file type. Please upload a PDF or TXT file.");
        return;
      }
      payload = { rawResumeText: resumeText };
    } catch (err) {
      alert("Failed to extract text from file.");
      console.error(err);
      return;
    }
  } else {
    const formData = getFormData();
    if (!formData.fullName || !formData.title) {
      alert("Please fill in all required form fields.");
      return;
    }
    payload = formData;
  }

  output.textContent = "Generating resume...";

  try {
    const response = await fetch("/.netlify/functions/generate-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Resume generation failed.");
    const data = await response.json();
    output.textContent = data.result || "No resume returned.";
  } catch (err) {
    alert(err.message);
    output.textContent = "";
  }
});
