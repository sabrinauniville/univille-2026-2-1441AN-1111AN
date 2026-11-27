import { NasaService } from "../../scripts/services/service.js";
import {
  getDateOffset,
  getLastAvailableDate,
  parseDateValue,
  toIsoDateValue,
  validateDateRange,
  formatDayLabel,
  createPageStatus,
  showInitialCard,
  enforceDateBounds,
  createDataPageController,
} from "../../scripts/shared/index.js";

const nasaService = new NasaService();

const titleElement = document.getElementById("featured-weather-title");
const dateElement = document.getElementById("featured-weather-date");
const descriptionElement = document.getElementById(
  "featured-weather-description",
);
const requestDataOutput = document.getElementById("get-data-response");
const updateDataButton = document.getElementById("update-data");
const updateDataOutput = document.getElementById("update-data-response");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const resultsList = document.getElementById("results-list");
const initialCard = document.getElementById("featured-weather");

const hasDateInputs = Boolean(startDateInput && endDateInput);

let statusMessage = "";
requestDataOutput.textContent = statusMessage;
updateDataOutput.textContent = "";

function setDefaultDateRange() {
  if (!hasDateInputs) {
    return;
  }

  startDateInput.value = getDateOffset(-6);
  endDateInput.value = getLastAvailableDate();
  startDateInput.min = "2014-01-01";
  startDateInput.max = getLastAvailableDate();
  endDateInput.min = "2014-01-01";
  endDateInput.max = getLastAvailableDate();
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const normalizedDate = dateString.includes("T")
    ? dateString
    : `${dateString}T00:00:00`;

  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function formatTime(dateString) {
  if (!dateString) {
    return "";
  }

  const normalizedDate = dateString.includes("T")
    ? dateString
    : `${dateString}T00:00:00`;

  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    timeStyle: "medium",
  }).format(date);
}

function normalizeItems(data) {
  const solKeys = Array.isArray(data?.sol_keys) ? data.sol_keys : [];

  return solKeys
    .map((sol) => ({ sol, ...data[sol] }))
    .filter((item) => item && Object.keys(item).length > 0)
    .sort((a, b) => Number(a.sol) - Number(b.sol));
}

function renderFeaturedWeather(item) {
  const temperature = item.AT?.av ?? "N/D";
  const pressure = item.PRE?.av ?? "N/D";
  const wind = item.HWS?.av ?? "N/D";

  titleElement.textContent = `Sol ${item.sol}`;
  dateElement.innerHTML = `<strong>Primeira medição:</strong> ${formatDate(item.First_UTC)}`;
  descriptionElement.innerHTML = `
    <p><strong>Temperatura média:</strong> ${temperature} °C</p>
    <p><strong>Pressão média:</strong> ${pressure} Pa</p>
    <p><strong>Velocidade média do vento:</strong> ${wind} m/s</p>
  `;
  initialCard.classList.remove("hidden");
  initialCard.focus();
}

function buildRangeSummaryLabel(items) {
  if (!Array.isArray(items) || !items.length) {
    return "dados disponíveis";
  }

  const firstDate = items[0]?.First_UTC ? items[0].First_UTC : null;
  const lastDate = items[items.length - 1]?.First_UTC
    ? items[items.length - 1].First_UTC
    : null;

  if (!firstDate || !lastDate) {
    return "dados disponíveis";
  }

  return `${formatDate(firstDate)} até ${formatDate(lastDate)}`;
}

