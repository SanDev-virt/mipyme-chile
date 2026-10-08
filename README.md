# 🇨🇱 MiPyme Chile

**App web simple para que PYMES chilenas registren compras y ventas sin saber contabilidad.**

Diseñada para dueños de almacenes, ferreterías, minimarkets, panaderías y pequeños negocios que quieren saber **si están ganando o perdiendo** sin aprender términos contables.

![Estado](https://img.shields.io/badge/estado-funcional-brightgreen)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)
![Idioma](https://img.shields.io/badge/idioma-español-red)

---

## ✨ ¿Qué hace esta app?

Registra en segundos:

- 🟢 **Ventas** → "vendí 2 bebidas por $5.000"
- 🛒 **Compras de mercadería** → "compré caja de bebidas por $30.000"
- 💡 **Gastos del local** → "pagué arriendo $200.000"

Y calcula automáticamente:

- 💰 **Ventas del mes**
- 🛒 **Mercadería comprada**
- 💡 **Gastos del mes**
- 📊 **IVA a pagar al SII** (19% Chile)
- 📈 **Margen bruto** (ventas − mercadería)
- ✅ **Ganancia real** (margen − gastos)

Además, muestra un **mensaje emocional** en lenguaje simple: 🎉 😊 😟 😐

---

## 🎯 ¿Para quién es?

- Almacenes y minimarkets
- Ferreterías
- Panaderías y pastelerías
- Verdulerías y fruterías
- Peluquerías
- Talleres pequeños
- Cualquier negocio que **no tenga contador**

**No necesitas saber:**
- ❌ Debe y haber
- ❌ Plan de cuentas
- ❌ Asientos contables
- ❌ F29 ni F22

**Solo necesitas saber:**
- ✅ Cuánto vendiste hoy
- ✅ Cuánto compraste
- ✅ Cuánto pagaste de gastos

---

## 🚀 Cómo usar la app

### Opción 1: Abrir directamente
1. Descarga la carpeta `mipyme-chile`
2. Haz doble clic en `index.html`
3. Se abre en tu navegador

### Opción 2: Con Live Server (recomendado para desarrollo)
1. Abre la carpeta en VS Code
2. Instala la extensión **Live Server**
3. Clic derecho sobre `index.html` → **Open with Live Server**

### Opción 3: Desde internet
Si ya la subiste a Netlify/Vercel, solo abre la URL desde cualquier dispositivo.

---

## 📂 Estructura del proyecto

```
mipyme-chile/
│
├── index.html      ← Estructura de la página
├── styles.css      ← Diseño visual
├── script.js       ← Lógica de la app
└── README.md       ← Este archivo
```

Sin dependencias, sin instalación, sin frameworks. **HTML + CSS + JS puro.**

---

## 💾 ¿Dónde se guardan los datos?

Los datos se guardan en el **localStorage del navegador** (memoria interna del dispositivo).

| Ventaja | Desventaja |
|---|---|
| ✅ Funciona sin internet | ⚠️ No se sincroniza entre dispositivos |
| ✅ No necesita servidor | ⚠️ Si limpias el caché, se borra |
| ✅ Es instantáneo | ⚠️ No es un respaldo real |

**Recomendación:** usa el botón **📥 Respaldar** una vez por semana para descargar un archivo `.json` con todos tus datos.

---

## 🧮 Cómo se calculan los números

### Ventas del mes
Suma de todas las ventas registradas en el mes actual.

### Mercadería comprada
Suma de todas las compras marcadas como **"🛒 Mercadería"**.

### Gastos del mes
Suma de todas las compras marcadas como **"💡 Gasto del local"** (arriendo, luz, sueldos, etc.).

### IVA a pagar
```
IVA débito  = IVA de tus ventas (19% incluido en el precio)
IVA crédito = IVA de tus compras CON FACTURA
IVA a pagar = IVA débito − IVA crédito (mínimo $0)
```

> 💡 Las compras con **boleta** no dan crédito IVA.

### Margen bruto
```
Margen bruto = Ventas − Mercadería
```
Indica si vendes más caro de lo que compras.

### Ganancia real
```
Ganancia real = Margen bruto − Gastos
```
Indica si el negocio realmente da plata.

---

## 📊 Ejemplo real

**Almacén de la Sra. Juanita — Octubre:**

| Concepto | Monto |
|---|---|
| Ventas | $1.000.000 |
| Mercadería comprada | $700.000 |
| Arriendo | $200.000 |
| Luz + agua | $50.000 |
| Sueldo ayudante | $100.000 |

**Resultado:**
- 📈 Margen bruto: **$300.000**
- 💡 Gastos: **$350.000**
- ✅ Ganancia real: **−$50.000** 😟

> La app le dice: *"Margen OK, pero los gastos se comen la ganancia."*

**Decisión:** subir precios o recortar gastos.

---

## 🛠️ Tecnologías usadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura |
| CSS3 | Diseño responsive |
| JavaScript vanilla | Lógica y cálculos |
| localStorage | Persistencia de datos |

**Sin dependencias externas.** Sin npm, sin build, sin frameworks.

---

## 🎨 Personalización

### Cambiar colores
En `styles.css`, busca `#0039a6` (azul) y `#d52b1e` (rojo Chile) y cámbialos.

### Cambiar el IVA
En `script.js`, línea superior:
```javascript
const IVA = 0.19; // Cambiar si el IVA cambia en Chile
```

### Cambiar los placeholders
En `index.html`, busca `placeholder="Ej: ..."` y adapta a tu rubro.

---

## 🗺️ Roadmap

Funciones planificadas para futuras versiones:

- [ ] 📱 PWA (instalar como app en el celular)
- [ ] 📊 Exportar reporte mensual a CSV/Excel
- [ ] 🧾 Generador de boletas PDF
- [ ] 📦 Control de stock automático
- [ ] 🔐 Login con Google (Supabase)
- [ ] ☁️ Sincronización en la nube
- [ ] 👥 Modo multi-usuario (dueño + vendedor)
- [ ] 📈 Gráficos de tendencia mensual

---

## 🤝 Contribuir

Este es un proyecto pensado para ayudar a pequeños negocios chilenos. Si quieres aportar:

1. Haz un fork del repositorio
2. Crea una rama con tu mejora (`git checkout -b mejora/nueva-funcion`)
3. Haz commit de tus cambios (`git commit -m 'Agrega nueva función'`)
4. Sube la rama (`git push origin mejora/nueva-funcion`)
5. Abre un Pull Request

---

## ⚠️ Aviso importante

Esta app es una **herramienta de apoyo** para el control diario del negocio. **No reemplaza a un contador** ni constituye una declaración oficial ante el SII.

Para trámites tributarios formales (F29, F22, boletas electrónicas), consulta con un contador o usa el portal oficial del SII: [www.sii.cl](https://www.sii.cl)

---

## 📜 Licencia

MIT License — Libre para usar, modificar y distribuir.

---

## 💌 Contacto

¿Tienes ideas, sugerencias o encontraste un error?

- Abre un **Issue** en el repositorio
- O envía un correo a: `tu-correo@ejemplo.cl`

---

## 🇨🇱 Hecho en Chile, para PYMES chilenas

> *"No necesitas ser contador para saber si tu negocio está ganando."*

**¡Éxito con tu negocio!** 🚀