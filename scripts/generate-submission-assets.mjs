import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");

const W = 1284;
const H = 2778;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lines(text, maxChars) {
  const words = text.split(" ");
  const result = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result;
}

function paperFrame(content, bg = "#fbf7ef") {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <defs>
      <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="2" fill="#1f1305" opacity=".08"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#dots)"/>
    ${content}
  </svg>`;
}

function header(title, subtitle) {
  const subtitleLines = lines(subtitle, 30);
  return `
    <text x="66" y="118" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#1f1305">Base Guestbook</text>
    <text x="66" y="250" font-family="Georgia, serif" font-size="104" font-weight="700" fill="#1f1305">${esc(title)}</text>
    ${subtitleLines.map((line, index) => `<text x="70" y="${334 + index * 46}" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#6d5b49">${esc(line)}</text>`).join("")}
  `;
}

function pill(x, y, text, fill = "#fff", fg = "#1f1305") {
  return `
    <rect x="${x}" y="${y}" rx="27" ry="27" width="${text.length * 16 + 64}" height="54" fill="${fill}" stroke="#1f1305" stroke-width="3"/>
    <text x="${x + 32}" y="${y + 35}" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="${fg}">${esc(text)}</text>
  `;
}

function noteCard(x, y, width, height, name, message, date, color) {
  const msgLines = lines(message, 24).slice(0, 4);
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="28" fill="${color}" stroke="#1f1305" stroke-width="4"/>
      <text x="${x + 30}" y="${y + 60}" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#1f1305">${esc(name)}</text>
      <text x="${x + width - 120}" y="${y + 58}" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#6d5b49">${esc(date)}</text>
      ${msgLines.map((line, index) => `<text x="${x + 30}" y="${y + 120 + index * 42}" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#2e2011">${esc(line)}</text>`).join("")}
    </g>
  `;
}

function field(x, y, width, label, value, height = 112) {
  return `
    <text x="${x}" y="${y - 14}" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#8b5e1f">${esc(label)}</text>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="#fffaf4" stroke="#1f1305" stroke-width="4"/>
    <text x="${x + 26}" y="${y + 68}" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#1f1305">${esc(value)}</text>
  `;
}

function button(x, y, width, text, fill, fg = "#1f1305") {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="94" rx="47" fill="${fill}" stroke="#1f1305" stroke-width="4"/>
    <text x="${x + width / 2}" y="${y + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="31" font-weight="900" fill="${fg}">${esc(text)}</text>
  `;
}

function screenshot1() {
  const content = `
    ${header("Leave a note.", "A simple guestbook for Base. Type a short message and add it to the public wall.")}
    ${pill(68, 416, "Mobile-first social action", "#f9df8f")}
    ${field(68, 560, 540, "Display name", "Base Friend")}
    ${field(68, 730, 1148, "Message", "Love seeing builders leave a mark on Base.", 178)}
    ${button(68, 958, 1148, "Sign guestbook", "#1f1305", "#fff")}
    <text x="68" y="1126" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#1f1305">Recent notes</text>
    ${noteCard(68, 1180, 540, 294, "Ava", "Base feels more human when apps make it easy to leave a trace.", "May 12", "#f9df8f")}
    ${noteCard(676, 1180, 540, 294, "Noah", "Signing a public guestbook is a tiny action that still feels alive.", "May 12", "#bfdcf6")}
    ${noteCard(68, 1516, 1148, 310, "Mira", "This wall is for launches, meetups, experiments, and the people who show up for them.", "May 11", "#f6c8db")}
    ${noteCard(68, 1870, 540, 294, "Theo", "Short notes. Real wallets. Clear context.", "May 11", "#cde8c9")}
    ${noteCard(676, 1870, 540, 294, "Jin", "Perfect for Base App because the action is obvious.", "May 11", "#f3d4b5")}
    ${button(68, 2522, 1148, "Connect wallet to add your note", "#f9df8f")}
  `;
  return paperFrame(content);
}

function screenshot2() {
  const content = `
    ${header("Signed in.", "Connected wallet, ready to publish a short message directly on Base.")}
    ${pill(68, 416, "0x9936...9652 connected", "#1f1305", "#fff")}
    ${pill(390, 416, "Base mainnet", "#cde8c9")}
    ${field(68, 556, 510, "Display name", "Base Builder")}
    ${field(606, 556, 610, "Wallet", "0x9936...9652")}
    ${field(68, 726, 1148, "Message", "Congrats on the launch. This guestbook makes Base feel like a room people can actually walk into.", 194)}
    ${button(68, 970, 1148, "Confirm guestbook signature", "#1f1305", "#fff")}
    <rect x="68" y="1118" width="1148" height="252" rx="34" fill="#1f1305"/>
    <text x="106" y="1202" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="#f9df8f">Sign status</text>
    <text x="106" y="1276" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#fff">Wallet signature requested. Confirm to publish your note onchain.</text>
    ${noteCard(68, 1424, 540, 302, "Lena", "Guestbooks work because everybody understands them instantly.", "May 12", "#f9df8f")}
    ${noteCard(676, 1424, 540, 302, "Omar", "A Base app does not need to be complicated to feel meaningful.", "May 12", "#bfdcf6")}
    ${noteCard(68, 1772, 1148, 346, "Rin", "The nicest social products often begin with one tiny ritual and a wall that remembers it.", "May 11", "#cde8c9")}
    ${button(68, 2522, 1148, "Base guestbook ready", "#f6c8db")}
  `;
  return paperFrame(content, "#fff8f1");
}

