// Create simple PNG icons for PWA
/* eslint-env node */
import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "../public/icons");

// Create icons directory
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#026d56";
  ctx.fillRect(0, 0, size, size);

  // Rounded corners
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.1);
  ctx.fill();

  // Reset composite operation
  ctx.globalCompositeOperation = "source-over";

  // Draw network monitoring icon
  ctx.fillStyle = "white";

  // Draw 4 dots representing network nodes
  const dotSize = size * 0.08;
  const margin = size * 0.2;

  // Top left
  ctx.beginPath();
  ctx.arc(margin, margin, dotSize, 0, 2 * Math.PI);
  ctx.fill();

  // Top right
  ctx.beginPath();
  ctx.arc(size - margin, margin, dotSize, 0, 2 * Math.PI);
  ctx.fill();

  // Bottom left
  ctx.beginPath();
  ctx.arc(margin, size - margin, dotSize, 0, 2 * Math.PI);
  ctx.fill();

  // Bottom right
  ctx.beginPath();
  ctx.arc(size - margin, size - margin, dotSize, 0, 2 * Math.PI);
  ctx.fill();

  // Draw connection lines
  ctx.strokeStyle = "white";
  ctx.lineWidth = size * 0.02;

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(margin, size * 0.5);
  ctx.lineTo(size - margin, size * 0.5);
  ctx.stroke();

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(size * 0.5, margin);
  ctx.lineTo(size * 0.5, size - margin);
  ctx.stroke();

  // Add "NM" text
  ctx.fillStyle = "white";
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NM", size * 0.5, size * 0.5);

  // Save as PNG
  const buffer = canvas.toBuffer("image/png");
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, buffer);
  console.log(`Generated ${filename}`);
});

console.log("All icons generated successfully!");
