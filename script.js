let totalEfectivo = 0;
let totalYape = 0;
let historial = [];
let chartMontos = null;
let chartPagos = null;

function obtenerFechaKey() {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
}


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
    guardarDia();
}

/* DESHACER */
function deshacer() {
    if (!historial.length) return;

    const ultimo = historial.pop();
    if (ultimo.tipo === 'efectivo') totalEfectivo -= ultimo.monto;
    else totalYape -= ultimo.monto;

    actualizarUI();
    guardarDia();

}

function eliminarRegistro(indice) {
    const eliminado = historial[indice];

    // Restar del total correspondiente
    if (eliminado.tipo === "efectivo") totalEfectivo -= eliminado.monto;
    else totalYape -= eliminado.monto;

    // Eliminar del historial
    historial.splice(indice, 1);

    actualizarUI();
    guardarDia();

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

        const texto = document.createElement('span');
        texto.textContent = `${i + 1}. ${r.tipo.toUpperCase()} - S/ ${r.monto.toFixed(2)} (${r.hora})`;

        const btn = document.createElement('button');
        btn.textContent = "❌";
        btn.classList.add("btnEliminar");
        btn.onclick = () => eliminarRegistro(i);

        li.appendChild(texto);
        li.appendChild(btn);

        lista.appendChild(li);
    });

    actualizarResumen();

}


/* LOCAL STORAGE */
function guardarDia() {
    const fecha = document.getElementById("fechaSeleccionada").value || obtenerFechaKey();

    const data = {
        historial,
        totalEfectivo,
        totalYape
    };

    localStorage.setItem("ingresos_" + fecha, JSON.stringify(data));
}

function cargarDia(fecha) {
    const data = localStorage.getItem("ingresos_" + fecha);

    if (!data) {
        historial = [];
        totalEfectivo = 0;
        totalYape = 0;
        actualizarUI();
        return;
    }

    const obj = JSON.parse(data);
    historial = obj.historial || [];
    totalEfectivo = obj.totalEfectivo || 0;
    totalYape = obj.totalYape || 0;

    actualizarUI();
}

/* TEMA */
document.getElementById('toggleTheme').onclick = () => {
    document.body.classList.toggle('light');
    actualizarResumen(); // 🔥 refresca colores del gráfico
};

document.getElementById("fechaSeleccionada").value = obtenerFechaKey();


cargar();


function actualizarResumen() {
    const montos = [1, 1.5, 2, 2.5];

    // Contadores
    const efectivoCounts = { 1: 0, 1.5: 0, 2: 0, 2.5: 0 };
    const yapeCounts = { 1: 0, 1.5: 0, 2: 0, 2.5: 0 };

    historial.forEach(r => {
        if (r.tipo === "efectivo") efectivoCounts[r.monto] += 1;
        else yapeCounts[r.monto] += 1;
    });

    const dataEfectivo = montos.map(m => efectivoCounts[m]);
    const dataYape = montos.map(m => yapeCounts[m]);

    // Total registros
    document.getElementById("totalRegistros").innerText = historial.length;

    // TOTAL EFECTIVO VS YAPE
    const totalEf = dataEfectivo.reduce((a, b) => a + b, 0);
    const totalYa = dataYape.reduce((a, b) => a + b, 0);

    /* -----------------------
       GRÁFICO 1: BARRAS
    ------------------------*/
    const ctxMontos = document.getElementById("graficoMontos");

    if (chartMontos) chartMontos.destroy();

    chartMontos = new Chart(ctxMontos, {
        type: "bar",
        data: {
            labels: ["S/1", "S/1.5", "S/2", "S/2.5"],
            datasets: [
                { label: "Efectivo", data: dataEfectivo },
                { label: "Yape", data: dataYape }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: getComputedStyle(document.body).color } }
            },
            scales: {
                x: { ticks: { color: getComputedStyle(document.body).color } },
                y: { ticks: { color: getComputedStyle(document.body).color }, beginAtZero: true }
            }
        }
    });

    /* -----------------------
       GRÁFICO 2: DONA
    ------------------------*/
    const ctxPagos = document.getElementById("graficoPagos");

    if (chartPagos) chartPagos.destroy();

    chartPagos = new Chart(ctxPagos, {
        type: "doughnut",
        data: {
            labels: ["Efectivo", "Yape"],
            datasets: [
                { data: [totalEf, totalYa] }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: getComputedStyle(document.body).color } }
            }
        }
    });
}

