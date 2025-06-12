const form = document.getElementById('formUsuario');
const tabla = document.getElementById('tablaUsuarios');
const indicadoresDiv = document.getElementById('indicadores');
const toggleFormBtn = document.getElementById('toggleForm');
const formContainer = document.getElementById('formContainer');

toggleFormBtn.addEventListener('click', () => {
  if (formContainer.style.display === 'none' || formContainer.style.display === '') {
    formContainer.style.display = 'block';
    toggleFormBtn.innerText = 'Ocultar formulario de registro';
  } else {
    formContainer.style.display = 'none';
    toggleFormBtn.innerText = 'Mostrar formulario de registro';
  }
});

function validarRut(rutCompleto) {
  rutCompleto = rutCompleto.replace(/\./g, '').replace('-', '');
  let cuerpo = rutCompleto.slice(0, -1);
  let dv = rutCompleto.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  let dvEsperado = 11 - (suma % 11);
  dvEsperado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvEsperado;
}

async function cargarIndicadores() {
  try {
    const res = await fetch('https://mindicador.cl/api');
    const data = await res.json();

    indicadoresDiv.innerHTML = `
      <p><strong>UF:</strong> $${data.uf.valor.toLocaleString('es-CL')}</p>
      <p><strong>Euro:</strong> $${data.euro.valor.toLocaleString('es-CL')}</p>
      <p><strong>UTM:</strong> $${data.utm.valor.toLocaleString('es-CL')}</p>
    `;
  } catch (err) {
    indicadoresDiv.innerText = "Error cargando los indicadores.";
  }
}

function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem('usuarios')) || [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function verInforme(index) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios[index];
  if (!usuario) return alert('Usuario no encontrado.');

  localStorage.setItem('datosFormulario', JSON.stringify(usuario));
  window.location.href = 'informe.html';
}

function renderizarTabla() {
  const usuarios = obtenerUsuarios();
  tabla.innerHTML = '';

  usuarios.forEach((u, i) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${u.nombre}</td>
      <td>${u.apellido}</td>
      <td>${u.email}</td>
      <td>${u.rut}</td>
      <td>
        <div class="d-flex flex-column gap-1">
          <button class="btn btn-sm btn-warning" onclick="editarUsuario(${i})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${i})">Eliminar</button>
          <button class="btn btn-sm btn-info" onclick="verInforme(${i})">Generar informe<br>indicadores</button>
        </div>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const index = document.getElementById('editIndex').value;
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const email = document.getElementById('email').value.trim();
  const rut = document.getElementById('rut').value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;

  
  if (!soloLetrasRegex.test(nombre)) {
    alert('El nombre solo puede contener letras.');
    return;
  }

  if (!soloLetrasRegex.test(apellido)) {
    alert('El apellido solo puede contener letras.');
    return;
  }


  if (!emailRegex.test(email)) {
    alert('Correo inválido. Asegúrate de incluir el dominio, como: nombre@dominio.com');
    return;
  }

  if (!validarRut(rut)) {
    alert('RUT inválido');
    return;
  }

  const nuevoUsuario = { nombre, apellido, email, rut };
  const usuarios = obtenerUsuarios();

  if (index === "-1") {
    usuarios.push(nuevoUsuario);
    mostrarMensaje('Usuario registrado correctamente.');
  } else {
    usuarios[index] = nuevoUsuario;
    mostrarMensaje('Usuario editado correctamente.');
    document.getElementById('editIndex').value = -1;
  }

  guardarUsuarios(usuarios);
  form.reset();
  renderizarTabla();
});

function eliminarUsuario(index) {
  const usuarios = obtenerUsuarios();
  usuarios.splice(index, 1);
  guardarUsuarios(usuarios);
  localStorage.removeItem('datosFormulario');
  renderizarTabla();
  mostrarMensaje('Usuario eliminado correctamente.', 'warning');
}

function editarUsuario(index) {
  const usuario = obtenerUsuarios()[index];
  document.getElementById('nombre').value = usuario.nombre;
  document.getElementById('apellido').value = usuario.apellido;
  document.getElementById('email').value = usuario.email;
  document.getElementById('rut').value = usuario.rut;
  document.getElementById('editIndex').value = index;

  if (formContainer.style.display === 'none' || formContainer.style.display === '') {
    formContainer.style.display = 'block';
    toggleFormBtn.innerText = 'Ocultar formulario';
  }
}

function mostrarMensaje(texto, tipo = 'success', duracion = 5000) {
  const mensajeDiv = document.getElementById('mensaje');
  mensajeDiv.innerText = texto;
  mensajeDiv.className = `alert alert-${tipo} position-fixed bottom-0 end-0 m-3`;
  mensajeDiv.style.display = 'block';

  setTimeout(() => {
    mensajeDiv.style.display = 'none';
  }, duracion);
}


cargarIndicadores();
renderizarTabla();
