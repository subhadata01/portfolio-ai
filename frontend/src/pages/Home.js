import React, { useState } from "react";
import axios from "axios";
import './styles.css';

const prompt =
  "You are an AI assistant tasked with extracting information from a resume image. You will be provided with an image of a resume, and your job is to analyze it and extract relevant information in a structured format.\n\nHere is the image of the resume:\n<image>\n{{IMAGE}}\n</image>\n\nYour task is to extract the following information from the resume image:\n\n1. Full Name\n2. Contact Information (email, phone number, address)\n3. Professional Summary or Objective Statement\n4. Work Experience (including job titles, company names, dates of employment, and key responsibilities,projects)\n5. Education (including degrees, institutions, and graduation dates)\n6. Skills\n7. Certifications or Awards (if any)\n8. Languages (if mentioned)\n9. Projects \n10.Other information \nPlease use optical character recognition (OCR) or any other image analysis techniques at your disposal to read and interpret the text from the image.\n\nStructure your output in the following format:\n\n<resume_info>\n<full_name>[Extracted full name]</full_name>\n<contact_info>\n<email>[Extracted email]</email>\n<phone>[Extracted phone number]</phone>\n<address>[Extracted address]</address>\n</contact_info>\n<summary>[Extracted professional summary or objective statement]</summary>\n<work_experience>\n<job>\n<title>[Job title]</title>\n<company>[Company name]</company>\n<dates>[Employment dates]</dates>\n<responsibilities>\n<item>[Responsibility 1]</item>\n<item>[Responsibility 2]</item>\n<item>[Projects 1]</item>\n<item>[Projects 2]</item>\n[...]\n</responsibilities>\n</job>\n[Repeat for each job listed]\n</work_experience>\n<education>\n<degree>\n<name>[Degree name]</name>\n<institution>[Institution name]</institution>\n<graduation_date>[Graduation date]</graduation_date>\n</degree>\n[Repeat for each degree listed]\n</education>\n<skills>\n<item>[Skill 1]</item>\n<item>[Skill 2]</item>\n[...]\n</skills>\n<certifications_awards>\n<item>[Certification or award 1]</item>\n<item>[Certification or award 2]</item>\n[...]\n</certifications_awards>\n<languages>\n<item>[Language 1]</item>\n<item>[Language 2]</item>\n[...]\n</languages>\n<projects>\n<item>[Projects 1]</item>\n<item>[Projects 2]</item>\n[...]\n</projects>\n<projects>\n<item>[Projects 1]</item>\n<item>[Projects 2]</item>\n[...]\n</projects>\n<other_information>\n<item>[other_infromation 1]</item>\n<item>[other_infromation 2]</item>\n</other_information>\n\n</resume_info>\n\nIf any information is unclear or not present in the image, use the tag <not_found> for that specific field. For example:\n<email><not_found></email>\n\nIf a section is completely missing from the resume, omit that section from your output.\n\nRemember to maintain a professional tone and respect the privacy of the individual whose resume you are analyzing. Do not make assumptions or add information that is not explicitly stated in the resume image.\n\nProvide your extracted information within <answer> tags.";
const Home = () => {
  const [file, setFile] = useState(null);
  const [portfolio, setPortfolio] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const instructions = [
    "Upload your resume in PDF format.",
    "Let our portfolio creator generate a portfolio for you.",
    "Your created portfolio link will be available to you immediately."
  ];

  const onFileChange = (e) => {
    console.log("filechange", e.target.files)
    setFile(e.target.files[0]);
    setGenerating(true);
    onFileUpload(e.target.files[0]);
  };

  const onFileUpload = async (file) => {
    const formData = new FormData();
    console.log("file", file);
    formData.append("file", file);

    try {
      const imageResponse = await axios.post("https://portfolio-ai-9zes-cl8yls7su-subhas-projects-d50c358f.vercel.app/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Server response:", imageResponse.data);

      var inputArray = [prompt, ...imageResponse.data.images];
      // const result = await model.generateContent(inputArray);
      // console.log(result.response && result.response.text());

      const resumeContextResponse = await axios.post(
        "https://portfolio-ai-9zes-cl8yls7su-subhas-projects-d50c358f.vercel.app/extractResumeContext",
        inputArray,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      const resumeContext = resumeContextResponse.data;

      const portfolioRequest = {
        resumeContext: resumeContext,
        imageResponse: imageResponse.data.images
      }

      const portfolioResponse = await axios.post(
        "https://portfolio-ai-9zes-cl8yls7su-subhas-projects-d50c358f.vercel.app/getPortfolio",
        portfolioRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let cleanedString = portfolioResponse.data.replace(/\\n/g, "").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      console.log("🚀 ~ onFileUpload ~ cleanedString:", cleanedString)
      document.getElementById("portfolio_section").innerHTML = cleanedString;
      setPortfolio(true);

    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  return (
    <div className="container">
      <div id="portfolio_section">
      </div>
      <div className="header">
        <span className="headerTitle">Profile.ai</span>
      </div>

      {!portfolio && (
        <div>
      <div className="details">
      <div className="title">
        <span>Turn your resume into a sleek, mobile-friendly website because your future deserves more than a PDF!</span>
      </div>
      <div className="upload">
      <button className="uploadButton">
        <span>{generating? "Generating..." : "Click here to upload your resume"}</span>
        <div className="fileInputWrapper">
          <input type="file" onChange={onFileChange} />
        </div>
      </button>
      </div>

      </div>

      <div className="instructions">
      {instructions.map((instruction, index) => (
          <div className="steps">
          <span className="number">{index + 1}</span>
          <span className="description">{instruction}</span>
        </div>
        ))}
      </div>
      </div>
      )}
      
    </div>
  );
};

export default Home;

