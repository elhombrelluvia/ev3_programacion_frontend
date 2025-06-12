async function generarInforme() {
  const datos = JSON.parse(localStorage.getItem('datosFormulario'));
  const informeDiv = document.getElementById('informe');
  

  if (!datos) {
    informeDiv.innerText = "No hay datos disponibles.";
    return;
  }

  try {
    const res = await fetch('https://mindicador.cl/api');
    const data = await res.json();

    const indicadores = {
      utm: data.utm,
      euro: data.euro,
      uf: data.uf
    };

    localStorage.setItem('indicadoresEconomicos', JSON.stringify(indicadores));

    const formatearFecha = (fechaStr) => {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-CL', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };

    const informeHTML = `
      <p><strong>Nombre:</strong> ${datos.nombre}</p>
      <p><strong>Apellido:</strong> ${datos.apellido}</p>
      <p><strong>Email:</strong> ${datos.email}</p>
      <p><strong>RUT:</strong> ${datos.rut}</p>
      <hr>
      <p><strong>Valor UTM:</strong> $${indicadores.utm.valor.toLocaleString('es-CL')} 
         <em>(${formatearFecha(indicadores.utm.fecha)})</em></p>
      <p><strong>Valor Euro:</strong> $${indicadores.euro.valor.toLocaleString('es-CL')} 
         <em>(${formatearFecha(indicadores.euro.fecha)})</em></p>
      <p><strong>Valor UF:</strong> $${indicadores.uf.valor.toLocaleString('es-CL')} 
         <em>(${formatearFecha(indicadores.uf.fecha)})</em></p>

    `;

    informeDiv.innerHTML = informeHTML;

    // --- Función para encriptar en Base64 ---
    const encriptarTexto = (texto) => btoa(texto);

    // --- Botón para ver datos cifrados ---
    const btnCifrado = document.getElementById('btnCifrado');
    const datosCifrados = document.getElementById('datosCifrados');

    btnCifrado.addEventListener('click', () => {
      const texto = `
Nombre: ${encriptarTexto(datos.nombre)}
Apellido: ${encriptarTexto(datos.apellido)}
Email: ${encriptarTexto(datos.email)}
RUT: ${encriptarTexto(datos.rut)}
      `.trim();

      datosCifrados.textContent = texto;
      datosCifrados.style.display = datosCifrados.style.display === 'none' ? 'block' : 'none';
    });

    // --- Botón para ver JSON completo de la API ---
    const btnJSON = document.getElementById('btnJSON');
    const jsonCompleto = document.getElementById('jsonCompleto');

    btnJSON.addEventListener('click', () => {
      const visible = jsonCompleto.style.display === 'block';
      jsonCompleto.style.display = visible ? 'none' : 'block';
      jsonCompleto.textContent = JSON.stringify(data, null, 2);
    });

  } catch (error) {
    informeDiv.innerText = "Error al cargar datos económicos.";
  }
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const datos = JSON.parse(localStorage.getItem('datosFormulario'));
  if (!datos) return alert('No hay datos para exportar');

  // Título principal
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Informe de Valores Económicos", 15, 20);

  // Datos del usuario
  doc.setFontSize(12);
  doc.setFont("Helvetica", "normal");
  let y = 30;
  doc.text(`Nombre: ${datos.nombre} ${datos.apellido}`, 15, y);
  doc.text(`Email: ${datos.email}`, 15, y += 8);
  doc.text(`RUT: ${datos.rut}`, 15, y += 8);

  // Valores económicos
  const indicadores = JSON.parse(localStorage.getItem('indicadoresEconomicos'));
  if (indicadores) {
    doc.setFont("Helvetica", "bold");
    doc.text("Valores Económicos:", 15, y += 15);
    doc.setFont("Helvetica", "normal");

    const formatearFecha = (fechaStr) => {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-CL', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };

    doc.text(`UTM: $${indicadores.utm.valor.toLocaleString('es-CL')} (${formatearFecha(indicadores.utm.fecha)})`, 15, y += 8);
    doc.text(`Euro: $${indicadores.euro.valor.toLocaleString('es-CL')} (${formatearFecha(indicadores.euro.fecha)})`, 15, y += 8);
    doc.text(`UF: $${indicadores.uf.valor.toLocaleString('es-CL')} (${formatearFecha(indicadores.uf.fecha)})`, 15, y += 8);
  }

  // JSON completo
  const jsonCompleto = {
    datos,
    indicadores
  };

  y += 15;
  doc.setFont("Helvetica", "bold");
  doc.text("JSON valores economicos:", 15, y);
  doc.setFont("Courier", "normal");
  doc.setFontSize(10);

  const jsonStr = JSON.stringify(jsonCompleto, null, 2);
  const lineas = doc.splitTextToSize(jsonStr, 180);
  doc.text(lineas, 15, y + 7);

  doc.save(`informe_${datos.rut}.pdf`);
}


generarInforme();
