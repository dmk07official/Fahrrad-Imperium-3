//Speichern, Laden, Varianlen
let coins = 0;

function saveProgress() {
      const progress = {
        coins,
      };

    localStorage.setItem('progress', JSON.stringify(progress));
}

function loadProgress() {
    const progress = JSON.parse(localStorage.getItem('progress'));
    if (progress) {
    
    coins = progress.coins || 0;
    }
  updateCoins();
}

loadProgress();
        

// Basic JS
function toggleActiveWindowChoose(buttonId) {
    document.querySelectorAll('.window-choose-button').forEach(button => {
        button.classList.remove('active');
        button.classList.add('not-active');
    });

    const clickedButton = document.getElementById(buttonId);
    if (clickedButton) {
        clickedButton.classList.remove('not-active');
        clickedButton.classList.add('active');
    }

    document.querySelectorAll('.window').forEach(div => {
        div.style.display = 'none';
    });

    const correspondingDiv = document.getElementById('window' + buttonId.charAt(0).toUpperCase() + buttonId.slice(1));
    if (correspondingDiv) {
        correspondingDiv.style.display = 'block';
    }
}

function formatNumber(number) {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al', 'am', 'an', 'ao', 'ap', 'aq', 'ar', 'as', 'at', 'au', 'av', 'aw', 'ax', 'ay', 'az'];
    
    let i = 0;
    while (number >= 1e3 && i < suffixes.length - 1) {
        number /= 1e3;
        i++;
    }

    return (number.toFixed(2) + suffixes[i]).replace('.00', '');
}

// Update

function updatCoins() {
        
document.getElementById('coins').textContent = formatNumber(coins);
        }

// Werkstatt

let selectedOrder = null;

// Individuelle Intervalle für Worker
const workerIntervals = {
  worker1: 100,
  worker2: 1000,
  worker3: 1000,
  worker4: 1000,
  worker5: 1000,
};

const orders = Array.from({ length: 5 }, (_, i) => document.getElementById(`order${i + 1}`));
const playerDiv = document.getElementById("player");
const workerDivs = {
  worker1: document.getElementById("worker1"),
  worker2: document.getElementById("worker2"),
  worker3: document.getElementById("worker3"),
  worker4: document.getElementById("worker4"),
  worker5: document.getElementById("worker5"),
};

const jobs = [
  { name: "Job 1", work: 50, payment: 50 },
  { name: "Job 2", work: 75, payment: 75 },
  { name: "Job 3", work: 100, payment: 100 },
];

const activeIntervals = {};

startLoading(0);

function startLoading(index) {
  const order = orders[index];
  if (!order || !order.classList.contains("passive")) return;

  order.classList.remove("passive");
  order.classList.add("loading");
  order.textContent = "Auftrag wird gesucht... 10";

  let timer = 10;
  const interval = setInterval(() => {
    timer--;
    order.textContent = `Auftrag wird gesucht... ${timer}`;
    if (timer <= 0) {
      clearInterval(interval);
      spawnJob(order);
      findNextPassiveJob();
    }
  }, 1000);
}

function findNextPassiveJob() {
  let foundPassive = false;
  const interval = setInterval(() => {
    if (!foundPassive) {
      for (let i = 0; i < orders.length; i++) {
        if (orders[i].classList.contains("passive")) {
          startLoading(i);
          foundPassive = true;
          clearInterval(interval);
          break;
        }
      }
    }
  }, 100);
}

function spawnJob(order) {
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  order.classList.remove("loading");
  order.classList.add("job");
  order.innerHTML = `
    <strong>${job.name}</strong>
    <p>Work: ${job.work}</p>
    <p>Payment: ${job.payment} Coins</p>
  `;
  order.dataset.work = job.work;
  order.dataset.progress = 0;
  order.dataset.payment = job.payment;

  order.addEventListener("click", () => handleJobClick(order));
}

function handleJobClick(order) {
  const selector = document.getElementById("selector");
  selector.style.display = "block";
  selectedOrder = order;
}

