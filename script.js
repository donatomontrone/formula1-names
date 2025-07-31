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

    // Corpo centrale
    const body = document.createElement("div");
    body.className = "car-body";

    // Tetto
    const roof = document.createElement("div");
    roof.className = "car-roof";

    // Finestrino
    const windowDiv = document.createElement("div");
    windowDiv.className = "car-window";

    // Cofano
    const hood = document.createElement("div");
    hood.className = "car-hood";

    // Bagagliaio
    const trunk = document.createElement("div");
    trunk.className = "car-trunk";

    // Paraurti anteriore
    const bumperFront = document.createElement("div");
    bumperFront.className = "car-bumper-front";

    // Paraurti posteriore
    const bumperRear = document.createElement("div");
    bumperRear.className = "car-bumper-rear";

    // Faro anteriore
    const headlight = document.createElement("div");
    headlight.className = "car-headlight";

    // Faro posteriore
    const taillight = document.createElement("div");
    taillight.className = "car-taillight";

    // Ruote
    const wheelFront = document.createElement("div");
    wheelFront.className = "car-wheel front";
    const wheelRear = document.createElement("div");
    wheelRear.className = "car-wheel rear";

    // Fumi di scarico
    const exhaust = document.createElement("div");
    exhaust.className = "car-exhaust";
    const smoke = document.createElement("span");
    exhaust.appendChild(smoke);
    carDiv.appendChild(exhaust);

    // Assembla auto
    carDiv.appendChild(body);
    carDiv.appendChild(roof);
    carDiv.appendChild(windowDiv);
    carDiv.appendChild(hood);
    carDiv.appendChild(trunk);
    carDiv.appendChild(bumperFront);
    carDiv.appendChild(bumperRear);
    carDiv.appendChild(headlight);
    carDiv.appendChild(taillight);
    carDiv.appendChild(wheelFront);
    carDiv.appendChild(wheelRear);

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

    const colors = [
      "#e74c3c", // rosso
      "#27ae60", // verde
      "#f1c40f", // giallo
      "#2980b9", // blu
      "#8e44ad", // viola
      "#e67e22", // arancione
      "#16a085", // verde acqua
      "#d35400", // arancio scuro
      "#34495e", // blu scuro
      "#ff6f91"  // rosa
    ];

    // Dopo aver creato body e roof:
    body.style.background = `linear-gradient(90deg, ${colors[i % colors.length]} 60%, #222 100%)`;
    roof.style.background = colors[i % colors.length];
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
  const track = document.getElementById("track");
  const lanes = Array.from(track.getElementsByClassName("lane"));
  const cars = [];
  const trackWidth = track.clientWidth;
  const finishX = trackWidth - 90;
  let finishCount = 0;

  names.forEach((name, i) => {
    const lane = lanes[i];
    const carDiv = lane.querySelector(".car");
    carDiv.style.left = "0px";
    carDiv.classList.add("running");
    cars.push({
      name,
      el: carDiv,
      lane,
      x: 0,           // posizione reale
      displayX: 0,    // posizione visuale (per interpolazione)
      finished: false,
      finishOrder: null,
      baseSpeed: 1.2 + Math.random() * 2.2,
      bonus: 0
    });
  });

  function animate() {
    let allFinished = true;

    // Ordina per posizione reale per i sorpassi visivi
    cars.sort((a, b) => b.x - a.x);

    cars.forEach((car, idx) => {
      if (!car.finished) {
        // Penalità ridotta per chi è avanti
        const positionPenalty = idx * 0.08;
        // Turbo più frequente e più forte
        if (Math.random() < 0.13) {
          car.bonus = 4 + Math.random() * 3;
        }
        // Avanzamento piccolo ma frequente
        const advance = car.baseSpeed + Math.random() * 1.2 + car.bonus - positionPenalty;
        car.x += Math.max(advance, 0.5);
        car.bonus = 0;

        if (car.x >= finishX) {
          car.x = finishX;
          car.finished = true;
          car.finishOrder = ++finishCount;
          car.el.classList.remove("running");
        } else {
          allFinished = false;
        }
      }

      // Interpolazione per movimento fluido
      car.displayX += (car.x - car.displayX) * 0.35;
      car.el.style.left = car.displayX + "px";
    });

    // Riordina le lane nel DOM per mostrare i sorpassi visivamente
    cars.forEach(car => {
      track.appendChild(car.lane);
    });

    if (!allFinished) {
      requestAnimationFrame(animate);
    } else {
      // Assicura che tutte le auto arrivino esattamente al traguardo
      cars.forEach(car => {
        car.el.style.left = finishX + "px";
      });
      endRace(cars);
    }
  }

  requestAnimationFrame(animate);
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
