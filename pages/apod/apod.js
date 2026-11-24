import { NasaService } from "../../scripts/services/service.js";
import { createDataPageController } from "../../scripts/shared/data-workflow.js";
import { getLastAvailableDate } from "../../scripts/shared/date.js";

const FIRST_APOD_DATE = "2026-10-12";
const MAX_DAYS = 30;

const nasaService = new NasaService();

const form = document.querySelector("#apod-form");
const button = form.querySelector("button");
const startDateField = document.querySelector("#start-date");
const endDateField = document.querySelector("#end-date");
const statusElement = document.querySelector("#apod-status");
const resultContainer = document.querySelector("#apod-result");

// Limitar as datas que podem ser escolhidas no calendário
startDateField.min = FIRST_APOD_DATE;
endDateField.min = FIRST_APOD_DATE;
startDateField.max = getLastAvailableDate();
endDateField.max = getLastAvailableDate();

const dataPageController = createDataPageController({
  requestDataOutput: statusElement,
  updateDataOutput: statusElement,
  button,
  resultsList: resultContainer,
  loggerLabel: "[APOD]",
});

// Calcular quantos dias tem o intervalo
function countDays(startDate, endDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  return (new Date(endDate) - new Date(startDate)) / oneDay + 1;
}

// Buscar dados da API da NASA
async function getData() {
  await dataPageController.runLoad({
    loadData: async () => {
      // Obter as datas (o input type="date" já devolve "AAAA-MM-DD")
      const startDate = startDateField.value;
      const endDate = endDateField.value;
      const lastDate = getLastAvailableDate();

      // Verificar se o intervalo de datas é válido
      if (startDate < FIRST_APOD_DATE || endDate < FIRST_APOD_DATE) {
        throw new Error("A data mínima permitida é 12/10/2026.");
      }

      if (startDate > lastDate || endDate > lastDate) {
        throw new Error("Não é possível buscar datas futuras.");
      }

      if (endDate < startDate) {
        throw new Error("A data final não pode ser anterior à data inicial.");
      }

      if (countDays(startDate, endDate) > MAX_DAYS) {
        throw new Error(`Escolha um intervalo de até ${MAX_DAYS} dias.`);
      }

      // Buscar dados na API
      const data = await nasaService.getPhotoOfTheDay(startDate, endDate);

      // Garantir que os dados estejam em um array
      const collection = Array.isArray(data) ? data : [data];

      // Verificar se existem resultados
      if (!collection.length) {
        throw new Error("Nenhuma imagem encontrada para o período informado.");
      }

      return collection;
    },

    renderResult: (data) => {
      renderData(data);
    },

    fallbackMessage:
      "Falha na requisição. Verifique sua internet e tente novamente.",
  });
}

// Montar a mídia de acordo com o tipo (imagem, vídeo ou outro)
function createMedia(item) {
  if (item.media_type === "image") {
    const image = document.createElement("img");
    image.src = item.url;
    image.alt = item.title;
    image.loading = "lazy";
    return image;
  }

  if (item.media_type === "video" && item.url) {
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Ver vídeo";
    return link;
  }

  const notice = document.createElement("p");
  notice.textContent = "Mídia não disponível para este dia.";
  return notice;
}

// Montar os cards na tela
function renderData(data) {
  resultContainer.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("article");
    card.className = "apod-card";

    const title = document.createElement("h2");
    title.textContent = item.title;

    const date = document.createElement("p");
    date.textContent = item.date.split("-").reverse().join("/");

    const explanation = document.createElement("p");
    explanation.textContent = item.explanation;

    card.append(title, date, createMedia(item), explanation);
    resultContainer.append(card);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  getData();
});
