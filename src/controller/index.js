
// Default-Importe nutzen, also keine {}-Klammern um Bezeichner nach `import`
import buchcontroller from './buch.controller.js';
import studicontroller       from './studi.controller.js';

/**
 * Alle Kontroller als Default-Array exportieren, damit aufrufender
 * Code bei Änderung der Controller (z.B. neuer Controller dazu)
 * nicht geändert werden muss.
 */
export default [
    buchcontroller,
    studicontroller
];