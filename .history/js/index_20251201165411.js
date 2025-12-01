let cars = [];

// Ngarko të dhënat kur hapet faqja
window.onload = () => {
  const saved = localStorage.getItem('garazh_v2');
  if (saved) {
    try { cars = JSON.parse(saved); }
    catch(e) { console.log("Të dhëna të vjetra të dëmtuara"); }
  }
  displayRecords();
  updateCarSelect();
};

// Ruaj në localStorage
function saveData() {
  localStorage.setItem('garazh_v2', JSON.stringify(cars));
}

// Shto automjet
function addCar() {
  const emri = document.getElementById('clientName').value.trim();
  const tel = document.getElementById('clientPhone').value.trim();
  const targa = document.getElementById('carPlate').value.trim().toUpperCase();
  const vin = document.getElementById('carVin').value.trim().toUpperCase();
  const km = document.getElementById('carKm').value || "0";

  if (!emri || !targa) return alert("Emri dhe Targa janë të detyrueshme!");

  if (cars.some(c => c.plate === targa)) return alert("Kjo targë ekziston tashmë!");

  cars.push({
    plate: targa,
    vin: vin || "—",
    make: document.getElementById('carMake').value.trim() || "—",
    model: document.getElementById('carModel').value.trim() || "—",
    year: document.getElementById('carYear').value || "—",
    km: parseInt(km) || 0,
    client: { name: emri, phone: tel || "—" },
    works: []
  });

  // Pastro formën
  "clientName clientPhone carPlate carVin carMake carModel carYear carKm".split(" ").forEach(id => 
    document.getElementById(id).value = ""
  );

  saveData();
  displayRecords();
  updateCarSelect();
  alert("Automjeti u shtua me sukses!");
}

// Shto punë
function addWork() {
  const targa = document.getElementById('workCarSelect').value;
  const pershkrim = document.getElementById('workDescription').value.trim();
  const cmimi = parseFloat(document.getElementById('workCost').value) || 0;
  const kmTani = document.getElementById('workKm').value;
  const data = document.getElementById('workDate').value || new Date().toISOString().split('T')[0];

  if (!targa || !pershkrim) return alert("Zgjidh automjetin dhe shkruaj punën!");

  const car = cars.find(c => c.plate === targa);
  car.works.push({ 
    date: data, 
    description: pershkrim, 
    cost: cmimi,
    km: kmTani ? parseInt(kmTani) : null
  });

  // Përditëso kilometrat aktuale të makinës nëse u plotësua
  if (kmTani) car.km = parseInt(kmTani);

  document.getElementById('workDescription').value = '';
  document.getElementById('workCost').value = '';
  document.getElementById('workKm').value = '';
  document.getElementById('workDate').value = '';

  saveData();
  displayRecords();
  alert("Puna u ruajt!");
}

// Përditëso dropdown
function updateCarSelect() {
  const sel = document.getElementById('workCarSelect');
  sel.innerHTML = '<option>-- Zgjidh Automjetin --</option>';
  cars.forEach(car => {
    const opt = new Option(`${car.plate} | ${car.vin.substring(0,8)}... | ${car.make} ${car.model} (${car.client.name})`, car.plate);
    sel.add(opt);
  });
}

// Shfaq tabelën
function displayRecords() {
  const div = document.getElementById('records');
  if (cars.length === 0) {
    div.innerHTML = "<p style='text-align:center; color:#666;'>Nuk ka automjete ende. Shto njërin më sipër!</p>";
    return;
  }
  let html = '<table><tr><th>Targa</th><th>VIN</th><th>Automjeti</th><th>Klienti</th><th>KM</th><th>Puna</th><th>Total</th><th>Veprime</th></tr>';
  cars.forEach(car => {
    const total = car.works.reduce((s,w) => s + w.cost, 0).toFixed(0);
    let puna = car.works.length ? '' : '<em>Pa punë</em>';
    car.works.forEach((w, wi) => {
      const kmText = w.km ? ` (${w.km} km)` : '';
      puna += `<div class="work-item"><strong>${w.date}</strong>: ${w.description}${kmText} — ${w.cost} lekë
        <button class="small" onclick="editWork('${car.plate}', ${wi})">Edit</button>
        <button class="small" onclick="deleteWork('${car.plate}', ${wi})">Fshi</button>
      </div>`;
    });
    html += `<tr>
      <td><strong>${car.plate}</strong></td>
      <td>${car.vin}</td>
      <td>${car.year} ${car.make} ${car.model}</td>
      <td>${car.client.name}<br><small>${car.client.phone}</small></td>
      <td>${car.km.toLocaleString()} km</td>
      <td>${puna}</td>
      <td><strong>${total} lekë</strong></td>
      <td>
        <button onclick="editCar('${car.plate}')">Edit</button>
        <button onclick="deleteCar('${car.plate}')">Fshi</button>
      </td>
    </tr>`;
  });
  html += '</table>';
  div.innerHTML = html;
}

