var state = {
  activeFilter: "all",
  searchQuery: "",
  rulers: [],
  places: [],
  battles: [],
  people: []
};

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

function getEntityYear(entity) {
  if (entity.type === "battle" && entity.year) return entity.year;
  if (entity.startYear) return entity.startYear;
  if (entity.endYear) return entity.endYear;
  if (entity.year) return entity.year;
  return 0;
}

function getAllEntities() { //this for  combining all the data
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

// for filter option 


function getFilteredEntities() {
  var all = getAllEntities();
  var q = (state.searchQuery || "").toLowerCase().trim();
  if (q) {
    all = all.filter(function (e) {
      return (e.name && e.name.toLowerCase().indexOf(q) !== -1) || //(-1 is when found)
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





function renderTimeline() {
  var list = document.getElementById("timeline-list");
  if (!list) return;

  var entities = getFilteredEntities();

  if (entities.length === 0) {
    list.innerHTML = '<div class="timeline-empty">No entries match the current filter or search.</div>';
    return;
  }

  // Clear list first
  list.innerHTML = '';
  
  // Get template
  var template = document.getElementById("timeline-item-template");
  
  entities.forEach(function (entity) {
    // Clone the template content
    var clone = template.content.cloneNode(true);
    var article = clone.querySelector('.timeline-item');
    
    // Fill in the data
    article.querySelector('.timeline-year-text').textContent = 
      String(entity.displayYear || '');
    
    // Set up image with fallback
    var img = article.querySelector('.timeline-image');
    var imgUrl = entity.image || getDefaultImage(entity.type);
    img.src = imgUrl;
    img.alt = entity.name || '';
   
    
    // Set link URL
    var link = article.querySelector('.timeline-card');
    link.href = "../detail/?type=" + encodeURIComponent(entity.type) + "&id=" + encodeURIComponent(entity.id);
    
    // Set type label and name
    article.querySelector('.timeline-type-label').textContent = getTypeLabel(entity);
    article.querySelector('.timeline-entity-name').textContent = entity.name || '';
    
    // Get content container
    var contentDiv = article.querySelector('.timeline-card-content');
    
    // creating and adding period
    if (entity.period && entity.period.trim()) {
      var periodEl = document.createElement('p');
      periodEl.className = 'timeline-period';
      periodEl.textContent = entity.period;
      contentDiv.appendChild(periodEl);
    }
    
    // Add summary if exists
    if (entity.summary && entity.summary.trim()) {
      var summary = entity.summary.substring(0, 120);
      if (entity.summary.length > 120) summary += "…";
      
      var summaryEl = document.createElement('p');
      summaryEl.className = 'timeline-summary';
      summaryEl.textContent = summary;
      contentDiv.appendChild(summaryEl);
    }
    
    // Add to the list
    list.appendChild(clone);
  });
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