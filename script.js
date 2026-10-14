// ============================================================
// MiPyme Chile - Lógica v2 (con margen bruto y ganancia real)
// ============================================================

// ---------- CONSTANTES ----------
const IVA = 0.19; // 19% en Chile
const STORAGE_KEY = 'mipyme_movimientos';

// ---------- ESTADO ----------
let movimientos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// ============================================================
// UTILIDADES
// ============================================================

function formatearCLP(n) {
  return '$' + Math.round(n).toLocaleString('es-CL');
}

function mostrarToast(msg, tipo = 'exito') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + tipo + ' visible';
  setTimeout(() => t.className = 'toast ' + tipo, 2500);
}

function cambiarTab(cual) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  if (cual === 'venta') {
    document.querySelector('.tab.venta').classList.add('active');
    document.getElementById('formVenta').style.display = 'block';
    document.getElementById('formCompra').style.display = 'none';
  } else {
    document.querySelectorAll('.tab')[1].classList.add('active');
    document.getElementById('formVenta').style.display = 'none';
    document.getElementById('formCompra').style.display = 'block';
  }
}

// ============================================================
// REGISTRAR MOVIMIENTOS
// ============================================================

function registrarVenta() {
  const desc = document.getElementById('descVenta').value.trim();
  const monto = parseFloat(document.getElementById('montoVenta').value);
  const pago = document.getElementById('pagoVenta').value;

  if (!desc) return mostrarToast('Escribe qué vendiste', 'error');
  if (!monto || monto <= 0) return mostrarToast('Ingresa un monto válido', 'error');

  // En Chile, si el monto es final, el IVA está incluido
  const neto = monto / (1 + IVA);
  const iva = monto - neto;

  movimientos.unshift({
    id: Date.now(),
    tipo: 'venta',
    desc,
    monto,
    neto,
    iva,
    pago,
    fecha: new Date().toISOString()
  });

  guardar();
  limpiarFormulario('venta');
  mostrarToast('✅ Venta registrada');
  actualizar();
}

function registrarCompra() {
  const desc = document.getElementById('descCompra').value.trim();
  const monto = parseFloat(document.getElementById('montoCompra').value);
  const doc = document.getElementById('docCompra').value;
  const categoria = document.getElementById('tipoCompra').value;

  if (!desc) return mostrarToast('Escribe qué compraste o pagaste', 'error');
  if (!monto || monto <= 0) return mostrarToast('Ingresa un monto válido', 'error');

  // Solo las facturas dan crédito IVA
  const neto = monto / (1 + IVA);
  const iva = doc === 'factura' ? (monto - neto) : 0;

  movimientos.unshift({
    id: Date.now(),
    tipo: 'compra',
    categoria, // 'mercaderia' o 'gasto'
    desc,
    monto,
    neto,
    iva,
    doc,
    fecha: new Date().toISOString()
  });

  guardar();
  limpiarFormulario('compra');
  mostrarToast(categoria === 'gasto' ? '✅ Gasto registrado' : '✅ Compra registrada');
  actualizar();
}

function limpiarFormulario(tipo) {
  if (tipo === 'venta') {
    document.getElementById('descVenta').value = '';
    document.getElementById('montoVenta').value = '';
  } else {
    document.getElementById('descCompra').value = '';
    document.getElementById('montoCompra').value = '';
  }
}

// ============================================================
// ELIMINAR
// ============================================================

function eliminar(id) {
  if (!confirm('¿Seguro que quieres borrar este movimiento?')) return;
  movimientos = movimientos.filter(m => m.id !== id);
  guardar();
  actualizar();
  mostrarToast('Movimiento eliminado');
}

// ============================================================
// PERSISTENCIA
// ============================================================

function guardar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientos));
}

