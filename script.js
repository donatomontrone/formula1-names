document.getElementById("speedRange").addEventListener("input", e => {
  document.getElementById("durationLabel").textContent = e.target.value;
});

function startRace() {
  const input = document.getElementById("nameInput").value.trim();
  const names = input.split("\n").filter(n => n.trim() !== "");
  if (names.length < 2) {
    alert("Inserisci almeno 2 nomi!");
    return;
  }

  const duration = parseInt(document.getElementById("speedRange").value);
  document.getElementById("startSound").play();
  const accel = document.getElementById("accelSound");
  const pass = document.getElementById("passSound");

  const track = document.getElementById("track");
  track.innerHTML = '<div class="track-line"></div>';
  const results = [];

  const colors = ["red", "blue", "green", "purple", "orange", "pink", "teal", "brown"];
  let z = 1;

  names.forEach((name, i) => {
    const car = document.createElement("div");
    car.className = "car";
    car.style.top = `${i * 50}px`;
    car.style.backgroundColor = colors[i % colors.length];
    car.textContent = name;
    track.appendChild(car);

    const time = Math.random() * (duration * 0.6) + duration * 0.4;
    setTimeout(() => {
      accel.currentTime = 0;
      accel.play();
      car.style.transition = `left ${time}s linear`;
      car.style.left = "85%";
    }, 100);

    results.push({ name, time, element: car });
  });

  // Sorpassi random
  const interval = setInterval(() => {
    const idx = Math.floor(Math.random() * results.length);
    const car = results[idx].element;
    car.style.zIndex = ++z;
    pass.currentTime = 0;
    pass.play();
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    results.sort((a, b) => a.time - b.time);
    const podium = document.getElementById("podium");
    const ranking = document.getElementById("ranking");
    ranking.innerHTML = "";

    results.forEach((r, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${r.name}`;
      if (i === 0) li.className = "gold";
      else if (i === 1) li.className = "silver";
      else if (i === 2) li.className = "bronze";
      ranking.appendChild(li);
    });

    const stored = JSON.parse(localStorage.getItem("history") || "[]");
    stored.unshift(results.map(r => r.name));
    localStorage.setItem("history", JSON.stringify(stored.slice(0, 5)));

    showHistory();
    document.getElementById("winSound").play();
    podium.classList.remove("hidden");
  }, (duration + 1) * 1000);
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  const list = document.getElementById("history");
  list.innerHTML = "";
  history.forEach((race, i) => {
    const li = document.createElement("li");
    li.textContent = `Gara ${i + 1}: ${race.join(", ")}`;
    list.appendChild(li);
  });
}
