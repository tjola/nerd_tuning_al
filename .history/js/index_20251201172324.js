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

// EXPORT – shkarkon skedar Excel (CSV) që hapet në Excel
function exportData() {
  if (typeof XLSX === 'undefined') {
    alert('SheetJS (XLSX) nuk u gjet. Sigurohu që skripta e XLSX është ngarkuar.');
    return;
  }

  // Build worksheet data: header + rows
  const ws_data = [];
  ws_data.push([
    'Targa', 'VIN', 'Marka', 'Modeli', 'Viti', 'Klienti', 'Telefoni', 'Kilometra',
    'Puna Data', 'Puna Përshkrim', 'Puna Çmim', 'Puna KM', 'Total Per Automjet'
  ]);

  cars.forEach(car => {
    const total = car.works.reduce((s,w) => s + (parseFloat(w.cost)||0), 0);
    if (!car.works || car.works.length === 0) {
      ws_data.push([
        car.plate, car.vin, car.make, car.model, car.year, car.client.name, car.client.phone, car.km,
        '', '', '', '', total
      ]);
    } else {
      car.works.forEach(w => {
        // Keep date as string so Excel shows it; optionally convert to Date object if desired
        const dateVal = w.date || '';
        ws_data.push([
          car.plate, car.vin, car.make, car.model, car.year, car.client.name, car.client.phone, car.km,
          dateVal, w.description, w.cost, w.km || '', total
        ]);
      });
    }
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Optionally set column widths for better display in Excel
  const colWidths = [
    { wch: 12 }, // Targa
    { wch: 20 }, // VIN
    { wch: 15 }, // Marka
    { wch: 20 }, // Modeli
    { wch: 8 },  // Viti
    { wch: 20 }, // Klienti
    { wch: 15 }, // Telefoni
    { wch: 12 }, // Kilometra
    { wch: 12 }, // Puna Data
    { wch: 40 }, // Puna Përshkrim
    { wch: 12 }, // Puna Çmim
    { wch: 10 }, // Puna KM
    { wch: 15 }  // Total
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Garazh');

  // Write workbook to binary array
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toLocaleDateString('sq-AL').replace(/\//g, '-');
  a.download = `garazh-backup-${date}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert('Të gjitha të dhënat u shkarkuan (XLSX).');
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