# ¿Cuánto mide lo imposible?

Aplicación web educativa e interactiva para una feria escolar de Matemática. Muestra cómo calcular la altura de objetos que no se pueden medir con una cinta métrica, usando **trigonometría** y el **Teorema de Tales**.

## ¿Qué se puede hacer?

- Elegir entre 8 desafíos: árbol, edificio, torre, poste, antena, monumento, palmera y un desafío secreto que se desbloquea al resolver 4.
- Ver cada escena dibujada con los datos reales del problema: observador, clinómetro, ángulo, distancia y triángulo.
- Ingresar una respuesta (con coma o punto decimal, en metros o centímetros) y verificarla.
- Pedir hasta 3 pistas progresivas por desafío.
- Ver siempre la resolución completa, paso a paso, con el dibujo que se va resaltando.
- Seguir el progreso: desafíos resueltos, aciertos y pistas usadas.
- Usar el **Modo feria**: letras más grandes y botón "Nuevo visitante" para reiniciar sin recargar la página.

## Matemática utilizada

| Método           | Cuándo se usa                            | Fórmula              |
| ---------------- | ---------------------------------------- | -------------------- |
| Tangente         | Desafíos con clinómetro                  | `H = d · tan(α) + h` |
| Teorema de Tales | Desafíos con sombras (palmera y secreto) | `H = (S · h) / s`    |

**Tangente:** `d` es la distancia horizontal, `α` el ángulo de elevación y `h` la altura de los ojos del observador. Se suma `h` porque el triángulo rectángulo empieza a la altura de los ojos, no en el suelo.

**Tales:** `S` es la sombra del objeto, `h` la altura de una vara conocida y `s` la sombra de la vara. Como los rayos del sol son paralelos, los triángulos son semejantes y sus lados son proporcionales.

Todos los resultados se calculan en JavaScript con los datos de cada desafío. La altura real no se muestra hasta que se verifica la respuesta.

## Archivos

```
index.html   Estructura de la página
styles.css   Diseño y animaciones
script.js    Datos, cálculos, dibujos SVG y lógica
```

No usa frameworks, librerías ni imágenes externas. No necesita instalación ni conexión a servicios de terceros.

## Configuración rápida

Todo está al principio de `script.js`:

- `TOL`: tolerancia en metros para considerar correcta una respuesta (por defecto `0.1`).
- `UNLOCK`: cantidad de desafíos que hay que resolver para desbloquear el secreto (por defecto `4`).
- `CH`: lista de desafíos con sus datos. Para modificar un desafío, cambiá sus valores acá; el dibujo y la resolución se actualizan solos.

## Accesibilidad

- Botones grandes, aptos para pantallas táctiles.
- Navegación con teclado y foco visible.
- Respeta la preferencia del dispositivo de reducir animaciones (se desactiva el confeti y los pasos aparecen de una vez).

## Créditos

Proyecto realizado para la feria de Matemática de _EES N°1 - DLG, BS.AS, ARG_, _2026_.
Grado: _4TO AÑO SECUNDARIA SUPERIOR_.