function cargarPorFecha() {
    const fecha = document.getElementById("fechaSeleccionada").value;

    if (!fecha) {
        alert("Selecciona una fecha.");
        return;
    }

    const data = localStorage.getItem(`historial_${fecha}`);

    if (!data) {
        historial = [];
        totalEfectivo = 0;
        totalYape = 0;
        actualizarUI();
        alert("No hay registros para ese día.");
        return;
    }

    const d = JSON.parse(data);
    historial = d.historial || [];
    totalEfectivo = d.totalEfectivo || 0;
    totalYape = d.totalYape || 0;

    actualizarUI();
}

function volverHoy() {
    document.getElementById("fechaSeleccionada").value = obtenerFechaKey();
    cargar(); // carga el día actual
}

function exportarTicketPDF() {
    if (historial.length === 0) {
        alert("No hay registros para exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const fecha = document.getElementById("fechaSeleccionada").value || obtenerFechaKey();

    // 📌 Ticket 80mm de ancho
    const ancho = 80; // mm

    // Altura dinámica: base + 6mm por registro aprox
    const alto = Math.max(140, 60 + historial.length * 6);

    const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [ancho, alto]
    });

    let y = 8;

    // ENCABEZADO
    pdf.setFont("courier", "bold");
    pdf.setFontSize(12);
    pdf.text("REGISTRO COLECTIVO", ancho / 2, y, { align: "center" });

    y += 6;
    pdf.setFontSize(9);
    pdf.setFont("courier", "normal");
    pdf.text("Ticket de ingresos del dia", ancho / 2, y, { align: "center" });

    y += 6;
    pdf.text(`Fecha: ${fecha}`, 4, y);

    y += 5;
    pdf.text(`Registros: ${historial.length}`, 4, y);

    y += 4;
    pdf.text("--------------------------------", 4, y);

    // CABECERA TABLA
    y += 5;
    pdf.setFont("courier", "bold");
    pdf.text("HORA", 4, y);
    pdf.text("TIPO", 28, y);
    pdf.text("MONTO", 76, y, { align: "right" });

    y += 3;
    pdf.setFont("courier", "normal");
    pdf.text("--------------------------------", 4, y);

    // LISTA
    y += 5;
    historial.forEach((r) => {
        if (y > alto - 35) {
            // si se queda corto, aumentamos altura
            // (truco: crear otra página sería más complejo para ticket)
        }

        const tipo = r.tipo === "efectivo" ? "EFEC" : "YAPE";

        pdf.text(r.hora, 4, y);
        pdf.text(tipo, 30, y);
        pdf.text(`S/ ${r.monto.toFixed(2)}`, 76, y, { align: "right" });

        y += 6;
    });

    // PIE / TOTALES
    y += 2;
    pdf.text("--------------------------------", 4, y);

    y += 7;
    pdf.setFont("courier", "bold");
    pdf.text("TOTAL EFECTIVO:", 4, y);
    pdf.text(`S/ ${totalEfectivo.toFixed(2)}`, 76, y, { align: "right" });

    y += 6;
    pdf.text("TOTAL YAPE:", 4, y);
    pdf.text(`S/ ${totalYape.toFixed(2)}`, 76, y, { align: "right" });

    y += 7;
    pdf.setFontSize(11);
    pdf.text("TOTAL GENERAL:", 4, y);
    pdf.text(`S/ ${(totalEfectivo + totalYape).toFixed(2)}`, 76, y, { align: "right" });

    y += 10;
    pdf.setFont("courier", "normal");
    pdf.setFontSize(9);
    pdf.text("Gracias. Buen viaje 🚐", ancho / 2, y, { align: "center" });

    pdf.save(`ticket_${fecha}.pdf`);
}