// ============================================================
// ACTUALIZAR PANTALLA
// ============================================================
function actualizar() {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const delMes = movimientos.filter(m => {
    const f = new Date(m.fecha);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  });

  let ventas = 0;
  let mercaderia = 0;
  let gastos = 0;
  let ivaDebito = 0;
  let ivaCredito = 0;

  delMes.forEach(m => {
    if (m.tipo === 'venta') {
      ventas += m.monto;
      ivaDebito += m.iva;
    } else {
      if (m.categoria === 'gasto') {
        gastos += m.monto;
      } else {
        mercaderia += m.monto;
      }
      ivaCredito += m.iva;
    }
  });

  // Cálculos
  const margenBruto = ventas - mercaderia;
  const ivaPagar = Math.max(0, ivaDebito - ivaCredito);
  const gananciaAntesIVA = margenBruto - gastos;
  const gananciaReal = gananciaAntesIVA - ivaPagar; // ⬅️ IVA descontado

  // Actualizar tarjetas
  document.getElementById('totalVentas').textContent = formatearCLP(ventas);
  document.getElementById('totalCompras').textContent = formatearCLP(mercaderia);
  document.getElementById('totalGastos').textContent = formatearCLP(gastos);
  document.getElementById('margenBruto').textContent = formatearCLP(margenBruto);
  document.getElementById('ivaPagar').textContent = formatearCLP(ivaPagar);
  document.getElementById('ganancia').textContent = formatearCLP(gananciaReal);

  // Estado emocional
  const estado = document.getElementById('estado');
  const emoji = estado.querySelector('.emoji');
  const mensaje = estado.querySelector('.mensaje');

  if (delMes.length === 0) {
    emoji.textContent = '😊';
    mensaje.textContent = 'Registra tu primera venta para empezar';
  } else if (gananciaReal > 0 && margenBruto > 0) {
    emoji.textContent = '🎉';
    mensaje.textContent = `¡Ganancia real: ${formatearCLP(gananciaReal)} este mes! Sigue así.`;
  } else if (gananciaReal > 0 && margenBruto <= 0) {
    emoji.textContent = '😅';
    mensaje.textContent = `Ganas ${formatearCLP(gananciaReal)} pero vendes bajo costo. Revisa precios.`;
  } else if (gananciaReal <= 0 && margenBruto > 0) {
    emoji.textContent = '😐';
    mensaje.textContent = `Margen OK, pero gastos (${formatearCLP(gastos)}) e IVA (${formatearCLP(ivaPagar)}) se comen la ganancia.`;
  } else {
    emoji.textContent = '😟';
    mensaje.textContent = `Pierdes ${formatearCLP(Math.abs(gananciaReal))}. Revisa precios y gastos.`;
  }

  // Lista de movimientos
  renderizarLista();
}
function renderizarLista() {
  const lista = document.getElementById('listaMovimientos');

  if (movimientos.length === 0) {
    lista.innerHTML = '<div class="vacio">Aquí verás tus ventas y compras</div>';
    return;
  }

  lista.innerHTML = movimientos.slice(0, 20).map(m => {
    const fecha = new Date(m.fecha);
    const fechaStr = fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    const signo = m.tipo === 'venta' ? '+' : '-';
    const clase = m.tipo === 'venta' ? 'positivo' : 'negativo';

    // Ícono según tipo
    let icono;
    if (m.tipo === 'venta') {
      icono = '🟢';
    } else if (m.categoria === 'gasto') {
      icono = '💡';
    } else {
      icono = '🛒';
    }

    // Etiqueta secundaria
    const etiqueta = m.tipo === 'venta'
      ? (m.pago || '')
      : (m.categoria === 'gasto' ? 'gasto' : 'mercadería');

    return `
      <div class="item">
        <div class="info">
          <div class="titulo">${icono} ${m.desc}</div>
          <div class="fecha">${fechaStr} · ${etiqueta}</div>
        </div>
        <div class="monto ${clase}">${signo}${formatearCLP(m.monto)}</div>
        <button class="eliminar" onclick="eliminar(${m.id})">✕</button>
      </div>
    `;
  }).join('');
}

// ============================================================
// ACCIONES DE RESPALDO
// ============================================================

