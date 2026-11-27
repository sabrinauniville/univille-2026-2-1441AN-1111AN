import { NasaService } from "../../scripts/services/service.js";
import {
  getDateOffset,
  getLastAvailableDate,
  parseDateValue,
  toIsoDateValue,
  formatDate,
  formatDayLabel,
  createPageStatus,
  showInitialCard,
  enforceDateBounds,
  createDataPageController,
} from "../../scripts/shared/index.js";

const nasaService = new NasaService();

const titleElement = document.getElementById("featured-asteroid-title");
const dateElement = document.getElementById("featured-asteroid-date");
const descriptionElement = document.getElementById(
  "featured-asteroid-description",
);
const requestDataOutput = document.getElementById("get-data-response");
const updateDataButton = document.getElementById("update-data");
const updateDataOutput = document.getElementById("update-data-response");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const resultsList = document.getElementById("results-list");
const initialCard = document.getElementById("featured-asteroid");
const MAX_NEO_RANGE_DAYS = 7;

let statusMessage = "";
requestDataOutput.textContent = statusMessage;
updateDataOutput.textContent = "";

function setDefaultDateRange() {
  const defaultDate = getLastAvailableDate();
  const firstAvailableDate = getDateOffset(-7);

  startDateInput.value = defaultDate;
  endDateInput.value = defaultDate;
  startDateInput.min = firstAvailableDate;
  startDateInput.max = defaultDate;
  endDateInput.min = "2015-01-01";
  endDateInput.max = defaultDate;
}

function validateDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return;
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("A data inicial deve ser menor ou igual à data final.");
  }

  if (startDate && endDate) {
    const rangeInDays =
      (new Date(`${endDate}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`)) /
        (1000 * 60 * 60 * 24) +
      1;

    if (rangeInDays > MAX_NEO_RANGE_DAYS) {
      throw new Error(
        `A API NeoWs permite consultas de até ${MAX_NEO_RANGE_DAYS} dias. Selecione um intervalo menor.`,
      );
    }
  }
}

function renderFeaturedAsteroid(item) {
  const diameter = item.estimated_diameter?.meters;
  const minDiameter = diameter
    ? Number(diameter.estimated_diameter_min).toFixed(2)
    : "N/D";
  const maxDiameter = diameter
    ? Number(diameter.estimated_diameter_max).toFixed(2)
    : "N/D";
  const closeApproach = item.close_approach_data?.[0];
  const velocity =
    closeApproach?.relative_velocity?.kilometers_per_hour || "N/D";
  const missDistance = closeApproach?.miss_distance?.kilometers || "N/D";

  titleElement.textContent = item.name || "Asteroide sem nome";
  dateElement.textContent = `Aproximação em ${formatDate(item._date)}`;
  descriptionElement.innerHTML = `
    <p><strong>Magnitude absoluta:</strong> ${item.absolute_magnitude_h ?? "N/D"}</p>
    <p><strong>Potencialmente perigoso:</strong> ${item.is_potentially_hazardous_asteroid ? "Sim" : "Não"}</p>
    <p><strong>Diâmetro estimado:</strong> ${minDiameter} m a ${maxDiameter} m</p>
    <p><strong>Velocidade relativa:</strong> ${Number(velocity).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} km/h</p>
    <p><strong>Distância mínima:</strong> ${Number(missDistance).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} km</p>
  `;
  initialCard.classList.remove("hidden");
  initialCard.focus();
}

function normalizeItems(data) {
  const nearEarthObjects = data?.near_earth_objects ?? {};

  return Object.entries(nearEarthObjects).flatMap(([date, items]) =>
    (Array.isArray(items) ? items : []).map((item) => ({
      ...item,
      _date: date,
    })),
  );
}

function renderCards(items) {
  const collection = Array.isArray(items) ? items : [items];

  if (!collection.length) {
    throw new Error(
      "Nenhum objeto próximo da Terra encontrado para o período informado.",
    );
  }

  const firstItem = collection[0];
  renderFeaturedAsteroid(firstItem);

  const groupedByDay = new Map();

  collection.slice(1).forEach((item) => {
    const dayKey = item._date || "sem-data";

    if (!groupedByDay.has(dayKey)) {
      groupedByDay.set(dayKey, []);
    }

    groupedByDay.get(dayKey).push(item);
  });

  const days = [...groupedByDay.entries()];

  resultsList.classList.remove("hidden");

  resultsList.innerHTML = days
    .map(([dayKey, dayItems]) => {
      const dayLabel = formatDayLabel(dayKey);

      const cards = dayItems
        .map((item) => {
          const closeApproach = item.close_approach_data?.[0];
          const velocity =
            closeApproach?.relative_velocity?.kilometers_per_hour || "N/D";
          const hazardous = item.is_potentially_hazardous_asteroid
            ? "Sim"
            : "Não";
          const diameter = item.estimated_diameter?.meters;
          const minDiameter = diameter
            ? Number(diameter.estimated_diameter_min).toFixed(2)
            : "N/D";
          const maxDiameter = diameter
            ? Number(diameter.estimated_diameter_max).toFixed(2)
            : "N/D";

          return `
            <article class="article">
              <div class="text-block">
                <h3>${item.name || "Asteroide sem nome"}</h3>
                <p><strong>Magnitude absoluta:</strong> ${item.absolute_magnitude_h ?? "N/D"}</p>
                <p><strong>Potencialmente perigoso:</strong> ${hazardous}</p>
                <p><strong>Diâmetro estimado:</strong> ${minDiameter} m a ${maxDiameter} m</p>
                <p><strong>Velocidade relativa:</strong> ${Number(velocity).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} km/h</p>
              </div>
            </article>
          `;
        })
        .join("");

      return `
        <details class="accordion" ${days.length === 1 ? "open" : ""}>
          <summary>${dayLabel} · ${dayItems.length} asteroide${dayItems.length > 1 ? "s" : ""}</summary>
          <div class="accordion-content">${cards}</div>
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
  loggerLabel: "Erro ao carregar NeoWs:",
});
updateStatus(statusMessage);

document.addEventListener("DOMContentLoaded", () => {
  setDefaultDateRange();
  showInitialCard({ initialCard, resultsList });

  startDateInput.addEventListener("change", () =>
    enforceDateBounds({
      input: startDateInput,
      minDateValue: startDateInput.min || "2015-01-01",
      maxDateValue: startDateInput.max || getLastAvailableDate(),
    }),
  );
  startDateInput.addEventListener("input", () =>
    enforceDateBounds({
      input: startDateInput,
      minDateValue: startDateInput.min || "2015-01-01",
      maxDateValue: startDateInput.max || getLastAvailableDate(),
    }),
  );
  endDateInput.addEventListener("change", () =>
    enforceDateBounds({
      input: endDateInput,
      minDateValue: endDateInput.min || "2015-01-01",
      maxDateValue: endDateInput.max || getLastAvailableDate(),
    }),
  );

  updateDataButton.addEventListener("click", () => {
    loadAsteroids();
  });
});

async function loadAsteroids() {
  await dataPageController.runLoad({
    loadData: async () => {
      const selectedStartDate = startDateInput.value;
      const selectedEndDate = endDateInput.value;

      const startDate = parseDateValue(selectedStartDate);
      const endDate = parseDateValue(selectedEndDate);
      validateDateRange(startDate, endDate);

      const data = await nasaService.getNeoWs(startDate, endDate);
      return normalizeItems(data);
    },
    renderResult: (items) => renderCards(items),
    fallbackMessage:
      "Falha na requisicao. Verifique sua internet e tente novamente.",
  });
}
