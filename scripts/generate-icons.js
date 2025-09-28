// Simple icon generator for PWA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icons directory
const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Simple SVG icon template
const createIconSVG = size => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#026d56" rx="${size * 0.1}"/>
  <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.08}" fill="white"/>
  <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.08}" fill="white"/>
  <circle cx="${size * 0.3}" cy="${size * 0.7}" r="${size * 0.08}" fill="white"/>
  <circle cx="${size * 0.7}" cy="${size * 0.7}" r="${size * 0.08}" fill="white"/>
  <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.6}" height="${size * 0.1}" fill="white" rx="${size * 0.05}"/>
  <text x="${size * 0.5}" y="${size * 0.6}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold">NM</text>
</svg>
`;

// Generate icons
sizes.forEach(size => {
  const svg = createIconSVG(size);

  // For now, we'll create SVG files and let the user convert them to PNG
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgFilepath = path.join(iconsDir, svgFilename);

  fs.writeFileSync(svgFilepath, svg);
});
