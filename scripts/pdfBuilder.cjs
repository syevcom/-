const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

async function createBrandPdf(config) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const regularFontBytes = fs.readFileSync('fonts/NanumGothic.ttf');
  const boldFontBytes = fs.readFileSync('fonts/NanumGothicBold.ttf');
  const regularFont = await doc.embedFont(regularFontBytes);
  const boldFont = await doc.embedFont(boldFontBytes);

  // Colors
  const primaryColor = rgb(...config.themeColor);
  const darkBg = rgb(0.07, 0.1, 0.15);
  const lightBg = rgb(0.96, 0.98, 0.99);
  const textDark = rgb(0.12, 0.14, 0.18);
  const textGray = rgb(0.4, 0.45, 0.52);
  const white = rgb(1, 1, 1);
  const accentGold = rgb(0.92, 0.72, 0.15);
  const borderGray = rgb(0.85, 0.88, 0.92);

  const W = 841.89; // A4 Landscape
  const H = 595.28;

  // 1. Cover Page
  const cover = doc.addPage([W, H]);
  // Cover Background
  cover.drawRectangle({
    x: 0,
    y: 0,
    width: W,
    height: H,
    color: darkBg,
  });

  // Gradient / Accent Strip
  cover.drawRectangle({
    x: 0,
    y: H - 8,
    width: W,
    height: 8,
    color: primaryColor,
  });

  // Brand Badge
  cover.drawRectangle({
    x: 60,
    y: H - 100,
    width: 220,
    height: 36,
    color: primaryColor,
  });
  cover.drawText(config.brandBadge, {
    x: 75,
    y: H - 76,
    size: 15,
    font: boldFont,
    color: white,
  });

  // Title
  cover.drawText(config.title, {
    x: 60,
    y: H - 180,
    size: 34,
    font: boldFont,
    color: white,
  });

  // Subtitle
  cover.drawText(config.subtitle, {
    x: 60,
    y: H - 230,
    size: 18,
    font: regularFont,
    color: rgb(0.8, 0.85, 0.9),
  });

  // Highlight points on cover
  if (config.coverHighlights && config.coverHighlights.length > 0) {
    let hlY = H - 300;
    config.coverHighlights.forEach((hl) => {
      cover.drawRectangle({
        x: 60,
        y: hlY - 5,
        width: W - 120,
        height: 40,
        color: rgb(0.12, 0.16, 0.23),
        borderColor: rgb(0.2, 0.26, 0.35),
        borderWidth: 1,
      });
      cover.drawText(`✓ ${hl}`, {
        x: 80,
        y: hlY + 10,
        size: 14,
        font: boldFont,
        color: primaryColor,
      });
      hlY -= 52;
    });
  }

  // Cover Footer
  cover.drawText(`${config.companyName} | 공식 제안서 및 카탈로그`, {
    x: 60,
    y: 45,
    size: 12,
    font: boldFont,
    color: rgb(0.6, 0.65, 0.7),
  });
  cover.drawText('Copyright ⓒ All Rights Reserved.', {
    x: W - 280,
    y: 45,
    size: 11,
    font: regularFont,
    color: rgb(0.5, 0.55, 0.6),
  });

  // Content Pages
  config.pages.forEach((pageData, pageIdx) => {
    const page = doc.addPage([W, H]);

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: W,
      height: H,
      color: lightBg,
    });

    // Top Header Banner
    page.drawRectangle({
      x: 0,
      y: H - 65,
      width: W,
      height: 65,
      color: white,
      borderColor: borderGray,
      borderWidth: 1,
    });
    page.drawRectangle({
      x: 0,
      y: H - 5,
      width: W,
      height: 5,
      color: primaryColor,
    });

    // Header Title
    page.drawText(config.companyName, {
      x: 50,
      y: H - 38,
      size: 13,
      font: boldFont,
      color: primaryColor,
    });
    page.drawText(`|  ${pageData.sectionTitle}`, {
      x: 50 + config.companyName.length * 12 + 10,
      y: H - 38,
      size: 13,
      font: regularFont,
      color: textGray,
    });

    // Page Subject Heading
    page.drawText(pageData.heading, {
      x: 50,
      y: H - 110,
      size: 24,
      font: boldFont,
      color: textDark,
    });
    if (pageData.subHeading) {
      page.drawText(pageData.subHeading, {
        x: 50,
        y: H - 135,
        size: 13,
        font: regularFont,
        color: textGray,
      });
    }

    // Main Content Cards / Sections
    if (pageData.cards && pageData.cards.length > 0) {
      const cardCount = pageData.cards.length;
      const gap = 16;
      const totalWidth = W - 100;
      const cardWidth = (totalWidth - (cardCount - 1) * gap) / cardCount;
      const cardY = 100;
      const cardHeight = H - 260;

      pageData.cards.forEach((card, cIdx) => {
        const cardX = 50 + cIdx * (cardWidth + gap);

        // Card Container
        page.drawRectangle({
          x: cardX,
          y: cardY,
          width: cardWidth,
          height: cardHeight,
          color: white,
          borderColor: borderGray,
          borderWidth: 1,
        });

        // Top accent line on card
        page.drawRectangle({
          x: cardX,
          y: cardY + cardHeight - 4,
          width: cardWidth,
          height: 4,
          color: primaryColor,
        });

        // Card Title
        page.drawText(card.title, {
          x: cardX + 16,
          y: cardY + cardHeight - 35,
          size: 16,
          font: boldFont,
          color: textDark,
        });

        if (card.subtitle) {
          page.drawText(card.subtitle, {
            x: cardX + 16,
            y: cardY + cardHeight - 55,
            size: 11,
            font: regularFont,
            color: primaryColor,
          });
        }

        // Card Items
        let itemY = cardY + cardHeight - 85;
        if (card.items && card.items.length > 0) {
          card.items.forEach((item) => {
            if (itemY > cardY + 20) {
              page.drawText(`• ${item}`, {
                x: cardX + 16,
                y: itemY,
                size: 12,
                font: regularFont,
                color: textDark,
              });
              itemY -= 28;
            }
          });
        }

        // Card Key Value pairs / Table
        if (card.specs && card.specs.length > 0) {
          let specY = cardY + cardHeight - 80;
          card.specs.forEach((sp) => {
            if (specY > cardY + 20) {
              page.drawRectangle({
                x: cardX + 12,
                y: specY - 6,
                width: cardWidth - 24,
                height: 24,
                color: rgb(0.97, 0.98, 0.99),
                borderColor: borderGray,
                borderWidth: 0.5,
              });
              page.drawText(sp.key, {
                x: cardX + 18,
                y: specY,
                size: 11,
                font: boldFont,
                color: textGray,
              });
              page.drawText(sp.value, {
                x: cardX + cardWidth * 0.42,
                y: specY,
                size: 11,
                font: regularFont,
                color: textDark,
              });
              specY -= 30;
            }
          });
        }
      });
    }

    // Optional Highlights Banner on content page
    if (pageData.bannerText) {
      page.drawRectangle({
        x: 50,
        y: 60,
        width: W - 100,
        height: 38,
        color: rgb(0.92, 0.96, 0.94),
        borderColor: primaryColor,
        borderWidth: 1,
      });
      page.drawText(`★  ${pageData.bannerText}`, {
        x: 65,
        y: 74,
        size: 12,
        font: boldFont,
        color: primaryColor,
      });
    }

    // Page Footer
    page.drawText(`${config.companyName} | ${config.title}`, {
      x: 50,
      y: 25,
      size: 10,
      font: regularFont,
      color: textGray,
    });
    page.drawText(`${pageIdx + 2} / ${config.pages.length + 1}`, {
      x: W - 90,
      y: 25,
      size: 10,
      font: boldFont,
      color: textDark,
    });
  });

  const pdfBytes = await doc.save();
  const filePath = path.join('public/catalogs', config.fileName);
  fs.writeFileSync(filePath, pdfBytes);
  // Also copy to root public/ for easy fallback
  fs.writeFileSync(path.join('public', config.fileName), pdfBytes);
  console.log(`Saved: ${filePath} (${pdfBytes.length} bytes)`);
  return filePath;
}

module.exports = { createBrandPdf };
