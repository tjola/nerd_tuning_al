<script>
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

  let html = '<table><tr><th>Targa</th><th>VIN</th><th>Automjeti</th><th>Klienti</th><th>KM</th><th>Puna</th><th>Total</th></tr>';
  cars.forEach(car => {
    const total = car.works.reduce((s,w) => s + w.cost, 0).toFixed(0);
    let puna = car.works.length ? '' : '<em>Pa punë</em>';
    car.works.forEach(w => {
      const kmText = w.km ? ` (${w.km} km)` : '';
      puna += `<div class="work-item"><strong>${w.date}</strong>: ${w.description}${kmText} — ${w.cost} lekë</div>`;
    });
    html += `<tr>
      <td><strong>${car.plate}</strong></td>
      <td>${car.vin}</td>
      <td>${car.year} ${car.make} ${car.model}</td>
      <td>${car.client.name}<br><small>${car.client.phone}</small></td>
      <td>${car.km.toLocaleString()} km</td>
      <td>${puna}</td>
      <td><strong>${total} lekë</strong></td>
    </tr>`;
  });
  html += '</table>';
  div.innerHTML = html;
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
</script>