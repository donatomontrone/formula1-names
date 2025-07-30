const carImages = [];
for (let i = 1; i <= 5; i++) { // <-- 5 immagini nella cartella cars
  carImages.push(`cars/car${i}.png`);
}

// Nomi di default
const defaultNames = ["Mario", "Luigi", "Peach", "Yoshi"];

// Aggiorna la griglia ogni volta che cambia il textarea
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("nameInput");
  // Imposta i nomi di default solo se il textarea è vuoto
  if (!nameInput.value.trim()) {
    nameInput.value = defaultNames.join("\n");
  }
  updateGrid();
  nameInput.addEventListener("input", updateGrid);
  document.getElementById("podium-popup").classList.add("hidden");
});

function updateGrid() {
  const input = document.getElementById("nameInput").value.trim();
  const names = input.split("\n").filter(n => n.trim() !== "");
  showStartingGrid(names);
}

// Mostra la griglia di partenza (e la mantiene durante la corsa)
function showStartingGrid(names) {
  const track = document.getElementById("track");
  track.innerHTML = '<div id="finish-line"></div>';
  // Ridimensiona la pista in base al numero di auto (corsia più piccola: 40px)
  track.style.height = (names.length * 40 + 30) + "px";
  names.forEach((name, i) => {
    const lane = document.createElement("div");
    lane.className = "lane";
    lane.style.top = (i * 40 + 10) + "px";
    lane.style.left = "0px";
    lane.style.position = "absolute";
    lane.style.width = "100%";
    lane.style.height = "40px";
    lane.style.display = "flex";
    lane.style.alignItems = "center";
    lane.style.zIndex = "1";

    const carDiv = document.createElement("div");
    carDiv.className = "car";
    carDiv.style.position = "relative";
    carDiv.style.left = "0px";
    carDiv.style.top = "0px";
    carDiv.style.zIndex = "2";
    carDiv.style.width = "50px"; // auto più piccola

    const img = document.createElement("img");
    img.src = carImages[i % carImages.length];
    img.alt = "Auto";
    img.style.width = "100%";
    img.style.height = "auto";

    carDiv.appendChild(img);

    const nameDiv = document.createElement("div");
    nameDiv.textContent = name;
    nameDiv.style.marginLeft = "10px";
    nameDiv.style.fontWeight = "bold";
    nameDiv.style.fontSize = "15px";
    nameDiv.style.color = "white";
    nameDiv.style.textShadow = "1px 1px 2px #000";

    lane.appendChild(carDiv);
    lane.appendChild(nameDiv);
    track.appendChild(lane);
  });
}

// Avvia la gara mantenendo la griglia
let raceInProgress = false;

function startRace() {
  const input = document.getElementById("nameInput").value.trim();
  const names = input.split("\n").filter(n => n.trim() !== "");
  if (names.length < 2) {
    alert("Inserisci almeno 2 nomi!");
    return;
  }
  showStartingGrid(names);

  setRaceUIState(true); // Disabilita UI
  raceInProgress = true;

  setTimeout(() => {
    runRace(names);
  }, 1500);
}

function runRace(names) {
  // NON cancellare la griglia, ma solo le auto
  const track = document.getElementById("track");
  // Prendi tutte le lane già create
  const lanes = Array.from(track.getElementsByClassName("lane"));
  const cars = [];
  const trackWidth = track.clientWidth;
  const finishX = trackWidth - 90; // auto più piccola, linea più vicina
  let finishCount = 0;

  names.forEach((name, i) => {
    // Trova la carDiv dentro la lane
    const lane = lanes[i];
    const carDiv = lane.querySelector(".car");
    carDiv.style.left = "0px";
    cars.push({ name, el: carDiv, x: 0, finished: false, finishOrder: null });
  });

  const interval = setInterval(() => {
    let allFinished = true;
    cars.forEach(car => {
      if (!car.finished) {
        const advance = Math.random() * 2 + 1; // più fluido e lento
        car.x += advance;
        if (car.x >= finishX) {
          car.x = finishX;
          car.finished = true;
          car.finishOrder = ++finishCount;
        } else {
          allFinished = false;
        }
        car.el.style.left = car.x + "px";
      }
    });
    if (allFinished) {
      clearInterval(interval);
      endRace(cars);
    }
  }, 20); // intervallo più breve per maggiore fluidità
}

