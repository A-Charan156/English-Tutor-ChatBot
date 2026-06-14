import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function generatePDF(topicName, content, outputDir) {
  return new Promise((resolve, reject) => {
    const fileSafeName = topicName.replace(/\s+/g, "_") + ".pdf";
    const outputPath = path.join(outputDir, fileSafeName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(22).fillColor("#2E86AB").text(topicName.toUpperCase(), { align: "center" });
    doc.moveDown();
    doc.fontSize(12).fillColor("black");

    const lines = content.split("\n");
    lines.forEach((line) => {
      if (line.trim() === "") {
        doc.moveDown(0.5);
      } else if (line.startsWith("## ")) {
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor("#A23B72").text(line.replace("## ", ""));
        doc.fontSize(12).fillColor("black");
      } else {
        doc.text(line);
      }
    });

    doc.end();

    stream.on("finish", () => {
      resolve({ filename: fileSafeName, path: outputPath });
    });
    stream.on("error", reject);
  });
}