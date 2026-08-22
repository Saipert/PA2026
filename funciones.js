 // 1. Función Suma

function sumar(a, b) {
    return a + b;
}

console.log("Suma:", sumar(5, 3));
console.log("Suma:", sumar(10, 20));


// 2. Función que Multiplica

function multiplicar(a, b) {
    return a * b;
}

console.log("Multiplicación:", multiplicar(4, 5));
console.log("Multiplicación:", multiplicar(10, 3));


// 3. Función con Parámetro por Defecto

function saludar(nombre = "Invitado") {
    return "Hola, " + nombre;
}

console.log(saludar("David"));
console.log(saludar());


// 4. Función que Devuelve un Objeto

function crearPersona(nombre, edad) {
    return {
        nombre: nombre,
        edad: edad
    };
}

const persona = crearPersona("David", 25);

console.log("Persona:", persona);


// 5. Función que Modifica un Objeto

function actualizarEdad(persona, nuevaEdad) {
    persona.edad = nuevaEdad;
}

actualizarEdad(persona, 26);

console.log("Persona con edad actualizada:", persona);


// 6. Función Recursiva

function factorial(numero) {
    if (numero === 0 || numero === 1) {
        return 1;
    }

    return numero * factorial(numero - 1);
}

console.log("Factorial de 5:", factorial(5));


// 7. Función con Función Interna

function despedir() {

    function adios() {
        return "Adiós, hasta luego.";
    }

    return adios();
}

console.log(despedir());


// 8. Función que Usa Otra Función

function procesarArray(array, funcion) {
    const resultado = [];

    for (let elemento of array) {
        resultado.push(funcion(elemento));
    }

    return resultado;
}

function multiplicarPorDos(numero) {
    return numero * 2;
}

const numeros = [1, 2, 3, 4, 5];

console.log(
    "Array multiplicado por 2:",
    procesarArray(numeros, multiplicarPorDos)
);


// 9. Función que Devuelve Otra Función

function crearMultiplicador(x) {
    return function(numero) {
        return numero * x;
    };
}

const multiplicarPorTres = crearMultiplicador(3);

console.log("Multiplicar 5 por 3:", multiplicarPorTres(5));
console.log("Multiplicar 10 por 3:", multiplicarPorTres(10));


// 10. Función Anónima

const sumarAnonima = function(a, b) {
    return a + b;
};

console.log("Suma anónima:", sumarAnonima(7, 8));