function renderCards(items) {
  const collection = Array.isArray(items) ? items : [items];

  if (!collection.length) {
    throw new Error(
      "Nenhum dado meteorológico encontrado para o período informado.",
    );
  }

  const firstItem = collection[0];
  renderFeaturedWeather(firstItem);

  const groupedByDay = new Map();

  collection.slice(1).forEach((item) => {
    const utcDate = item.First_UTC ? new Date(item.First_UTC) : null;
    const key = utcDate ? toIsoDateValue(utcDate) : "sem-data";

    if (!groupedByDay.has(key)) {
      groupedByDay.set(key, []);
    }

    groupedByDay.get(key).push(item);
  });

  const days = [...groupedByDay.entries()];

  resultsList.classList.remove("hidden");

  if (!days.length) {
    resultsList.innerHTML =
      "<p class='empty-state'>Nenhum sol encontrado para o período selecionado.</p>";
    return;
  }

  resultsList.innerHTML = days
    .map(([dayKey, dayItems]) => {
      const dayLabel = formatDayLabel(`${dayKey}T00:00:00Z`);

      const content = dayItems
        .map((item) => {
          const temperature = item.AT?.av ?? "N/D";
          const pressure = item.PRE?.av ?? "N/D";
          const wind = item.HWS?.av ?? "N/D";

          return `
            <article class="article">
              <div class="text-block">
                <h3>Sol ${item.sol}</h3>
                <p class="date"><strong>Horário:</strong> ${formatTime(item.First_UTC)}</p>
                <p><strong>Temperatura média:</strong> ${temperature} °C</p>
                <p><strong>Pressão média:</strong> ${pressure} Pa</p>
                <p><strong>Velocidade do vento:</strong> ${wind} m/s</p>
              </div>
            </article>
          `;
        })
        .join("");

      return `
        <details class="accordion" ${days.length === 1 ? "open" : ""}>
          <summary>${dayLabel}</summary>
          <div class="accordion-content">${content}</div>
        </details>
      `;
    })
    .join("");
}

const { updateStatus, clearErrorState } = createPageStatus({
  statusOutput: requestDataOutput,
  updateOutput: updateDataOutput,
});
const dataPageController = createDataPageController({
  requestDataOutput,
  updateDataOutput,
  button: updateDataButton,
  resultsList,
  initialCard,
  loggerLabel: "Erro ao carregar clima InSight:",
});
updateStatus(statusMessage);

document.addEventListener("DOMContentLoaded", () => {
  setDefaultDateRange();
  showInitialCard({ initialCard, resultsList });

  if (hasDateInputs) {
    startDateInput.addEventListener("change", () =>
      enforceDateBounds({
        input: startDateInput,
        minDateValue: "2014-01-01",
        maxDateValue: getLastAvailableDate(),
      }),
    );
    endDateInput.addEventListener("change", () =>
      enforceDateBounds({
        input: endDateInput,
        minDateValue: "2014-01-01",
        maxDateValue: getLastAvailableDate(),
      }),
    );
  }

  updateDataButton.addEventListener("click", () => {
    loadWeather();
  });
});

async function loadWeather() {
  await dataPageController.runLoad({
    loadData: async () => {
      const selectedStartDate = hasDateInputs ? startDateInput.value : "";
      const selectedEndDate = hasDateInputs ? endDateInput.value : "";

      const startDate = parseDateValue(selectedStartDate);
      const endDate = parseDateValue(selectedEndDate);
      validateDateRange(startDate, endDate);

      const data = await nasaService.getInsightWeather(startDate, endDate);
      const allItems = normalizeItems(data);
      const items = allItems.filter((item) => {
        if (!item.First_UTC) {
          return true;
        }

        const itemDate = new Date(item.First_UTC);
        const fromDate = startDate ? new Date(`${startDate}T00:00:00Z`) : null;
        const untilDate = endDate ? new Date(`${endDate}T23:59:59Z`) : null;

        if (fromDate && itemDate < fromDate) {
          return false;
        }

        if (untilDate && itemDate > untilDate) {
          return false;
        }

        return true;
      });

      const selectedRangeMatchesAvailable = allItems.some((item) => {
        if (!item.First_UTC) {
          return false;
        }

        const itemDate = new Date(item.First_UTC);
        const fromDate = startDate ? new Date(`${startDate}T00:00:00Z`) : null;
        const untilDate = endDate ? new Date(`${endDate}T23:59:59Z`) : null;

        if (fromDate && itemDate < fromDate) {
          return false;
        }

        if (untilDate && itemDate > untilDate) {
          return false;
        }

        return true;
      });

      if (!items.length && allItems.length && !selectedRangeMatchesAvailable) {
        const availableRangeLabel = buildRangeSummaryLabel(allItems);
        updateStatus(
          `A API do InSight não aplica filtro por data no endpoint atual. Exibindo o histórico disponível: ${availableRangeLabel}.`,
        );
        return allItems;
      }

      if (allItems.length && !items.length && !selectedRangeMatchesAvailable) {
        updateStatus(
          `A API do InSight não aplica filtro por data no endpoint atual. Exibindo o histórico disponível: ${buildRangeSummaryLabel(allItems)}.`,
        );
      }

      return items;
    },
    renderResult: (items) => renderCards(items),
    fallbackMessage:
      "Falha na requisicao. Verifique sua internet e tente novamente.",
  });
}
