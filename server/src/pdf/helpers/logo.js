import fs from "fs";
import path from "path";

const DEFAULT_LOGO = path.join(process.cwd(), "src", "pdf", "assets", "logo.png");

export function logoExists(logoPath = DEFAULT_LOGO) {
  try {
    return fs.existsSync(logoPath);
  } catch {
    return false;
  }
}

export function getLogoPath(customLogo) {
  if (customLogo && logoExists(customLogo)) {
    return customLogo;
  }

  if (logoExists(DEFAULT_LOGO)) {
    return DEFAULT_LOGO;
  }

  return null;
}

export function drawLogo(doc, options = {}) {
  const {
    logoPath,
    x = 30,
    y = 30,
    width = 55,
    height = 55,
  } = options;

  const finalLogo = getLogoPath(logoPath);

  if (!finalLogo) {
    return false;
  }

  try {
    doc.image(finalLogo, x, y, {
      fit: [width, height],
      align: "center",
      valign: "center",
    });

    return true;
  } catch (error) {
    console.error("Unable to load logo:", error.message);
    return false;
  }
}