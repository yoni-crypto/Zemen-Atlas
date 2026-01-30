var state = {
  activeFilter: "all",
  searchQuery: "",
  rulers: [],
  places: [],
  battles: [],
  people: []
};

const API_BASE_URL = 'http://localhost:5000/api';

function loadData() {
  return Promise.all([
    fetch(`${API_BASE_URL}/rulers`).then(res => res.json()),
    fetch(`${API_BASE_URL}/places`).then(res => res.json()),
    fetch(`${API_BASE_URL}/battles`).then(res => res.json()),
    fetch(`${API_BASE_URL}/people`).then(res => res.json())
  ]).then(function (results) {
    state.rulers = results[0];
    state.places = results[1];
    state.battles = results[2];
    state.people = results[3];
  }).catch(function(error) {
    console.error('Error loading data from API:', error);
    throw error;
  });
}

function getEntityYear(entity) {
  if (entity.type === "battle" && entity.year) return entity.year;
  if (entity.startYear) return entity.startYear;
  if (entity.endYear) return entity.endYear;
  if (entity.year) return entity.year;
  return 0;
}

function getAllEntities() {
  var all = [];
  state.rulers.forEach(function (r) {
    all.push(Object.assign({}, r, { type: "ruler", displayYear: getEntityYear(r) }));
  });
  state.places.forEach(function (p) {
    all.push(Object.assign({}, p, { type: "place", displayYear: getEntityYear(p) }));
  });
  state.battles.forEach(function (b) {
    all.push(Object.assign({}, b, { type: "battle", displayYear: getEntityYear(b) }));
  });
  state.people.forEach(function (p) {
    all.push(Object.assign({}, p, { type: "person", displayYear: getEntityYear(p) }));
  });
  return all.sort(function (a, b) { return a.displayYear - b.displayYear; });
}

function getFilteredEntities() {
  var all = getAllEntities();
  var q = (state.searchQuery || "").toLowerCase().trim();
  if (q) {
    all = all.filter(function (e) {
      return (e.name && e.name.toLowerCase().indexOf(q) !== -1) ||
             (e.period && e.period.toLowerCase().indexOf(q) !== -1) ||
             (e.summary && e.summary.toLowerCase().indexOf(q) !== -1);
    });
  }
  if (state.activeFilter === "all") return all;
  return all.filter(function (e) {
    return (state.activeFilter === "rulers" && e.type === "ruler") ||
           (state.activeFilter === "places" && e.type === "place") ||
           (state.activeFilter === "battles" && e.type === "battle") ||
           (state.activeFilter === "people" && e.type === "person");
  });
}

function getTypeLabel(entity) {
  if (entity.type === "ruler") return "Ruler";
  if (entity.type === "place") return entity.type || "Place";
  if (entity.type === "battle") return "Battle";
  if (entity.type === "person") return entity.title || "Person";
  return "Entry";
}

function getDefaultImage(type) {
  if (type === "ruler" || type === "person") return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=300&auto=format&fit=crop";
  if (type === "place") return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&h=300&auto=format&fit=crop";
  if (type === "battle") return "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=400&h=300&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&h=300&auto=format&fit=crop";
}

function escapeHtml(s) {
  if (!s) return "";
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function renderTimeline() {
  var list = document.getElementById("timeline-list");
  if (!list) return;

  var entities = getFilteredEntities();

  if (entities.length === 0) {
    list.innerHTML = '<div class="timeline-empty">No entries match the current filter or search.</div>';
    return;
  }

  var html = "";
  entities.forEach(function (entity) {
    var year = entity.displayYear;
    var img = entity.image || getDefaultImage(entity.type);
    var fallback = getDefaultImage(entity.type);
    var label = getTypeLabel(entity);
    var period = entity.period || "";
    var summary = (entity.summary || "").substring(0, 120);
    if (entity.summary && entity.summary.length > 120) summary += "…";

    html += '<article class="timeline-item">';
    html += '<div class="timeline-year">';
    html += '<span class="timeline-year-text">' + escapeHtml(String(year)) + '</span>';
    html += '</div>';
    html += '<div class="timeline-dot-container">';
    html += '<span class="timeline-dot"></span>';
    html += '</div>';
    var detailUrl = "../detail/?type=" + encodeURIComponent(entity.type) + "&id=" + encodeURIComponent(entity.id);
    html += '<div class="timeline-content">';
    html += '<a href="' + escapeHtml(detailUrl) + '" class="timeline-card">';
    html += '<div class="timeline-card-inner">';
    html += '<div class="timeline-image-container">';
    html += '<img src="' + escapeHtml(img) + '" alt="" class="timeline-image" onerror="this.src=\'' + escapeHtml(fallback) + '\'">'; 
    html += '</div>';
    html += '<div class="timeline-card-content">';
    html += '<span class="timeline-type-label">' + escapeHtml(label) + '</span>';
    html += '<h2 class="timeline-entity-name">' + escapeHtml(entity.name) + '</h2>';
    if (period) html += '<p class="timeline-period">' + escapeHtml(period) + '</p>';
    if (summary) html += '<p class="timeline-summary">' + escapeHtml(summary) + '</p>';
    html += '</div></div></a></div></article>';
  });

  list.innerHTML = html;
}

function setFilter(filter) {
  state.activeFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    var f = btn.getAttribute("data-filter");
    if (f === filter) {
      btn.classList.remove("inactive");
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
      btn.classList.add("inactive");
    }
  });
  renderTimeline();
}

function attachEventHandlers() {
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      if (f) setFilter(f);
    });
  });

  var searchEl = document.getElementById("history-search");
  if (searchEl) {
    searchEl.addEventListener("input", function () {
      state.searchQuery = searchEl.value;
      renderTimeline();
    });
  }
}

function init() {
  loadData()
    .then(function () {
      attachEventHandlers();
      renderTimeline();
    })
    .catch(function (err) {
      console.error(err);
      var list = document.getElementById("timeline-list");
      if (list) list.innerHTML = '<div class="timeline-error">Could not load data. Refresh the page.</div>';
    });
}

document.addEventListener("DOMContentLoaded", init);