function exportarDatos() {
  const data = JSON.stringify(movimientos, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mipyme-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast('📥 Respaldo descargado');
}

function borrarMes() {
  if (!confirm('¿Borrar TODOS los movimientos? Esta acción no se puede deshacer.')) return;
  if (!confirm('¿Estás realmente seguro?')) return;
  movimientos = [];
  guardar();
  actualizar();
  mostrarToast('🗑️ Datos borrados');
}

// ============================================================
// EXPORTAR A CSV (Excel) — Reporte para el contador
// ============================================================

/**
 * Genera un archivo CSV con todos los movimientos del mes actual
 * Formato compatible con Excel chileno (separador ; y decimales con coma)
 */
// ============================================================
// EXPORTAR A EXCEL (.xlsx) — Reporte para el contador
// ============================================================

function exportarCSV() {
  // Verificar que SheetJS está cargado
  if (typeof XLSX === 'undefined') {
    mostrarToast('Error: no se cargó la librería Excel', 'error');
    return;
  }

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  // Filtrar movimientos del mes actual
  const delMes = movimientos.filter(m => {
    const f = new Date(m.fecha);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  });

  if (delMes.length === 0) {
    mostrarToast('No hay movimientos este mes para exportar', 'error');
    return;
  }

  // ---------- HOJA 1: Movimientos del mes ----------
  const ordenados = [...delMes].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const datos = ordenados.map(m => {
    const fecha = new Date(m.fecha);
    const fechaStr = fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const tipo = m.tipo === 'venta' ? 'Venta' : 'Compra';
    const categoria = m.tipo === 'venta'
      ? 'Venta'
      : (m.categoria === 'gasto' ? 'Gasto del local' : 'Mercadería');

    const metodo = m.tipo === 'venta'
      ? (m.pago || '')
      : (m.doc || '');

    return {
      'Fecha': fechaStr,
      'Tipo': tipo,
      'Categoría': categoria,
      'Descripción': m.desc,
      'Monto Total': Math.round(m.monto),
      'Neto': Math.round(m.neto),
      'IVA': Math.round(m.iva),
      'Forma de Pago / Documento': metodo
    };
  });

  // Crear hoja con los datos
  const hojaMovimientos = XLSX.utils.json_to_sheet(datos);

  // Ancho de columnas
  hojaMovimientos['!cols'] = [
    { wch: 12 },  // Fecha
    { wch: 10 },  // Tipo
    { wch: 18 },  // Categoría
    { wch: 30 },  // Descripción
    { wch: 14 },  // Monto Total
    { wch: 14 },  // Neto
    { wch: 12 },  // IVA
    { wch: 22 }   // Forma de Pago
  ];

  // ---------- HOJA 2: Resumen del mes ----------
  let totalVentas = 0, totalMercaderia = 0, totalGastos = 0;
  let ivaDebito = 0, ivaCredito = 0;

  delMes.forEach(m => {
    if (m.tipo === 'venta') {
      totalVentas += m.monto;
      ivaDebito += m.iva;
    } else if (m.categoria === 'gasto') {
      totalGastos += m.monto;
      ivaCredito += m.iva;
    } else {
      totalMercaderia += m.monto;
      ivaCredito += m.iva;
    }
  });

  const margenBruto = totalVentas - totalMercaderia;
  const ivaPagar = Math.max(0, ivaDebito - ivaCredito);
  const gananciaAntesIVA = margenBruto - totalGastos;
  const gananciaReal = gananciaAntesIVA - ivaPagar;

  const resumen = [
    { 'Concepto': 'Ventas totales', 'Monto': Math.round(totalVentas) },
    { 'Concepto': 'Mercadería comprada', 'Monto': Math.round(totalMercaderia) },
    { 'Concepto': 'Gastos del local', 'Monto': Math.round(totalGastos) },
    { 'Concepto': 'Margen bruto', 'Monto': Math.round(margenBruto) },
    { 'Concepto': 'Ganancia antes de IVA', 'Monto': Math.round(gananciaAntesIVA) },
    { 'Concepto': 'IVA débito (ventas)', 'Monto': Math.round(ivaDebito) },
    { 'Concepto': 'IVA crédito (compras con factura)', 'Monto': Math.round(ivaCredito) },
    { 'Concepto': 'IVA a pagar al SII', 'Monto': Math.round(ivaPagar) },
    { 'Concepto': 'Ganancia real (después de IVA)', 'Monto': Math.round(gananciaReal) }
  ];

  const hojaResumen = XLSX.utils.json_to_sheet(resumen);

  hojaResumen['!cols'] = [
    { wch: 40 },
    { wch: 18 }
  ];

  // ---------- Crear el libro con 2 hojas ----------
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaMovimientos, 'Movimientos');
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen');

  // ---------- Nombre del archivo ----------
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();
  const nombreArchivo = `MiPyme-Reporte-${anio}-${mes}.xlsx`;

  // ---------- Descargar ----------
  XLSX.writeFile(libro, nombreArchivo);

  mostrarToast('📊 Reporte descargado: ' + nombreArchivo);
}
// ============================================================
// INICIO
// ============================================================

actualizar();