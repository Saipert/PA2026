// 1. Consumo de Datos desde una API

async function obtenerUsuarios() {
    const respuesta = await fetch("https://jsonplaceholder.typicode.com/users");
    const usuarios = await respuesta.json();

    console.log("Lista de usuarios:", usuarios);

    return usuarios;
}


// 2. Procesamiento de Datos de una API

async function imprimirNombresDeUsuarios() {
    const usuarios = await obtenerUsuarios();

    const nombres = usuarios.map(usuario => usuario.name);

    console.log("Nombres de los usuarios:", nombres);
}


// 3. Autenticación Simulada

function autenticarUsuario(credenciales) {
    const usuarioPredefinido = {
        usuario: "admin",
        contraseña: "123456"
    };

    return credenciales.usuario === usuarioPredefinido.usuario &&
           credenciales.contraseña === usuarioPredefinido.contraseña;
}

console.log(
    "Autenticación:",
    autenticarUsuario({
        usuario: "admin",
        contraseña: "123456"
    })
);


// 4. Transformación de Datos

function mapearUsuarios(usuarios) {
    return usuarios.map(usuario => {
        return {
            nombre: usuario.name,
            email: usuario.email
        };
    });
}


// 5. Validación de Formularios

function validarFormulario(formulario) {
    return (
        formulario.nombre &&
        formulario.email &&
        formulario.password
    ) ? true : false;
}

console.log(
    "Formulario válido:",
    validarFormulario({
        nombre: "David",
        email: "david@email.com",
        password: "123456"
    })
);


// 6. Paginación de Datos

function obtenerPagina(datos, numeroPagina) {
    const elementosPorPagina = 5;
    const inicio = (numeroPagina - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;

    return datos.slice(inicio, fin);
}

const datos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

console.log("Página 1:", obtenerPagina(datos, 1));
console.log("Página 2:", obtenerPagina(datos, 2));


// 7. Envío de Datos a una API

async function enviarDatos(data) {
    const respuesta = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const resultado = await respuesta.json();

    console.log("Respuesta de la API:", resultado);
}

enviarDatos({
    title: "Mi publicación",
    body: "Contenido de prueba",
    userId: 1
});


// 8. Búsqueda de Usuarios

function buscarUsuarioPorEmail(usuarios, email) {
    return usuarios.find(usuario => usuario.email === email);
}


// 9. Generación de Token de Autenticación

function generarToken(usuario) {
    const datos = JSON.stringify(usuario);
    return btoa(datos);
}

const usuario = {
    id: 1,
    nombre: "David",
    email: "david@email.com"
};

console.log("Token:", generarToken(usuario));


// 10. Actualización de Información del Usuario

function actualizarUsuario(usuario, cambios) {
    return Object.assign(usuario, cambios);
}

const usuarioActualizado = actualizarUsuario(usuario, {
    nombre: "David Actualizado",
    email: "nuevo@email.com"
});

console.log("Usuario actualizado:", usuarioActualizado);


// Ejecutar la consigna 2

imprimirNombresDeUsuarios();