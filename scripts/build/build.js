const fs = require("fs");
const path = require("path");
const {
  resolveEnvironment,
  serializeEnvironment,
} = require("../dev/environment-config");

const projectRoot = path.resolve(__dirname, "../..");
const publicDir = path.join(projectRoot, "public");
const requestedMode = (
  process.env.NODE_ENV ||
  process.argv[2] ||
  "development"
).toLowerCase();
const selectedMode =
  requestedMode === "production" ? "production" : "development";

const environment = resolveEnvironment(projectRoot, selectedMode);

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(
  path.join(publicDir, "environment.js"),
  serializeEnvironment(environment),
  "utf8",
);

const requiredFiles = ["index.html", "index.css"];
const optionalFiles = [
  "styles/styles.css",
  "styles/design-tokens.css",
  "styles/components/header.css",
  "styles/components/footer.css",
  "styles/components/accordion.css",
  "styles/components/buttons.css",
  "styles/components/cards.css",
  "styles/components/forms.css",
  "styles/components/layout.css",
  "styles/components/search-page.css",
  "pages/apod/apod.html",
  "pages/apod/apod.css",
  "pages/apod/apod.js",
  "pages/neows/neows.html",
  "pages/neows/neows.css",
  "pages/neows/neows.js",
  "pages/insight/insight.html",
  "pages/insight/insight.css",
  "pages/insight/insight.js",
  "pages/contact/contact.html",
  "pages/contact/contact.css",
  "pages/contact/contact.js",
  "scripts/services/service.js",
  "scripts/shared/date.js",
  "scripts/shared/page-state.js",
  "scripts/shared/validation.js",
];
const filesToCopy = [...requiredFiles, ...optionalFiles];

for (const fileName of filesToCopy) {
  const sourcePath = path.join(projectRoot, fileName);
  const targetPath = path.join(publicDir, fileName);

  if (fileName.includes("..") || path.isAbsolute(fileName)) {
    throw new Error(`Caminho inválido para build: ${fileName}`);
  }

  if (!fs.existsSync(sourcePath)) {
    if (requiredFiles.includes(fileName)) {
      throw new Error(`Arquivo obrigatório ausente para build: ${sourcePath}`);
    }

    console.warn(`Arquivo ausente para build, ignorando: ${sourcePath}`);
    continue;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

console.log(`Build do ambiente ${selectedMode} concluído: ${publicDir}`);
