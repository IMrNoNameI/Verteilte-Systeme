// Diese Datei enthält die Business-Logik für den Entitätstyp "Studiengang" (sg).

import logging         from "logging";
import datenbankObjekt from "../datenbank.js";


const logger = logging.default("sg-service");


/**
 * Alle Studiengänge zurückgeben.
 *
 * @returns Array mit Studiengangsobjekten; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function getAlle() {

    const ergebnisArray = datenbankObjekt.studiengangGetAlle();

    logger.info("Anzahl Studiengänge ausgelesen: " + ergebnisArray.length);

    return ergebnisArray;
}


/**
 * Volltextsuche Studiengänge.
 * Die Suche ist case-insensitive.
 *
 * @param {*} suchString Such-String, wird auf Kurz- und
 *                       Lang-Bezeichnung angewendet.
 *
 * @returns Array mit Studiengangsobjekten; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function suche(suchString) {

    const alleArray = datenbankObjekt.studiengangGetAlle();

    if (alleArray.length === 0) {

        logger.warn("Keine Studiengänge in der Datenbank.");
        return [];
    }

    const suchStringLowerCase = suchString.toLowerCase();

    const teilmengeArray =  alleArray.filter(
        (sg) => sg.kurz.toLowerCase().includes(suchStringLowerCase) ||
                sg.lang.toLowerCase().includes(suchStringLowerCase)
    );

    logger.info(`Anzahl gefundener Studiengänge für Such-String "${suchString}": `+
                 teilmengeArray.length);

    return teilmengeArray;
}


/**
 * Studiengang anhand des Kurznamens zurückgeben.
 *
 * @param {string} kurzname Kurzname des Studiengangs, z.B. "VWL"
 *
 * @return Studiengangsobjekt oder `null`, wenn
 *         kein Studiengang mit dem Kurznamen gefunden wurde.
 */
function getByKurzname(kurzname) {

    const kurznameLowerCase = kurzname.toLowerCase();

    const alleArray = datenbankObjekt.studiengangGetAlle();

    const filterFkt = (sg) => sg.kurz.toLowerCase() === kurznameLowerCase;

    const ergArray = alleArray.filter( filterFkt );

    if (ergArray.length === 0) {

        logger.warn(`Kein Studiengang mit Kurzname "${kurzname}" gefunden.`);
        return null;

    } else {

        logger.info(`Studiengang mit Kurzname "${kurzname}" gefunden.`);
        return ergArray[0];
    }
}


/**
 * Neuen Studiengang anlegen.
 *
 * @param {*} sgObjekt Objekt mit `kurz` und `lang` als Attribute
 *
 * @returns `true`, wenn der Studiengang neu angelegt wurde, sonst `false`
 *          (weil es schon einen Studiengang mit dem gleichen Kurznamen gibt).
 */
async function neu(sgObjekt) {

    // Überprüfen, ob es schon einen Studiengang mit dem gleichen Kurznamen gibt.

    const kurz = sgObjekt.kurz;

    const sgObj = getByKurzname(kurz);
    if (sgObj) {

        logger.error(`Studiengang mit Kürzel "${kurz}" existiert bereits: ` +
                      sgObj.lang);
        return false;
    }

    await datenbankObjekt.studiengangNeu(sgObjekt);

    logger.info(`Neuer Studiengang angelegt: ${sgObjekt.kurz} - ${sgObjekt.lang}`);

    return true;
}


/**
 * Langname eines Studiengangs ändern.
 *
 * @param {*} kurzname Kürzel (Schlüssel) des Studiengangs, für den der Langname
 *                     geändert werden soll.
 *
 * @param {*} langname Neuer Langname, der für den Studiengang gespeichert werden soll.
 *
 * @returns {object} Objekt mit geändertem Studiengang oder `null`, wenn kein Studiengang mit
 *                   dem Kurznamen gefunden wurde.
 */
async function langnameAendern(kurzname, langname) {

    const sgObj = getByKurzname(kurzname);
    if (!sgObj) {

        logger.error(`Änderung Langname für unbekannten Studiengang "${kurzname}" angefordert.`);
        return null;
    }

    await datenbankObjekt.studiengangLangnameAendern(kurzname, langname);

    return sgObj;
}
 // check if studiengang ist existing (kann glaub weg)
    const sgKurz = studiObjekt.studiengang;

    const buchObjekt = buchService.getBybuchID(sgKurz);
    if (!buchObjekt) {

        return `Mitglied mit unbekannter Adresse "${sgKurz}" kann nicht angelegt werden.`;
    }

/**
 * Alle Funktionen als Objekt exportieren.
 */
export default { getAlle, suche, getByKurzname, neu, langnameAendern };