import { NasaService } from "../../scripts/services/service.js";
import {
  getCurrentMonthStart,
  getLastAvailableDate,
  parseDateValue,
  validateDateRange,
  formatDate,
  showInitialCard,
  enforceDateBounds,
  createDataPageController,
  sanitizeHTML,
  escapeHTML,
  extractMediaUrl,
  getSafeMediaUrl,
} from "../../scripts/shared/index.js";

const nasaService = new NasaService();
const requestDataOutput = document.getElementById("get-data-response");
const updateDataButton = document.getElementById("update-data");
const updateDataOutput = document.getElementById("update-data-response");
const resultsList = document.getElementById("results-list");
const initialCard = document.getElementById("card");
requestDataOutput.textContent = "";
updateDataOutput.textContent = "";

/**
 * Renderiza a mídia de acordo com o tipo retornado pela API.
 * Suporta imagens e vídeos.
 */
function renderMedia(item) {
  const extractedMediaUrl = extractMediaUrl(item);
  const mediaType = item.media_type || "image";

  if (mediaType === "video") {
    return renderVideo(item, extractedMediaUrl);
  }

  if (mediaType === "image") {
    return renderImage(item, extractedMediaUrl);
  }

  return `
    <p class="media-error">
      Tipo de mídia não suportado.
    </p>
  `;
}

/**
 * Renderiza o elemento de mídia de vídeo.
 */
function renderVideo(item, extractedMediaUrl) {
  const mediaUrl = getSafeMediaUrl(item.media_url || extractedMediaUrl);

  if (!mediaUrl) {
    return `
        <p class="media-error">
          Não foi possível carregar o vídeo.
        </p>
      `;
  }

  return `
      <video
      class="result-video"
        controls
        preload="metadata"
        title="${escapeHTML(item.title || "Vídeo da NASA")}"
      >
        <source
          src="${escapeHTML(mediaUrl)}"
          type="video/mp4"
        />
        Seu navegador não suporta a reprodução de vídeos.
      </video>
    `;
}

/**
 * Renderiza o elemento de mídia de imagem.
 */
function renderImage(item, extractedMediaUrl) {
  const imageUrl = getSafeMediaUrl(item.hdurl || extractedMediaUrl);

  if (!imageUrl) {
    return `
      <p class="media-error">
        Não foi possível carregar a imagem.
      </p>
    `;
  }

  return `
    <img
     class="result-image"
      src="${escapeHTML(imageUrl)}"
      alt="${escapeHTML(
        item.alt || item.title || "Imagem astronômica da NASA",
      )}"
      loading="lazy"
    />
  `;
}

/**
 * Renderiza os cards com os resultados retornados pela API.
 */
function renderData(items) {
  const collection = Array.isArray(items) ? items : [items];

  if (!collection.length) {
    throw new Error("Nenhum dado encontrado para o período informado.");
  }

  resultsList.classList.remove("hidden");
  resultsList.innerHTML = collection
    .map(
      (item) => `
        <article class="card">
          <div class="text-block">
            <h3>${escapeHTML(item.title || "Sem título")}</h3>

            <p class="date">
              ${escapeHTML(formatDate(item.date || ""))}
            </p>

            <div class="description">
              ${sanitizeHTML(item.explanation || "Sem descrição disponível.")}
            </div>

            <div class="media">
              ${renderMedia(item)}
            </div>

          </div>
        
        </article>
      `,
    )
    .join("");

  resultsList.focus();
}

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
/**
 * Configura os limites e os valores iniciais dos campos de data.
 * Data mínima: definida pelo helper getCurrentMonthStart().
 * Data máxima: ontem, definida pelo helper getLastAvailableDate().
 * Valores iniciais: último dia disponível.
 */
function setDefaultDateRange() {
  const minDate = getCurrentMonthStart();
  const maxDate = getLastAvailableDate();

  startDateInput.min = minDate;
  startDateInput.max = maxDate;

  endDateInput.min = minDate;
  endDateInput.max = maxDate;

  startDateInput.value = maxDate;
  endDateInput.value = maxDate;
}

/**
 * Aplica os limites permitidos ao campo de data informado.
 */
function validateDateInput(input) {
  enforceDateBounds({
    input,
    minDateValue: getCurrentMonthStart(),
    maxDateValue: getLastAvailableDate(),
  });
}

/**
 * Inicializa os eventos da página.
 */
document.addEventListener("DOMContentLoaded", () => {
  setDefaultDateRange();

  showInitialCard({
    initialCard,
    resultsList,
  });

  startDateInput.addEventListener("change", () => {
    validateDateInput(startDateInput);
  });

  endDateInput.addEventListener("change", () => {
    validateDateInput(endDateInput);
  });
});

/**
 * Inicializa os evento de carregamento de dados ao clicar no botão.
 */
updateDataButton.addEventListener("click", () => {
  getData();
});

/**
 * Busca os registros da NASA para o período selecionado.
 */
async function getData() {
  await dataPageController.runLoad({
    loadData: async () => {
      const selectedStartDate = startDateInput.value;
      const selectedEndDate = endDateInput.value;

      if (!selectedStartDate || !selectedEndDate) {
        throw new Error("Selecione as datas inicial e final.");
      }

      // Reaplica os limites antes de realizar a requisição.
      validateDateInput(startDateInput);
      validateDateInput(endDateInput);

      const startDate = parseDateValue(startDateInput.value);
      const endDate = parseDateValue(endDateInput.value);

      // Verifica se o intervalo informado é válido.
      validateDateRange(startDate, endDate);
      return nasaService.getPhotoOfTheDay(startDate, endDate);
    },

    renderResult: (data) => renderData(data),

    fallbackMessage:
      "Falha na requisição. Verifique sua conexão com a internet e tente novamente.",
  });
}

const dataPageController = createDataPageController({
  requestDataOutput,
  updateDataOutput,
  button: updateDataButton,
  resultsList,
  initialCard,
  loggerLabel: "Erro ao carregar APOD:",
});
