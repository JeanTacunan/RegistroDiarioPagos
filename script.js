let totalEfectivo = 0;
let totalYape = 0;
let historial = [];

/* AGREGAR INGRESO */
function agregar(monto, tipo) {
    const registro = {
        monto,
        tipo,
        hora: new Date().toLocaleTimeString()
    };

    historial.push(registro);

    if (tipo === 'efectivo') totalEfectivo += monto;
    else totalYape += monto;

    actualizarUI();
    guardar();
}

/* DESHACER */
function deshacer() {
    if (!historial.length) return;

    const ultimo = historial.pop();
    if (ultimo.tipo === 'efectivo') totalEfectivo -= ultimo.monto;
    else totalYape -= ultimo.monto;

    actualizarUI();
    guardar();
}

/* UI */
function actualizarUI() {
    document.getElementById('totalEfectivo').innerText = totalEfectivo.toFixed(2);
    document.getElementById('totalYape').innerText = totalYape.toFixed(2);
    document.getElementById('totalGeneral').innerText =
        (totalEfectivo + totalYape).toFixed(2);

    const lista = document.getElementById('listaHistorial');
    lista.innerHTML = '';
    historial.forEach((r, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${r.tipo.toUpperCase()} - S/ ${r.monto.toFixed(2)} (${r.hora})`;
        lista.appendChild(li);
    });
}

/* LOCAL STORAGE */
function guardar() {
    const fecha = new Date().toLocaleDateString();
    localStorage.setItem(`historial_${fecha}`, JSON.stringify({
        historial,
        totalEfectivo,
        totalYape
    }));
}

function cargar() {
    const fecha = new Date().toLocaleDateString();
    const data = localStorage.getItem(`historial_${fecha}`);
    if (!data) return;

    const d = JSON.parse(data);
    historial = d.historial || [];
    totalEfectivo = d.totalEfectivo || 0;
    totalYape = d.totalYape || 0;
    actualizarUI();
}

/* TEMA */
document.getElementById('toggleTheme').onclick = () => {
    document.body.classList.toggle('light');
};

cargar();
