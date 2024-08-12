const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const sharp = require("sharp");

const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI("AIzaSyBr6vD7y2IFUkDV9P6SxxHvWY9uE8W6UvY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Save the uploaded PDF to a temporary file
    const tempPdfPath = path.join(__dirname, "temp.pdf");
    path.resolve(process.cwd(), tempPdfPath);
    fs.writeFileSync(tempPdfPath, req.file.buffer);

    // Convert PDF to PNG images
    const outputDir = path.join(__dirname, "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    exec(
      `pdftoppm -png ${tempPdfPath} ${path.join(outputDir, "page")}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error converting PDF to images:", stderr);
          return res.status(500).send("Internal Server Error");
        }

        const imageFiles = fs
          .readdirSync(outputDir)
          .filter((file) => file.endsWith(".png"));

        const imageBuffers = imageFiles.map((file) => {
          return fs.readFileSync(path.join(outputDir, file));
        });

        fs.unlinkSync(tempPdfPath);
        imageFiles.forEach((file) => fs.unlinkSync(path.join(outputDir, file)));
        fs.rmdirSync(outputDir);

        Promise.all(
          imageBuffers.map((imageBuffer) => sharp(imageBuffer).toBuffer())
        )
          .then((processedImageBuffers) => {
            res.json({
              images: processedImageBuffers.map((buffer) =>
                buffer.toString("base64")
              ),
            });
          })
          .catch((err) => {
            console.error("Error processing images:", err);
            res.status(500).send("Internal Server Error");
          });
      }
    );
  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.getResumeContext = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send("No file uploaded");
    }

    console.log("🚀 ~ file: portfolioController.js ~ line 116 ~ exports.getResumeContext= ~ req.body", req.body);

    const result = await model.generateContent(req.body);
   
    if (result.response) {
      console.log(result.response && result.response.text());
      res.json(result.response.text());
    }

  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.getPortfolio = async (req, res) => {
  console.log("🚀 ~ file: portfolioController.js ~ line 116 ~ exports.getPortfolio= ~ req.body", req.body);
  try {
    if (!req.body) {
      return res.status(400).send("No file uploaded");
    }

    const portfolioPrompt = `
        You are a skilled web developer tasked with creating a responsive HTML, CSS, and JavaScript page for a website. Your goal is to generate clean, well-structured, and responsive code based on the given website type, content, and design inspiration. Follow these instructions carefully to complete the task.

        First, here is the type of website you need to create:
        <website_type>
        Personal Portfolio
        </website_type>

        Next, here is the content for the website:
        <content>
        ${req.body.resumeContext}
        </content>
        Here's a revised version:

        **Requirements and Guidelines for Content:**
        1. Do not alter any details related to dates, times, places of employment ,contact information, or locations.
        2. Ensure the content is informative and engaging.
        3. The content should be easy to read and understand.
        4. The content must be clear and concise.

        **Requirements and Guidelines for design:**
        1. Prioritize intuitive navigation, responsive layouts, and fast loading times to ensure a seamless user experience across all devices
        2. Design the layout to highlight key content areas, ensuring that important information, such as headlines and CTAs, is prominently displayed and easily accessible.
        3. Choose fonts and text sizes that enhance readability, with clear headings, subheadings, and ample white space to create a content hierarchy that guides users through the site.
        4. Align visual elements like images, icons, and colors with the content theme, reinforcing the message and maintaining consistency throughout the site.

        Requirements and guidelines:
        1. Create a single-page application (SPA)
        2. Implement scroll animations
        3. Include interactive elements
        4. Write clean, well-structured, and commented code
        5. Ensure the design is responsive and works well on various screen sizes
        6. Use semantic HTML5 elements where appropriate
        7. Implement modern CSS techniques, including flexbox or grid for layout
        8. Generate CSS that is optimized for mobile devices and inline code for css classes
        9. Utilize JavaScript for dynamic content and interactivity
        10.Write efficient JavaScript code, using ES6+ features where applicable
        11.Rember each section should be a page in the website
        12.Consider accessibility and cross-browser compatibility in your implementation
        13.Generate JavaScript code that includes more animations and transitions for the website

        Provide your code in the following format:
        <html>
        <!-- Your HTML code here -->
        </html>
        
        Remember to base your code on the provided website type, content, and design inspiration. Do not include any explanations or comments outside of the code blocks. Your entire response should consist only of the HTML, CSS, and JavaScript code within their respective tags.
        `;

    const result = await model.generateContent(portfolioPrompt);

    if (result.response) {
      res.json(result.response.text());
    }
  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).send("Internal Server Error");
  }
};