const fs = require("fs");
const path = require("path");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = value.replace(/^['"]|['"]$/g, "");
  }

  return values;
}

function resolveNeoWsUrl(values) {
  const configuredUrl =
    values.NASA_NEO_WS_URL ||
    values.NASA_NEOWS_URL ||
    "https://api.nasa.gov/neo/rest/v1/feed";
  const normalizedUrl = configuredUrl.replace(/\/+$/, "");

  if (/\/neo\/rest\/v1$/i.test(normalizedUrl)) {
    return `${normalizedUrl}/feed`;
  }

  return normalizedUrl;
}

function resolveEnvironment(projectRoot, mode) {
  const fileNames =
    mode === "production"
      ? [".env", ".env.local", ".env.production"]
      : [".env", ".env.local"];
  const values = {};

  for (const fileName of fileNames) {
    Object.assign(values, readEnvFile(path.join(projectRoot, fileName)));
  }

  if (!values.NASA_API_KEY) {
    if (mode === "production") {
      throw new Error(
        "NASA_API_KEY ausente. Crie .env.production, .env.local ou .env com a chave da API da NASA.",
      );
    }

    console.warn(
      "[CONFIG] NASA_API_KEY ausente nos arquivos .env; a aplicação usará valor vazio.",
    );
  }

  return {
    production: mode === "production",
    nasaApiUrl:
      values.NASA_API_URL || "https://api.nasa.gov/planetary/apod",
    nasaNeoWsUrl: resolveNeoWsUrl(values),
    nasaInsightWeatherUrl:
      values.NASA_INSIGHT_WEATHER_URL ||
      "https://api.nasa.gov/insight_weather/",
    nasaApiKey: values.NASA_API_KEY || "",
  };
}

function serializeEnvironment(environment) {
  return `export const environment = ${JSON.stringify(environment)};\n`;
}

module.exports = { resolveEnvironment, serializeEnvironment };
