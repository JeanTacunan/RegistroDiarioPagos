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

    if (tipo === 'efectivo') {
        totalEfectivo += monto;
        document.getElementById('totalEfectivo').innerText = totalEfectivo.toFixed(2);
    } else {
        totalYape += monto;
        document.getElementById('totalYape').innerText = totalYape.toFixed(2);
    }

    actualizarTotal();
    actualizarHistorial();
    guardarHistorial();
}

/* DESHACER ÚLTIMA ACCIÓN */
function deshacer() {
    if (historial.length === 0) return;

    const ultimo = historial.pop();

    if (ultimo.tipo === 'efectivo') {
        totalEfectivo -= ultimo.monto;
        document.getElementById('totalEfectivo').innerText = totalEfectivo.toFixed(2);
    } else {
        totalYape -= ultimo.monto;
        document.getElementById('totalYape').innerText = totalYape.toFixed(2);
    }

    actualizarTotal();
    actualizarHistorial();
    guardarHistorial();
}

/* ACTUALIZAR TOTAL GENERAL */
function actualizarTotal() {
    document.getElementById('totalGeneral').innerText =
        (totalEfectivo + totalYape).toFixed(2);
}

/* MOSTRAR HISTORIAL */
function actualizarHistorial() {
    const lista = document.getElementById('listaHistorial');
    lista.innerHTML = '';

    historial.forEach((r, i) => {
        const li = document.createElement('li');
        li.innerText = `${i + 1}. ${r.tipo.toUpperCase()} - S/ ${r.monto.toFixed(2)} (${r.hora})`;
        lista.appendChild(li);
    });
}

/* GUARDAR POR DÍA */
function guardarHistorial() {
    const fecha = new Date().toLocaleDateString();
    localStorage.setItem(`historial_${fecha}`, JSON.stringify({
        historial,
        totalEfectivo,
        totalYape
    }));
}

/* CARGAR AL ABRIR */
function cargarHistorial() {
    const fecha = new Date().toLocaleDateString();
    const data = localStorage.getItem(`historial_${fecha}`);

    if (!data) return;

    const guardado = JSON.parse(data);
    historial = guardado.historial || [];
    totalEfectivo = guardado.totalEfectivo || 0;
    totalYape = guardado.totalYape || 0;

    document.getElementById('totalEfectivo').innerText = totalEfectivo.toFixed(2);
    document.getElementById('totalYape').innerText = totalYape.toFixed(2);

    actualizarTotal();
    actualizarHistorial();
}

cargarHistorial();
