const OpenAI = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const excel = require("exceljs");
const cosinesim = require('./utils.js');
const fileUpload = require("express-fileupload");
const PdfParse = require("pdf-parse");
const { isArray } = require("lodash");

const openai = new OpenAI({
  apiKey: "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",
});

const app = express();
const port = 8000;
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));


app.post("/", async (request, response) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: request?.body?.content }],
    model: "gpt-3.5-turbo",
  });
  response.json({ data: chatCompletion?.choices[0].message });
});

app.post("/upload", fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }), async (request, response) => {
  let files = request.files.data ;
  if(!isArray(files)){
    files = [files];
  }
  for (let i = 0; i < files.length; i++) {
    const { text } = await PdfParse(Buffer.from(files[i].data));
    const embedding = await openai.embeddings.create({
      input: text,
      model: "text-embedding-ada-002",
    });
    await writeToXl([text, embedding.data[0].embedding]);
  }
  response.status(201).json({ message: "Uploaded Successfully!" });
});

app.post("/embeddings", async (request, response) => {
  const embedding = await openai.embeddings.create({
    input: request.body?.content,
    model: "text-embedding-ada-002",
  });
  await writeToXl([request.body?.content, embedding.data[0].embedding]);
  response.send("Emeddings stored successfully");
})

app.post("/complete", async (request, response) => {
  const promptEmbedding = await openai.embeddings.create({
    input: request.body?.content,
    model: "text-embedding-ada-002",
  });
  let max = 0;
  let superText = '';
  const embeddings = await readExcelData();
  embeddings.forEach((obj) => {
    const sim = cosinesim(promptEmbedding?.data[0].embedding, obj.embedding);
    if (sim > max) {
      max = sim;
      superText = obj.text;
    }
  })
  const finalPrompt = `
  Info: ${superText}
  Question: ${request.body?.content}
  Answer:
  `;
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: finalPrompt }],
    model: "gpt-3.5-turbo",
  });
  response.json({ data: chatCompletion?.choices[0].message });
});

const writeToXl = async (content) => {
  new excel.Workbook().xlsx.readFile('data.xlsx').then((wb) => {
    const worksheet = wb.getWorksheet();
    worksheet.addRow(
      content
    );
    wb.xlsx.writeFile('data.xlsx').then(() => {
      return 'data written to excel';
    }).catch((err) => {
      throw new Error("error occurred when writing data" + err);
    });
  }).catch((err) => {
    throw new Error("error occurred when writing data" + err);
  });
}

const readExcelData = async () => {
  const wb = await new excel.Workbook().xlsx.readFile('data.xlsx');
  const worksheet = wb.getWorksheet();
  const rowsCount = worksheet.rowCount;
  if (rowsCount === 0) {
    return [];
  }
  let rows = worksheet.getRows(1, rowsCount).values();
  const embeddings = []
  for (let row of rows) {
    embeddings.push({ text: row.getCell(1), embedding: JSON.parse(row.getCell(2)) })
  }
  return embeddings;
}

app.get('/clear', (request, response) => {
  new excel.Workbook().xlsx.readFile('data.xlsx').then((wb) => {
    const worksheet = wb.getWorksheet();
    const rowsCount = worksheet.rowCount;
    worksheet.spliceRows(rowsCount, 1);
    wb.xlsx.writeFile('data.xlsx').then(() => {
      response.send('cleared');
    }).catch((err) => {
      throw new Error("error occurred when writing data" + JSON.stringify(err));
    });
  }).catch((err) => {
    response.status(400).send({ error: "error occurred when reading data => " + err });
  });
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