function screenshot3() {
  const content = `
    ${header("The wall updates live.", "Every note becomes a recent onchain entry with a name, wallet, and timestamp.")}
    ${pill(68, 414, "Entry confirmed", "#cde8c9")}
    ${pill(302, 414, "Transaction on Base", "#1f1305", "#fff")}
    <rect x="68" y="548" width="1148" height="228" rx="34" fill="#1f1305"/>
    <text x="108" y="628" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#f9df8f">Latest signature</text>
    <text x="108" y="700" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="#fff">"Congrats on the launch. This guestbook makes Base feel like a room."</text>
    ${noteCard(68, 848, 540, 306, "Base Builder", "Congrats on the launch. This guestbook makes Base feel like a room.", "May 12", "#f9df8f")}
    ${noteCard(676, 848, 540, 306, "Mika", "A living wall works well inside the app browser because there is no explanation gap.", "May 12", "#f6c8db")}
    ${noteCard(68, 1202, 540, 306, "Tariq", "Lightweight chain actions are easier to trust and more fun to repeat.", "May 12", "#bfdcf6")}
    ${noteCard(676, 1202, 540, 306, "Aya", "This is the kind of social primitive that can belong to launches, communities, and meetups.", "May 11", "#cde8c9")}
    ${noteCard(68, 1556, 1148, 356, "Jo", "A good Base app should feel understandable in two seconds. Name, note, sign. That is the whole story.", "May 11", "#f3d4b5")}
    <rect x="68" y="1964" width="1148" height="306" rx="34" fill="#fff" stroke="#1f1305" stroke-width="4"/>
    <text x="106" y="2040" font-family="Georgia, serif" font-size="42" font-weight="700" fill="#1f1305">Why it works</text>
    <text x="106" y="2110" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#5d4a34">Clear action, low friction, public result, and obvious mobile fit.</text>
    <text x="106" y="2170" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#5d4a34">Builder Code attribution is attached to the signature transaction.</text>
    ${button(68, 2522, 1148, "Share the guestbook", "#1f1305", "#fff")}
  `;
  return paperFrame(content, "#fdf4ea");
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#fbf7ef"/>
    <rect x="136" y="136" width="752" height="752" rx="80" fill="#fffaf4" stroke="#1f1305" stroke-width="28"/>
    <rect x="204" y="222" width="616" height="104" rx="28" fill="#1f1305"/>
    <text x="512" y="289" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="#fff">GUESTBOOK</text>
    <rect x="204" y="382" width="420" height="224" rx="28" fill="#f9df8f" stroke="#1f1305" stroke-width="18"/>
    <rect x="658" y="382" width="162" height="162" rx="24" fill="#bfdcf6" stroke="#1f1305" stroke-width="18"/>
    <rect x="204" y="654" width="616" height="52" rx="20" fill="#f6c8db"/>
    <rect x="204" y="738" width="486" height="52" rx="20" fill="#cde8c9"/>
    <path d="M724 676l84 84" stroke="#1f1305" stroke-width="20" stroke-linecap="round"/>
    <path d="M714 780l110-110" stroke="#1f1305" stroke-width="20" stroke-linecap="round"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="#fbf7ef"/>
    <defs>
      <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="2" fill="#1f1305" opacity=".08"/>
      </pattern>
    </defs>
    <rect width="1910" height="1000" fill="url(#dots)"/>
    <text x="96" y="206" font-family="Georgia, serif" font-size="118" font-weight="700" fill="#1f1305">Base Guestbook</text>
    <text x="100" y="302" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#5d4a34">Write a short message on Base and add your name to a public wall.</text>
    ${pill(100, 358, "Simple onchain social action", "#f9df8f")}
    ${button(100, 456, 430, "Write a note", "#1f1305", "#fff")}
    ${button(566, 456, 430, "Sign on Base", "#f9df8f")}
    ${noteCard(1220, 110, 588, 260, "Ava", "Base feels more human when apps make it easy to leave a trace.", "May 12", "#f9df8f")}
    ${noteCard(1116, 420, 694, 250, "Noah", "A guestbook is simple, readable, and easy to understand inside the app browser.", "May 12", "#bfdcf6")}
    ${noteCard(1220, 714, 588, 190, "Mira", "Name, message, sign.", "May 11", "#f6c8db")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(
  join(outDir, "asset-manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      files: files.map((file) => file.replace(`${root}/`, "")),
      screenshotSize: "1284x2778",
      thumbnailAspectRatio: "1.91:1",
    },
    null,
    2,
  ),
);

console.log(files.join("\n"));
