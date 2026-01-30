const INITIAL_CENTER = [9.145, 38.4896];

const state = {
  currentYear: 1780,
  activeAtlasTab: "places",
  activePanelTab: "summary",
  selectedEntity: null,
  rulers: [],
  places: [],
  battles: [],
  people: []
};

document.querySelectorAll('.auto-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});


var wikipediaCache = {};

const API_BASE_URL = 'https://history-timeline-4a5q.onrender.com/api';

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

var map;
var rulerMarkers = [];
var placeMarkers = [];
var battleMarkers = [];
var peopleMarkers = [];

function createMap() {
  map = L.map("map", {
    center: INITIAL_CENTER,
    zoom: 6,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19
  }).addTo(map);

  L.control.zoom({ position: "bottomleft" }).addTo(map);
}

function clearLayers() {
  rulerMarkers.forEach(function (m) {
    map.removeLayer(m);
  });
  placeMarkers.forEach(function (m) {
    map.removeLayer(m);
  });
  battleMarkers.forEach(function (m) {
    map.removeLayer(m);
  });
  peopleMarkers.forEach(function (m) {
    map.removeLayer(m);
  });
  rulerMarkers = [];
  placeMarkers = [];
  battleMarkers = [];
  peopleMarkers = [];
}

function isYearInRange(year, start, end) {
  if (!end || end === null) {
    return year >= start;
  }
  return year >= start && year <= end;
}

function updateMapForYear() {
  if (!map) {
    return;
  }

  clearLayers();

  var year = state.currentYear;

  if (state.activeAtlasTab === "places") {
    state.places.forEach(function (place) {
      if (!isYearInRange(year, place.startYear, place.endYear)) {
        return;
      }
      var placeImageUrl = place.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=100&h=100&auto=format&fit=crop";
      var marker = L.marker(place.location, {
        icon: L.divIcon({
          className: "place-card cursor-pointer",
          html:
            '<div class="bg-[#33231a] border border-white/20 p-2 rounded shadow-2xl flex items-center gap-3 w-[160px] animate-in fade-in zoom-in duration-300 hover:scale-105 transition-transform">' +
            '<div class="w-10 h-10 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
            '<img src="' + placeImageUrl + '" class="w-full h-full object-cover" alt="' + place.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
            "</div>" +
            '<div class="flex-1 overflow-hidden">' +
            '<div class="text-white font-bold text-xs truncate">' +
            place.name +
            "</div>" +
            '<div class="text-white/40 text-[9px] uppercase tracking-tighter">' +
            (place.type || "") +
            "</div>" +
            '<div class="text-orange-500/80 text-[8px] font-bold">' +
            (place.period || "") +
            "</div>" +
            "</div>" +
            "</div>",
          iconSize: [160, 60],
          iconAnchor: [80, 70]
        })
      }).addTo(map);

      marker.on("click", function () {
        selectEntity(
          Object.assign({}, place, { entityType: "place" })
        );
      });

      placeMarkers.push(marker);
    });
  }

  if (state.activeAtlasTab === "rulers") {
    state.rulers.forEach(function (ruler) {
      if (!isYearInRange(year, ruler.startYear, ruler.endYear)) {
        return;
      }
      var imageUrl = ruler.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop";
      var marker = L.marker(ruler.location, {
        icon: L.divIcon({
          className: "ruler-card cursor-pointer",
          html:
            '<div class="bg-[#33231a] border border-white/20 p-2 rounded shadow-2xl flex items-center gap-3 w-[160px] animate-in fade-in zoom-in duration-300 hover:scale-105 transition-transform">' +
            '<div class="w-10 h-10 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
            '<img src="' + imageUrl + '" class="w-full h-full object-cover" alt="' + ruler.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
            "</div>" +
            '<div class="flex-1 overflow-hidden">' +
            '<div class="text-white font-bold text-xs truncate">' +
            ruler.name +
            "</div>" +
            '<div class="text-white/40 text-[9px] uppercase tracking-tighter">' +
            (ruler.title || "") +
            "</div>" +
            '<div class="text-orange-500/80 text-[8px] font-bold">' +
            (ruler.period || "") +
            "</div>" +
            "</div>" +
            "</div>",
          iconSize: [160, 60],
          iconAnchor: [80, 70]
        })
      }).addTo(map);

      marker.on("click", function () {
        selectEntity(
          Object.assign({}, ruler, { type: "ruler" })
        );
      });

      rulerMarkers.push(marker);
    });
  }

  if (state.activeAtlasTab === "battles") {
    state.battles.forEach(function (battle) {
      if (battle.year !== year) {
        return;
      }
      var battleImageUrl = battle.image || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=100&h=100&auto=format&fit=crop";
      var marker = L.marker(battle.location, {
        icon: L.divIcon({
          className: "battle-card cursor-pointer",
          html:
            '<div class="bg-[#33231a] border border-white/20 p-2 rounded shadow-2xl flex items-center gap-3 w-[160px] animate-in fade-in zoom-in duration-300 hover:scale-105 transition-transform">' +
            '<div class="w-10 h-10 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
            '<img src="' + battleImageUrl + '" class="w-full h-full object-cover" alt="' + battle.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
            "</div>" +
            '<div class="flex-1 overflow-hidden">' +
            '<div class="text-white font-bold text-xs truncate">' +
            battle.name +
            "</div>" +
            '<div class="text-white/40 text-[9px] uppercase tracking-tighter">Battle</div>' +
            '<div class="text-orange-500/80 text-[8px] font-bold">' +
            (battle.period || "") +
            "</div>" +
            "</div>" +
            "</div>",
          iconSize: [160, 60],
          iconAnchor: [80, 70]
        })
      }).addTo(map);

      marker.on("click", function () {
        selectEntity(
          Object.assign({}, battle, { type: "battle" })
        );
      });

      battleMarkers.push(marker);
    });
  }

  if (state.activeAtlasTab === "people") {
    state.people.forEach(function (person) {
      if (!isYearInRange(year, person.startYear, person.endYear)) {
        return;
      }
      var personImageUrl = person.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop";
      var marker = L.marker(person.location, {
        icon: L.divIcon({
          className: "people-card cursor-pointer",
          html:
            '<div class="bg-[#33231a] border border-white/20 p-2 rounded shadow-2xl flex items-center gap-3 w-[160px] animate-in fade-in zoom-in duration-300 hover:scale-105 transition-transform">' +
            '<div class="w-10 h-10 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
            '<img src="' + personImageUrl + '" class="w-full h-full object-cover" alt="' + person.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
            "</div>" +
            '<div class="flex-1 overflow-hidden">' +
            '<div class="text-white font-bold text-xs truncate">' +
            person.name +
            "</div>" +
            '<div class="text-white/40 text-[9px] uppercase tracking-tighter">' +
            (person.title || "") +
            "</div>" +
            '<div class="text-orange-500/80 text-[8px] font-bold">' +
            (person.period || "") +
            "</div>" +
            "</div>" +
            "</div>",
          iconSize: [160, 60],
          iconAnchor: [80, 70]
        })
      }).addTo(map);

      marker.on("click", function () {
        selectEntity(
          Object.assign({}, person, { type: "person" })
        );
      });

      peopleMarkers.push(marker);
    });
  }
}

function selectEntity(entity) {
  state.selectedEntity = entity;
  state.activePanelTab = "summary";
  renderDetailsPanel();
  
  var yearToSet = null;
  if (entity.type === "battle" && entity.year) {
    yearToSet = entity.year;
  } else if (entity.startYear) {
    yearToSet = entity.startYear;
  } else if (entity.endYear) {
    yearToSet = entity.endYear;
  } else if (entity.year) {
    yearToSet = entity.year;
  }
  
  if (yearToSet !== null && yearToSet >= 800 && yearToSet <= 2026) {
    var slider = document.getElementById("year-slider");
    if (slider) {
      slider.value = yearToSet;
      setYear(yearToSet);
    }
  }
}

function closeDetailsPanel() {
  state.selectedEntity = null;
  renderDetailsPanel();
}

function setPanelTab(tab) {
  state.activePanelTab = tab;
  renderDetailsPanel();
}

function setAtlasTab(tab) {
  state.activeAtlasTab = tab;
  updateMapForYear();
  renderAtlas();
  renderListPanel();
}

function setYear(year) {
  state.currentYear = year;
  var yearLabel = document.getElementById("timeline-year");
  var bubble = document.getElementById("timeline-indicator");
  var slider = document.getElementById("year-slider");
  
  if (yearLabel) {
    yearLabel.textContent = String(year);
  }
  
  if (bubble && slider) {
    var sliderContainer = slider.parentElement;
    var min = parseInt(slider.min, 10);
    var max = parseInt(slider.max, 10);
    var percent = ((year - min) / (max - min)) * 100;
    
    var containerRect = sliderContainer.getBoundingClientRect();
    var sliderRect = slider.getBoundingClientRect();
    var sliderTrackWidth = sliderRect.width;
    var sliderTrackLeft = sliderRect.left - containerRect.left;
    
    var thumbPosition = sliderTrackLeft + (sliderTrackWidth * percent / 100);
    bubble.style.left = thumbPosition + "px";
    bubble.style.transform = "translateX(-50%) translateY(-50%)";
  }
  
  updateMapForYear();
  renderAtlas();
}

function renderDetailsPanel() {
  var panel = document.getElementById("details-panel");
  var contentEl = document.getElementById("details-content");
  var tabButtons = document.querySelectorAll("[data-panel-tab]");

  if (!panel || !contentEl) {
    return;
  }

  if (!state.selectedEntity) {
    panel.classList.add("hidden");
    contentEl.innerHTML =
      '<div class="space-y-6 text-white/70 text-sm"><p>Select a ruler or region on the map to see details.</p></div>';
    return;
  }

  panel.classList.remove("hidden");

  var entity = state.selectedEntity;

  tabButtons.forEach(function (btn) {
    var tab = btn.getAttribute("data-panel-tab");
    if (tab === state.activePanelTab) {
      btn.classList.remove("inactive");
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
      btn.classList.add("inactive");
    }
  });

  if (state.activePanelTab === "summary") {
    contentEl.className = "flex-1 overflow-y-auto p-6";
    var headerHtml = "";
    if (entity.type === "ruler") {
      headerHtml =
        ((entity.image &&
          '<img src="' +
            entity.image +
            '" class="w-full h-48 object-cover rounded border border-white/10 mb-4" alt="' +
            entity.name +
            '"/>') ||
          "") +
        '<div>' +
        '<h1 class="text-xl font-bold text-white leading-tight">' +
        entity.name +
        "</h1>" +
        '<p class="text-orange-400 text-xs font-bold mt-1 uppercase tracking-tighter">' +
        (entity.title || "") +
        "</p>" +
        '<p class="text-white/40 text-xs mt-1">' +
        (entity.period || "") +
        "</p>" +
        "</div>";
    } else if (entity.entityType === "place") {
      headerHtml =
        ((entity.image &&
          '<img src="' +
            entity.image +
            '" class="w-full h-48 object-cover rounded border border-white/10 mb-4" alt="' +
            entity.name +
            '"/>') ||
          '<div class="w-full h-48 bg-white/10 rounded border border-white/10 flex items-center justify-center mb-4">' +
          '<svg width="64" height="64" viewBox="0 0 24 24" fill="white" opacity="0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
          "</div>") +
        '<div>' +
        '<h1 class="text-xl font-bold text-white leading-tight">' +
        entity.name +
        "</h1>" +
        '<p class="text-orange-400 text-xs font-bold mt-1 uppercase tracking-tighter">' +
        (entity.type || "") +
        "</p>" +
        '<p class="text-white/40 text-xs mt-1">' +
        (entity.period || "") +
        "</p>" +
        "</div>";
    } else {
      var fallbackIcon = "";
      if (entity.type === "battle") {
        fallbackIcon = '<svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.5"><path d="M14.5 17.5L3 6l3-3 11.5 11.5"></path><path d="M13 19l2 2 6-6-2-2z"></path></svg>';
      } else if (entity.type === "person") {
        fallbackIcon = '<svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.5"><circle cx="9" cy="7" r="3"></circle><circle cx="17" cy="7" r="3"></circle><path d="M2 21v-1a4 4 0 0 1 4-4h6"></path><path d="M14 21v-1a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1"></path></svg>';
      } else {
        fallbackIcon = '<span class="text-white/60 text-xs font-bold uppercase tracking-widest">' + (entity.type || "ENTITY").toUpperCase() + "</span>";
      }
      
      headerHtml =
        ((entity.image &&
          '<img src="' +
            entity.image +
            '" class="w-full h-48 object-cover rounded border border-white/10 mb-4" alt="' +
            entity.name +
            '"/>') ||
          '<div class="w-full h-48 bg-white/10 rounded border border-white/10 flex items-center justify-center mb-4">' +
          fallbackIcon +
          "</div>") +
        '<div>' +
        '<h1 class="text-xl font-bold text-white leading-tight">' +
        entity.name +
        "</h1>" +
        '<p class="text-orange-400 text-xs font-bold mt-1 uppercase tracking-tighter">' +
        (entity.title || entity.type || "") +
        "</p>" +
        '<p class="text-white/40 text-xs mt-1">' +
        (entity.period || "") +
        "</p>" +
        "</div>";
    }

    var summaryText =
      entity.summary || "No detailed summary available for this archive entry.";

    var detailsHtml = "";
    if (entity.type === "ruler") {
      var reignDuration = entity.endYear && entity.startYear ? entity.endYear - entity.startYear + 1 : "";
      detailsHtml =
        '<div class="space-y-4 mt-4">' +
        '<h2 class="text-sm font-black uppercase text-white/80 border-b border-white/5 pb-2">Details</h2>' +
        '<div class="grid grid-cols-2 gap-4 text-xs">' +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Title</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.title || "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Reign Duration</div>' +
        '<div class="text-white/80 font-semibold">' + (reignDuration ? reignDuration + " years" : "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Start Year</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.startYear || "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">End Year</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.endYear || "N/A") + "</div>" +
        "</div>" +
        "</div>" +
        (entity.location ? 
          '<div class="mt-4">' +
          '<div class="text-white/40 uppercase tracking-wider mb-1 text-xs">Location</div>' +
          '<div class="text-white/80 text-xs">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div>" +
          "</div>" : "") +
        "</div>";
    } else if (entity.entityType === "place") {
      var placeDuration = entity.endYear && entity.startYear ? entity.endYear - entity.startYear + 1 : "";
      detailsHtml =
        '<div class="space-y-4 mt-4">' +
        '<h2 class="text-sm font-black uppercase text-white/80 border-b border-white/5 pb-2">Details</h2>' +
        '<div class="grid grid-cols-2 gap-4 text-xs">' +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Type</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.type || "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Duration</div>' +
        '<div class="text-white/80 font-semibold">' + (placeDuration ? placeDuration + " years" : "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Start Year</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.startYear || "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">End Year</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.endYear || "N/A") + "</div>" +
        "</div>" +
        "</div>" +
        (entity.location ? 
          '<div class="mt-4">' +
          '<div class="text-white/40 uppercase tracking-wider mb-1 text-xs">Location</div>' +
          '<div class="text-white/80 text-xs">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div>" +
          "</div>" : "") +
        "</div>";
    } else if (entity.type === "battle") {
      detailsHtml =
        '<div class="space-y-4 mt-4">' +
        '<h2 class="text-sm font-black uppercase text-white/80 border-b border-white/5 pb-2">Details</h2>' +
        '<div class="grid grid-cols-2 gap-4 text-xs">' +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Year</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.year || "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Type</div>' +
        '<div class="text-white/80 font-semibold">Battle</div>' +
        "</div>" +
        "</div>" +
        (entity.location ? 
          '<div class="mt-4">' +
          '<div class="text-white/40 uppercase tracking-wider mb-1 text-xs">Location</div>' +
          '<div class="text-white/80 text-xs">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div>" +
          "</div>" : "") +
        "</div>";
    } else if (entity.type === "person") {
      var personDuration = entity.endYear && entity.startYear ? entity.endYear - entity.startYear + 1 : "";
      detailsHtml =
        '<div class="space-y-4 mt-4">' +
        '<h2 class="text-sm font-black uppercase text-white/80 border-b border-white/5 pb-2">Details</h2>' +
        '<div class="grid grid-cols-2 gap-4 text-xs">' +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Title</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.title || "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Lifespan</div>' +
        '<div class="text-white/80 font-semibold">' + (personDuration ? personDuration + " years" : "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Born</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.startYear || "N/A") + "</div>" +
        "</div>" +
        '<div>' +
        '<div class="text-white/40 uppercase tracking-wider mb-1">Died</div>' +
        '<div class="text-white/80 font-semibold">' + (entity.endYear || "N/A") + "</div>" +
        "</div>" +
        "</div>" +
        (entity.location ? 
          '<div class="mt-4">' +
          '<div class="text-white/40 uppercase tracking-wider mb-1 text-xs">Location</div>' +
          '<div class="text-white/80 text-xs">' + entity.location[0].toFixed(2) + "°N, " + entity.location[1].toFixed(2) + "°E</div>" +
          "</div>" : "") +
        "</div>";
    }

    contentEl.innerHTML =
      '<div class="space-y-6">' +
      headerHtml +
      '<div class="space-y-4 mt-4">' +
      '<h2 class="text-sm font-black uppercase text-white/80 border-b border-white/5 pb-2">Summary</h2>' +
      '<p class="text-sm text-white/60 leading-relaxed">' +
      summaryText +
      "</p>" +
      "</div>" +
      detailsHtml +
      "</div>";
  } else {
    contentEl.className = "flex-1 overflow-hidden bg-[#f5f5f5]";
    renderWikipediaContent(entity, contentEl);
  }
}

function renderWikipediaContent(entity, container) {
  var cacheKey = entity.name || "";
  if (wikipediaCache[cacheKey]) {
    container.innerHTML = wikipediaCache[cacheKey];
    return;
  }

  var title = String(entity.name || "").trim();
  var slug = encodeURIComponent(title.replace(/\s+/g, "_"));
  var pageUrl = "https://en.wikipedia.org/wiki/" + slug;

  var html =
    '<div class="w-full h-full bg-white">' +
    '<iframe src="' +
    pageUrl +
    '" title="Wikipedia: ' +
    title.replace(/"/g, "") +
    '" class="w-full h-full border-0 bg-white"></iframe>' +
    "</div>" +
    "";

  wikipediaCache[cacheKey] = html;
  container.innerHTML = html;
}

function renderAtlas() {
  var container = document.getElementById("atlas-content");
  var tabButtons = document.querySelectorAll("[data-atlas-tab]");
  if (!container) {
    return;
  }

  tabButtons.forEach(function (btn) {
    var tab = btn.getAttribute("data-atlas-tab");
    if (tab === state.activeAtlasTab) {
      btn.classList.remove("inactive");
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
      btn.classList.add("inactive");
    }
  });

  container.innerHTML = "";
}

function renderListPanel() {
  var container = document.getElementById("list-content");
  var titleEl = document.getElementById("list-panel-title");
  if (!container || !titleEl) {
    return;
  }

  var html = "";
  var title = "";

  if (state.activeAtlasTab === "places" && state.places && state.places.length) {
    title = "All Places";
    state.places.forEach(function (p) {
      var imageUrl = p.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=100&h=100&auto=format&fit=crop";
      var summary = (p.summary || "").substring(0, 100);
      if (p.summary && p.summary.length > 100) {
        summary += "...";
      }
      html +=
        '<button class="w-full text-left p-3 rounded hover:bg-white/5 border-b border-white/5 flex gap-3" data-entity-type="place" data-entity-id="' +
        p.id +
        '">' +
        '<div class="w-16 h-16 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
        '<img src="' + imageUrl + '" class="w-full h-full object-cover" alt="' + p.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
        "</div>" +
        '<div class="flex-1 min-w-0">' +
        '<div class="text-sm text-white/90 font-semibold truncate">' +
        p.name +
        "</div>" +
        '<div class="text-xs text-white/50 mt-1">' +
        (p.period || "") +
        "</div>" +
        (summary ? '<div class="text-xs text-white/60 mt-2 line-clamp-2">' + summary + "</div>" : "") +
        "</div>" +
        "</button>";
    });
  } else if (state.activeAtlasTab === "rulers" && state.rulers && state.rulers.length) {
    title = "All Rulers";
    state.rulers.forEach(function (r) {
      var imageUrl = r.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop";
      var summary = (r.summary || "").substring(0, 100);
      if (r.summary && r.summary.length > 100) {
        summary += "...";
      }
      html +=
        '<button class="w-full text-left p-3 rounded hover:bg-white/5 border-b border-white/5 flex gap-3" data-entity-type="ruler" data-entity-id="' +
        r.id +
        '">' +
        '<div class="w-16 h-16 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
        '<img src="' + imageUrl + '" class="w-full h-full object-cover" alt="' + r.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
        "</div>" +
        '<div class="flex-1 min-w-0">' +
        '<div class="text-sm text-white/90 font-semibold truncate">' +
        r.name +
        "</div>" +
        '<div class="text-xs text-white/50 mt-1">' +
        (r.period || "") +
        "</div>" +
        (summary ? '<div class="text-xs text-white/60 mt-2 line-clamp-2">' + summary + "</div>" : "") +
        "</div>" +
        "</button>";
    });
  } else if (state.activeAtlasTab === "battles" && state.battles && state.battles.length) {
    title = "All Battles";
    state.battles.forEach(function (b) {
      var imageUrl = b.image || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=100&h=100&auto=format&fit=crop";
      var summary = (b.summary || "").substring(0, 100);
      if (b.summary && b.summary.length > 100) {
        summary += "...";
      }
      html +=
        '<button class="w-full text-left p-3 rounded hover:bg-white/5 border-b border-white/5 flex gap-3" data-entity-type="battle" data-entity-id="' +
        b.id +
        '">' +
        '<div class="w-16 h-16 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
        '<img src="' + imageUrl + '" class="w-full h-full object-cover" alt="' + b.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
        "</div>" +
        '<div class="flex-1 min-w-0">' +
        '<div class="text-sm text-white/90 font-semibold truncate">' +
        b.name +
        "</div>" +
        '<div class="text-xs text-white/50 mt-1">' +
        (b.period || b.year || "") +
        "</div>" +
        (summary ? '<div class="text-xs text-white/60 mt-2 line-clamp-2">' + summary + "</div>" : "") +
        "</div>" +
        "</button>";
    });
  } else if (state.activeAtlasTab === "people" && state.people && state.people.length) {
    title = "All People";
    state.people.forEach(function (p) {
      var imageUrl = p.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop";
      var summary = (p.summary || "").substring(0, 100);
      if (p.summary && p.summary.length > 100) {
        summary += "...";
      }
      html +=
        '<button class="w-full text-left p-3 rounded hover:bg-white/5 border-b border-white/5 flex gap-3" data-entity-type="person" data-entity-id="' +
        p.id +
        '">' +
        '<div class="w-16 h-16 bg-white/10 rounded overflow-hidden flex-shrink-0">' +
        '<img src="' + imageUrl + '" class="w-full h-full object-cover" alt="' + p.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop\'"/>' +
        "</div>" +
        '<div class="flex-1 min-w-0">' +
        '<div class="text-sm text-white/90 font-semibold truncate">' +
        p.name +
        "</div>" +
        '<div class="text-xs text-white/50 mt-1">' +
        (p.period || "") +
        "</div>" +
        (summary ? '<div class="text-xs text-white/60 mt-2 line-clamp-2">' + summary + "</div>" : "") +
        "</div>" +
        "</button>";
    });
  }

  titleEl.textContent = title;
  container.innerHTML = html;
}

function attachEventHandlers() {
  var slider = document.getElementById("year-slider");
  if (slider) {
    slider.addEventListener("input", function (e) {
      var value = parseInt(e.target.value, 10);
      setYear(value);
    });
  }

  window.addEventListener("resize", function () {
    setYear(state.currentYear);
  });

  var ticksContainer = document.getElementById("timeline-ticks");
  if (ticksContainer) {
    var htmlTicks = "";
    for (var i = 800; i <= 2025; i += 10) {
      var isMajor = i % 100 === 0;
      var isMedium = i % 50 === 0;
      var heightClass = isMajor ? "h-6 opacity-100" : isMedium ? "h-4 opacity-70" : "h-2 opacity-30";
      htmlTicks += '<div class="w-[1px] bg-white ' + heightClass + ' transition-all"></div>';
    }
    ticksContainer.innerHTML = htmlTicks;
  }

  var detailsClose = document.getElementById("details-close");
  if (detailsClose) {
    detailsClose.addEventListener("click", function () {
      closeDetailsPanel();
    });
  }

  document.querySelectorAll("[data-panel-tab]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-panel-tab");
      if (tab) {
        setPanelTab(tab);
      }
    });
  });

  document.querySelectorAll("[data-atlas-tab]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-atlas-tab");
      if (tab) {
        setAtlasTab(tab);
      }
    });
  });

  var listContainer = document.getElementById("list-content");
  if (listContainer) {
    listContainer.addEventListener("click", function (event) {
      var target = event.target;
      while (target && target !== listContainer) {
        var type = target.getAttribute && target.getAttribute("data-entity-type");
        var id = target.getAttribute && target.getAttribute("data-entity-id");
        if (type && id) {
          if (type === "ruler") {
            var ruler = state.rulers.find(function (r) {
              return r.id === id;
            });
            if (ruler) {
              selectEntity(Object.assign({}, ruler, { type: "ruler" }));
            }
          } else if (type === "place") {
            var place = state.places.find(function (p) {
              return p.id === id;
            });
            if (place) {
              selectEntity(Object.assign({}, place, { entityType: "place" }));
            }
          } else if (type === "battle") {
            var battle = state.battles.find(function (b) {
              return b.id === id;
            });
            if (battle) {
              selectEntity(Object.assign({}, battle, { type: "battle" }));
            }
          } else if (type === "person") {
            var person = state.people.find(function (p) {
              return p.id === id;
            });
            if (person) {
              selectEntity(Object.assign({}, person, { type: "person" }));
            }
          }
          break;
        }
        target = target.parentNode;
      }
    });
  }

}

function init() {
  loadData()
    .then(function () {
      createMap();
      attachEventHandlers();
      setTimeout(function () {
        setYear(state.currentYear);
      }, 100);
      renderDetailsPanel();
      renderAtlas();
      renderListPanel();
    })
    .catch(function (error) {
      console.error(error);
    });
}

document.addEventListener("DOMContentLoaded", init);

