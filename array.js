// 1. Agregar y Eliminar Elementos

const frutas = ["manzana", "banana", "pera"];

frutas.push("naranja");
frutas.pop();

console.log("Frutas:", frutas);


// 2. Array Bidimensional

const matriz = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log("Elemento 5:", matriz[1][1]);


// 3. Iterar sobre un Array

for (let i = 0; i < frutas.length; i++) {
    console.log("Fruta:", frutas[i]);
}


// 4. Uso de map

function elevarAlCuadrado(numeros) {
    return numeros.map(numero => numero * numero);
}

const numerosCuadrado = [1, 2, 3, 4, 5];

console.log(
    "Números al cuadrado:",
    elevarAlCuadrado(numerosCuadrado)
);


// 5. Uso de filter

function filtrarMayoresDe(numeros, valorReferencia) {
    return numeros.filter(numero => numero > valorReferencia);
}

const numerosFiltro = [5, 10, 15, 20, 25];

console.log(
    "Mayores de 10:",
    filtrarMayoresDe(numerosFiltro, 10)
);


// 6. Uso de reduce

function sumarElementos(numeros) {
    return numeros.reduce((total, numero) => total + numero, 0);
}

const numerosSuma = [1, 2, 3, 4, 5];

console.log(
    "Suma de elementos:",
    sumarElementos(numerosSuma)
);


// 7. Uso de some

const numeros = [3, 7, 12, 5, 8];

const algunMayorDe10 = numeros.some(numero => numero > 10);

console.log(
    "¿Algún número es mayor que 10?:",
    algunMayorDe10
);


// 8. Uso de every

const todosPositivos = numeros.every(numero => numero > 0);

console.log(
    "¿Todos los números son positivos?:",
    todosPositivos
);


// 9. Uso de find

const personas = [
    { nombre: "Juan", edad: 25 },
    { nombre: "María", edad: 32 },
    { nombre: "Pedro", edad: 40 },
    { nombre: "Ana", edad: 28 }
];

const primeraPersonaMayorDe30 = personas.find(persona => persona.edad > 30);

console.log(
    "Primera persona mayor de 30 años:",
    primeraPersonaMayorDe30
);


// 10. Uso de sort

const palabras = [
    "banana",
    "manzana",
    "pera",
    "naranja",
    "uva"
];

palabras.sort();

console.log(
    "Palabras ordenadas alfabéticamente:",
    palabras
);