// Edit a car's main data (prompts for values)
function editCar(plate) {
  const car = cars.find(c => c.plate === plate);
  if (!car) return alert('Automjeti nuk u gjet.');

  const newPlate = prompt('Targa', car.plate);
  if (!newPlate) return; // cancelled
  const t = newPlate.trim().toUpperCase();
  if (t !== car.plate && cars.some(c => c.plate === t)) return alert('Kjo targë ekziston tashmë!');

  car.plate = t;
  car.vin = (prompt('VIN', car.vin) || car.vin).toUpperCase();
  car.make = prompt('Marka', car.make) || car.make;
  car.model = prompt('Modeli', car.model) || car.model;
  const year = prompt('Viti', car.year);
  car.year = year ? year : car.year;
  const km = prompt('Kilometra aktuale', car.km);
  car.km = km ? (parseInt(km) || car.km) : car.km;
  car.client.name = prompt('Emri i klientit', car.client.name) || car.client.name;
  car.client.phone = prompt('Telefoni', car.client.phone) || car.client.phone;

  saveData();
  displayRecords();
  updateCarSelect();
  alert('Të dhënat u përditësuan.');
}

// Edit a specific work entry for a car
function editWork(plate, index) {
  const car = cars.find(c => c.plate === plate);
  if (!car) return alert('Automjeti nuk u gjet.');
  const w = car.works[index];
  if (!w) return alert('Puna nuk u gjet.');

  const desc = prompt('Përshkrimi i punës', w.description);
  if (desc === null) return; // cancelled
  w.description = desc.trim() || w.description;

  const cost = prompt('Çmimi', w.cost);
  w.cost = cost !== null ? (parseFloat(cost) || 0) : w.cost;

  const date = prompt('Data (YYYY-MM-DD)', w.date);
  w.date = date || w.date;

  const km = prompt('Kilometra (opsionale)', w.km !== undefined && w.km !== null ? w.km : '');
  w.km = km ? (parseInt(km) || null) : (w.km || null);

  // Optionally update car km
  if (w.km) car.km = w.km;

  saveData();
  displayRecords();
  alert('Puna u përditësua.');
}

// Delete a work entry
function deleteWork(plate, index) {
  const car = cars.find(c => c.plate === plate);
  if (!car) return alert('Automjeti nuk u gjet.');
  if (!car.works[index]) return alert('Puna nuk u gjet.');
  if (!confirm('A jeni i sigurt që dëshironi të fshini këtë punë?')) return;
  car.works.splice(index, 1);
  saveData();
  displayRecords();
  alert('Puna u fshi.');
}

// Delete a car entirely
function deleteCar(plate) {
  if (!confirm('A jeni i sigurt që dëshironi të fshini këtë automjet dhe historinë e tij?')) return;
  const idx = cars.findIndex(c => c.plate === plate);
  if (idx === -1) return alert('Automjeti nuk u gjet.');
  cars.splice(idx, 1);
  saveData();
  displayRecords();
  updateCarSelect();
  alert('Automjeti u fshi.');
}

// EXPORT – shkarkon skedar të bukur të lexueshëm
function exportData() {
  let text = "GARAZH AUTO - TË DHËNAT E PLOTA\n";
  text += "Data: " + new Date().toLocaleString('sq-AL') + "\n";
  text += "=".repeat(50) + "\n\n";

  cars.forEach((car, i) => {
    text += `${i+1}. Targa: ${car.plate}\n`;
    text += `   VIN: ${car.vin}\n`;
    text += `   Automjeti: ${car.year} ${car.make} ${car.model}\n`;
    text += `   Klienti: ${car.client.name} | ${car.client.phone}\n`;
    text += `   Kilometrat aktuale: ${car.km.toLocaleString()} km\n`;
    text += `   Total i paguar: ${car.works.reduce((s,w)=>s+w.cost,0)} lekë\n`;
    text += `   Historia e punëve:\n`;
    if (car.works.length === 0) text += "      — Ende pa punë\n";
    else {
      car.works.forEach(w => {
        const km = w.km ? ` (${w.km} km)` : '';
        text += `      • ${w.date}: ${w.description}${km} — ${w.cost} lekë\n`;
      });
    }
    text += "-".repeat(40) + "\n\n";
  });

  const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toLocaleDateString('sq-AL').replace(/\//g, '-');
  a.download = `garazh-backup-${date}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  alert("Të gjitha të dhënat u shkarkuan!");
}

// IMPORT – ngarkon nga skedari
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const content = ev.target.result;
      // Provo si JSON i vjetër
      try {
        cars = JSON.parse(content);
      } catch {
        // Nëse nuk është JSON, provo formatin e ri të lexueshëm (për momentin pranon vetëm JSON)
        alert("Përdor vetëm skedarët e shkarkuar nga ky program!");
        return;
      }
      saveData();
      displayRecords();
      updateCarSelect();
      alert("Të dhënat u importuan me sukses!");
    } catch(err) {
      alert("Gabim: Skedari nuk është i vlefshëm!");
    }
  };
  reader.readAsText(file);
}