const fechaInput = document.getElementById('fechaNacimiento');
const hoy = new Date().toISOString().split('T')[0];
fechaInput.max = hoy;

document.getElementById('formEdad').addEventListener('submit', function (e) {
    e.preventDefault();

    const fechaValor = fechaInput.value;
    const resultado = document.getElementById('resultado');

    if (!fechaValor) {
        resultado.textContent = "Por favor, ingresa una fecha válida.";
        return;
    }

    const fechaNacimiento = new Date(fechaValor);
    const fechaHoy = new Date();

    let edad = fechaHoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaHoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && fechaHoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    resultado.textContent = `Usted tiene ${edad} años.`;
});