function player() {
  if (!selectedOrder || !selectedOrder.classList.contains("job")) {
    alert("Du bist schon beschäftigt.");
    return;
  }

  const job = extractJobData(selectedOrder);
  playerDiv.dataset.job = JSON.stringify(job);
  playerDiv.innerHTML = `
    <strong>${job.name}</strong>
    <p>Work: ${job.work}</p>
    <p>Progress: 0/${job.work}</p>
    <p>Payment: ${job.payment} Coins</p>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: 0%;"></div>
    </div>
  `;
  resetJob(selectedOrder);
  playerDiv.addEventListener("click", handlePlayerClick);
  document.getElementById("selector").style.display = "none";
}

function handlePlayerClick() {
  const job = JSON.parse(playerDiv.dataset.job);
  let progress = parseInt(job.progress) || 0;
  progress++;

  const progressBarFill = playerDiv.querySelector(".progress-bar-fill");
  const progressPercentage = Math.min((progress / job.work) * 100, 100);
  progressBarFill.style.width = `${progressPercentage}%`;
  playerDiv.querySelector("p:nth-of-type(2)").textContent = `Progress: ${progress}/${job.work}`;

  if (progress >= job.work) {
    coins += job.payment;
    playerDiv.dataset.job = "";
    playerDiv.innerHTML = "Spieler: Kein Job";
    playerDiv.removeEventListener("click", handlePlayerClick);
    updateCoins();
    saveProgress();
  } else {
    playerDiv.dataset.job = JSON.stringify({ ...job, progress });
  }
}

function worker1() {
  assignJob(workerDivs.worker1, "worker1");
}

function worker2() {
  assignJob(workerDivs.worker2, "worker2");
}

function worker3() {
  assignJob(workerDivs.worker3, "worker3");
}

function worker4() {
  assignJob(workerDivs.worker4, "worker4");
}

function worker5() {
  assignJob(workerDivs.worker5, "worker5");
}

function assignJob(workerDiv, workerId) {
  if (!selectedOrder || !selectedOrder.classList.contains("job")) {
    alert("Es gibt keinen ausgewählten Auftrag.");
    return;
  }

  if (workerDiv.dataset.job) {
    alert("Dieser Mitarbeiter ist bereits beschäftigt.");
    return;
  }

  const job = extractJobData(selectedOrder);
  workerDiv.dataset.job = JSON.stringify(job);
  workerDiv.innerHTML = `
    <strong>${job.name}</strong>
    <p>Work: ${job.work}</p>
    <p>Progress: 0/${job.work}</p>
    <p>Payment: ${job.payment} Coins</p>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: 0%;"></div>
    </div>
  `;
  resetJob(selectedOrder);
  document.getElementById("selector").style.display = "none";

  let progress = 0;
  const interval = setInterval(() => {
    progress++;
    const progressBarFill = workerDiv.querySelector(".progress-bar-fill");
    const progressPercentage = Math.min((progress / job.work) * 100, 100);
    progressBarFill.style.width = `${progressPercentage}%`;
    workerDiv.querySelector("p:nth-of-type(2)").textContent = `Progress: ${progress}/${job.work}`;

    if (progress >= job.work) {
      clearInterval(interval);
      delete activeIntervals[workerId];
      coins += job.payment;
      workerDiv.dataset.job = "";
      workerDiv.innerHTML = "Mitarbeiter: Kein Job";
      updateCoins();
      saveProgress();
    }
  }, workerIntervals[workerId]);

  activeIntervals[workerId] = interval;
}

function resetJob(order) {
  order.classList.remove("job");
  order.classList.add("passive");
  order.textContent = "Passiv";
}

function extractJobData(order) {
  return {
    name: order.querySelector("strong").textContent,
    work: parseInt(order.dataset.work),
    progress: parseInt(order.dataset.progress),
    payment: parseInt(order.dataset.payment),
  };
}
