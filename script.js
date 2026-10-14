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
function exportarCSV() {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  // Filtrar solo movimientos del mes actual
  const delMes = movimientos.filter(m => {
    const f = new Date(m.fecha);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  });

  if (delMes.length === 0) {
    mostrarToast('No hay movimientos este mes para exportar', 'error');
    return;
  }

  // Encabezados del CSV
  const encabezados = [
    'Fecha',
    'Tipo',
    'Categoría',
    'Descripción',
    'Monto Total',
    'Neto',
    'IVA',
    'Forma de Pago / Documento'
  ];

  // Ordenar por fecha (más antiguo primero, como un libro contable)
  const ordenados = [...delMes].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Procesar cada movimiento
  const filas = ordenados.map(m => {
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

    return [
      fechaStr,
      tipo,
      categoria,
      m.desc,
      m.monto,
      m.neto,
      m.iva,
      metodo
    ];
  });

  // Calcular totales
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
  const gananciaReal = margenBruto - totalGastos - ivaPagar; // ⬅️ IVA descontado

  // Construir el CSV
  const lineas = [];

  // Título del reporte
  const nombreMes = ahora.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  lineas.push(`"Reporte MiPyme Chile - ${nombreMes.toUpperCase()}"`);
  lineas.push('');

  // Encabezados
  lineas.push(encabezados.map(h => `"${h}"`).join(';'));

  // Filas
  filas.forEach(fila => {
    const filaFormateada = fila.map((valor, i) => {
      // Los montos (índices 4, 5, 6) van sin comillas para que Excel los reconozca como números
      if (i >= 4 && i <= 6) {
        return Math.round(valor); // Entero, sin decimales (CLP no usa centavos)
      }
      // El resto va entre comillas (texto)
      return `"${valor}"`;
    });
    lineas.push(filaFormateada.join(';'));
  });

  // Línea vacía antes del resumen
  lineas.push('');

  // RESUMEN FINAL
  lineas.push('"RESUMEN DEL MES"');
  lineas.push(`"Ventas totales";${Math.round(totalVentas)}`);
  lineas.push(`"Mercadería comprada";${Math.round(totalMercaderia)}`);
  lineas.push(`"Gastos del local";${Math.round(totalGastos)}`);
  lineas.push(`"Margen bruto";${Math.round(margenBruto)}`);
  lineas.push(`"Ganancia real";${Math.round(gananciaReal)}`);
  lineas.push(`"IVA débito (ventas)";${Math.round(ivaDebito)}`);
  lineas.push(`"IVA crédito (compras con factura)";${Math.round(ivaCredito)}`);
  lineas.push(`"IVA a pagar al SII";${Math.round(ivaPagar)}`);

  // Unir todo con saltos de línea
  const contenidoCSV = lineas.join('\r\n'); // ⬅️ Windows usa \r\n

  // Crear el blob SIN BOM explícito
  // (usar el type correcto hace que Excel/Sheets detecten UTF-8 automáticamente)
  const blob = new Blob([contenidoCSV], { 
    type: 'text/csv;charset=utf-8;' 
  });

    // Nombre del archivo
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();
  const nombreArchivo = `MiPyme-Reporte-${anio}-${mes}.csv`;

  // Descargar
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);

  mostrarToast('📊 Reporte descargado: ' + nombreArchivo);
}
// ============================================================
// INICIO
// ============================================================

actualizar();