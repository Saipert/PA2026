// 1. Creación de un objeto básico

const libro = {
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    añoDePublicacion: 1967,

    descripcion: function () {
        return "El libro se titula '" + this.titulo +
               "' y su autor es " + this.autor + ".";
    }
};

console.log("Título:", libro.titulo);
console.log("Autor:", libro.autor);
console.log("Año de publicación:", libro.añoDePublicacion);


// 2. Anidación de objetos

const estudiante = {
    nombre: "David",
    edad: 25,
    direccion: {
        calle: "San Martín 123",
        ciudad: "Concepción del Uruguay",
        pais: "Argentina"
    }
};

console.log(
    "Dirección completa: " +
    estudiante.direccion.calle + ", " +
    estudiante.direccion.ciudad + ", " +
    estudiante.direccion.pais
);


// 3. Métodos en objetos

console.log(libro.descripcion());


// 4. Iteración sobre propiedades de un objeto

const producto = {
    nombre: "Notebook",
    precio: 850000,
    disponible: true
};

for (let propiedad in producto) {
    console.log(propiedad + ":", producto[propiedad]);
}


// 5. Actualización de propiedades

producto.precio = 900000;

console.log("Producto actualizado:", producto);


// 6. Comprobación de propiedades

function tienePropiedad(objeto, propiedad) {
    return propiedad in objeto;
}

console.log(tienePropiedad(producto, "precio"));
console.log(tienePropiedad(producto, "marca"));


// 7. Eliminación de propiedades

console.log("Antes de eliminar:", producto);

delete producto.disponible;

console.log("Después de eliminar:", producto);


// 8. Combinar objetos

const persona1 = {
    nombre: "Juan",
    edad: 30
};

const persona2 = {
    ciudad: "Paraná",
    pais: "Argentina"
};

const personaCompleta = Object.assign({}, persona1, persona2);

console.log("Personas combinadas:", personaCompleta);


// 9. Copiar objetos

const estudianteCopia = JSON.parse(JSON.stringify(estudiante));

estudianteCopia.nombre = "Pedro";
estudianteCopia.direccion.ciudad = "Paraná";

console.log("Estudiante original:", estudiante);
console.log("Copia modificada:", estudianteCopia);


// 10. Métodos Getters y Setters

const libroConGetterSetter = {
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    _añoDePublicacion: 1967,

    get añoDePublicacion() {
        return this._añoDePublicacion;
    },

    set añoDePublicacion(nuevoAño) {
        this._añoDePublicacion = nuevoAño;
    }
};

libroConGetterSetter.añoDePublicacion = 1970;

console.log("Nuevo año de publicación:", libroConGetterSetter.añoDePublicacion);