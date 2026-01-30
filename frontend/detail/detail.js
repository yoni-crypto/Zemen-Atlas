function getParams() {
  var search = window.location.search.slice(1);
  var params = {};
  search.split("&").forEach(function (pair) {
    var parts = pair.split("=");
    if (parts.length === 2) {
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
  });
  return params;
}

const API_BASE_URL = 'http://localhost:5000/api';

function loadData() {
  return Promise.all([
    fetch(`${API_BASE_URL}/rulers`).then(res => res.json()),
    fetch(`${API_BASE_URL}/places`).then(res => res.json()),
    fetch(`${API_BASE_URL}/battles`).then(res => res.json()),
    fetch(`${API_BASE_URL}/people`).then(res => res.json())
  ]).then(function (results) {
    return { rulers: results[0], places: results[1], battles: results[2], people: results[3] };
  }).catch(function(error) {
    console.error('Error loading data from API:', error);
    throw error;
  });
}

function findEntity(data, type, id) {
  if (type === "ruler") {
    var r = data.rulers.filter(function (x) { return x.id === id; })[0];
    return r ? Object.assign({}, r, { type: "ruler" }) : null;
  }
  if (type === "place") {
    var p = data.places.filter(function (x) { return x.id === id; })[0];
    return p ? Object.assign({}, p, { type: "place", entityType: "place" }) : null;
  }
  if (type === "battle") {
    var b = data.battles.filter(function (x) { return x.id === id; })[0];
    return b ? Object.assign({}, b, { type: "battle" }) : null;
  }
  if (type === "person") {
    var p = data.people.filter(function (x) { return x.id === id; })[0];
    return p ? Object.assign({}, p, { type: "person" }) : null;
  }
  return null;
}

function escapeHtml(s) {
  if (!s) return "";
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function renderSummary(entity) {
  var imgHtml = "";
  if (entity.image) {
    imgHtml = '<img src="' + escapeHtml(entity.image) + '" alt="' + escapeHtml(entity.name) + '" class="entity-image">';
  }

  var typeLabel = entity.type === "ruler" ? (entity.title || "Ruler") : entity.entityType === "place" ? (entity.type || "Place") : entity.type === "battle" ? "Battle" : entity.type === "person" ? (entity.title || "Person") : "Entry";
  var period = entity.period || "";
  var summary = entity.summary || "No summary available.";

  var detailsHtml = "";
  if (entity.type === "ruler") {
    var reignDuration = entity.endYear != null && entity.startYear != null ? entity.endYear - entity.startYear + 1 : "";
    detailsHtml =
      '<div class="details-section">' +
      '<h2 class="section-title">Details</h2>' +
      '<div class="details-grid">' +
      '<div><div class="detail-item-label">Title</div><div class="detail-item-value">' + escapeHtml(entity.title || "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">Reign Duration</div><div class="detail-item-value">' + (reignDuration ? reignDuration + " years" : "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">Start Year</div><div class="detail-item-value">' + (entity.startYear != null ? entity.startYear : "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">End Year</div><div class="detail-item-value">' + (entity.endYear != null ? entity.endYear : "N/A") + '</div></div>' +
      '</div>' +
      (entity.location ? '<div class="location-info"><div class="location-label">Location</div><div class="location-value">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div></div>" : "") +
      '</div>';
  } else if (entity.entityType === "place") {
    var placeDuration = entity.endYear != null && entity.startYear != null ? entity.endYear - entity.startYear + 1 : "";
    var placeType = entity.type || "Place";
    detailsHtml =
      '<div class="details-section">' +
      '<h2 class="section-title">Details</h2>' +
      '<div class="details-grid">' +
      '<div><div class="detail-item-label">Type</div><div class="detail-item-value">' + escapeHtml(placeType) + '</div></div>' +
      '<div><div class="detail-item-label">Duration</div><div class="detail-item-value">' + (placeDuration ? placeDuration + " years" : "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">Start Year</div><div class="detail-item-value">' + (entity.startYear != null ? entity.startYear : "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">End Year</div><div class="detail-item-value">' + (entity.endYear != null ? entity.endYear : "N/A") + '</div></div>' +
      '</div>' +
      (entity.location ? '<div class="location-info"><div class="location-label">Location</div><div class="location-value">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div></div>" : "") +
      '</div>';
  } else if (entity.type === "battle") {
    detailsHtml =
      '<div class="details-section">' +
      '<h2 class="section-title">Details</h2>' +
      '<div class="details-grid">' +
      '<div><div class="detail-item-label">Year</div><div class="detail-item-value">' + (entity.year != null ? entity.year : "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">Type</div><div class="detail-item-value">Battle</div></div>' +
      '</div>' +
      (entity.location ? '<div class="location-info"><div class="location-label">Location</div><div class="location-value">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div></div>" : "") +
      '</div>';
  } else if (entity.type === "person") {
    var personDuration = entity.endYear != null && entity.startYear != null ? entity.endYear - entity.startYear + 1 : "";
    detailsHtml =
      '<div class="details-section">' +
      '<h2 class="section-title">Details</h2>' +
      '<div class="details-grid">' +
      '<div><div class="detail-item-label">Title</div><div class="detail-item-value">' + escapeHtml(entity.title || "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">Lifespan</div><div class="detail-item-value">' + (personDuration ? personDuration + " years" : "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">Born</div><div class="detail-item-value">' + (entity.startYear != null ? entity.startYear : "N/A") + '</div></div>' +
      '<div><div class="detail-item-label">Died</div><div class="detail-item-value">' + (entity.endYear != null ? entity.endYear : "N/A") + '</div></div>' +
      '</div>' +
      (entity.location ? '<div class="location-info"><div class="location-label">Location</div><div class="location-value">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div></div>" : "") +
      '</div>';
  }

  return (
    '<div id="detail-summary">' +
    imgHtml +
    '<p class="type-label">' + escapeHtml(typeLabel) + '</p>' +
    '<h1 class="entity-name">' + escapeHtml(entity.name) + '</h1>' +
    '<p class="entity-period">' + escapeHtml(period) + '</p>' +
    '<h2 class="section-title">Summary</h2>' +
    '<p class="summary-text">' + escapeHtml(summary) + '</p>' +
    detailsHtml +
    '</div>'
  );
}

function showTab(tab) {
  var contentEl = document.getElementById("detail-content");
  var wikiEl = document.getElementById("detail-wikipedia");
  document.querySelectorAll(".detail-tab").forEach(function (btn) {
    var t = btn.getAttribute("data-detail-tab");
    if (t === tab) {
      btn.classList.add("active");
      btn.classList.remove("inactive");
    } else {
      btn.classList.remove("active");
      btn.classList.add("inactive");
    }
  });
  if (tab === "summary") {
    if (contentEl) contentEl.classList.remove("hidden");
    if (wikiEl) wikiEl.classList.add("hidden");
  } else {
    if (contentEl) contentEl.classList.add("hidden");
    if (wikiEl) wikiEl.classList.remove("hidden");
  }
}

function init() {
  var params = getParams();
  var type = params.type || "";
  var id = params.id || "";

  var content = document.getElementById("detail-content");
  var tabs = document.getElementById("detail-tabs");

  if (!type || !id) {
    if (content) content.innerHTML = '<div class="error"><p>Missing type or id.</p><a href="../history/" class="error-link">Back to History</a></div>';
    return;
  }

  loadData()
    .then(function (data) {
      var entity = findEntity(data, type, id);
      if (!entity) {
        if (content) content.innerHTML = '<div class="error"><p>Entry not found.</p><a href="../history/" class="error-link">Back to History</a></div>';
        return;
      }
      if (content) content.innerHTML = renderSummary(entity);
      if (tabs) tabs.classList.remove("hidden");
      var frame = document.getElementById("wikipedia-frame");
      if (frame) frame.src = "https://en.wikipedia.org/wiki/" + encodeURIComponent(String(entity.name || "").trim().replace(/\s+/g, "_"));

      document.querySelectorAll(".detail-tab").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var t = btn.getAttribute("data-detail-tab");
          if (t) showTab(t);
        });
      });
      showTab("summary");
    })
    .catch(function (err) {
      console.error(err);
      if (content) content.innerHTML = '<div class="error-red"><p>Could not load data.</p><a href="../history/" class="error-link">Back to History</a></div>';
    });
}

document.addEventListener("DOMContentLoaded", init);