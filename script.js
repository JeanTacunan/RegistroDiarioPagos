let totalEfectivo = 0;
let totalYape = 0;

function agregar(monto, tipo) {
    if (tipo === 'efectivo') {
        totalEfectivo += monto;
        document.getElementById('totalEfectivo').innerText = totalEfectivo.toFixed(2);
    } else {
        totalYape += monto;
        document.getElementById('totalYape').innerText = totalYape.toFixed(2);
    }

    let totalGeneral = totalEfectivo + totalYape;
    document.getElementById('totalGeneral').innerText = totalGeneral.toFixed(2);
}