// Alla fine della gara riabilita tutto
function endRace(cars) {
  cars.sort((a, b) => a.finishOrder - b.finishOrder);
  const podium = document.getElementById("podium");
  const ranking = document.getElementById("ranking");
  ranking.innerHTML = "";

  cars.forEach((c, i) => {
    const div = document.createElement("div");
    div.textContent = `${i + 1}. ${c.name}`;
    if (i === 0) div.classList.add("gold");
    else if (i === 1) div.classList.add("silver");
    else if (i === 2) div.classList.add("bronze");
    ranking.appendChild(div);
  });

  podium.classList.remove("hidden");
  showPodiumPopup(cars);
  saveRaceToHistory(cars);

  setRaceUIState(false); // Riabilita UI
  raceInProgress = false;
}

function setRaceUIState(disabled) {
  // Blocca/sblocca scroll
  document.body.style.overflow = disabled ? "hidden" : "";

  // Blocca/sblocca reload
  if (disabled) {
    window.addEventListener("keydown", blockReload, { passive: false });
  } else {
    window.removeEventListener("keydown", blockReload, { passive: false });
  }

  // Disabilita/abilita tutti i pulsanti
  document.querySelectorAll("button").forEach(btn => {
    btn.disabled = disabled;
    if (disabled) btn.classList.add("disabled-btn");
    else btn.classList.remove("disabled-btn");
  });
}

function showPodiumPopup(cars) {
  const popup = document.getElementById("podium-popup");
  const popupRanking = document.getElementById("popup-ranking");
  popupRanking.innerHTML = "";
  cars.forEach((c, i) => {
    const div = document.createElement("div");
    div.textContent = `${i + 1}. ${c.name}`;
    if (i === 0) div.classList.add("gold");
    else if (i === 1) div.classList.add("silver");
    else if (i === 2) div.classList.add("bronze");
    popupRanking.appendChild(div);
  });
  popup.classList.remove("hidden");
}

function closePodiumPopup() {
  document.getElementById("podium-popup").classList.add("hidden");
}

function saveRaceToHistory(cars) {
  const date = new Date();
  const race = {
    date: date.toLocaleString(),
    podium: cars.slice(0, 3).map(c => c.name),
    ranking: cars.map(c => c.name)
  };
  let history = JSON.parse(localStorage.getItem("raceHistory") || "[]");
  history.unshift(race);
  if (history.length > 10) history = history.slice(0, 10); // max 10 gare
  localStorage.setItem("raceHistory", JSON.stringify(history));
  renderRaceHistory();
}

function renderRaceHistory() {
  const historyDiv = document.getElementById("history-list");
  let history = JSON.parse(localStorage.getItem("raceHistory") || "[]");
  historyDiv.innerHTML = "";
  if (history.length === 0) {
    historyDiv.innerHTML = "<em>Nessuna gara salvata.</em>";
    return;
  }
  history.forEach(race => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${race.date}</strong>
      🥇 ${race.podium[0] || "-"} &nbsp; 🥈 ${race.podium[1] || "-"} &nbsp; 🥉 ${race.podium[2] || "-"}
      <br><strong>Classifica:</strong> ${race.ranking.join(", ")}`;
    historyDiv.appendChild(div);
  });
}

// Mostra la cronologia all'avvio
document.addEventListener("DOMContentLoaded", renderRaceHistory);

function blockReload(e) {
  if ((e.key === "F5") || (e.ctrlKey && e.key.toLowerCase() === "r")) {
    e.preventDefault();
  }
}
