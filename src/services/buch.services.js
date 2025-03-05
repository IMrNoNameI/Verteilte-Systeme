// Diese Datei enthält die Business-Logik für den Entitätstyp "Buch" (buch).

import logging         from "logging";
import datenbankObjekt from "../datenbank.js";


const logger = logging.default("buch-service");


/**
 * Alle Bücher zurückgeben.
 *
 * @returns Array mit Bücherobjekten; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function getAlle() {

    const ergebnisArray = datenbankObjekt.buchGetAlle();

    logger.info("Anzahl Bücher ausgelesen: " + ergebnisArray.length);

    return ergebnisArray;
}


/**
 * Volltextsuche Bücher.
 * Die Suche ist case-insensitive.
 *
 * @param {*} suchString Such-String, wird auf
 *                       titel-Bezeichnung angewendet.
 *
 * @returns Array mit Buchobjekten; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function suche(suchString) {

    const alleArray = datenbankObjekt.buchGetAlle();

    if (alleArray.length === 0) {

        logger.warn("Keine Bücher in der Datenbank.");
        return [];
    }

    const suchStringLowerCase = suchString.toLowerCase();

    const teilmengeArray =  alleArray.filter(
        (buch) => buch.titel.toLowerCase().includes(suchStringLowerCase) 
    );

    logger.info(`Anzahl gefundener Bücher für Such-String "${suchString}": `+
                 teilmengeArray.length);

    return teilmengeArray;
}


/**
 * Buch anhand der ID zurückgeben.
 *
 * @param {number} buchID BuchID des Buchs, z.B. "12354"
 *
 * @return Buchsobjekt oder `null`, wenn
 *         kein Buch mit der ID gefunden wurde.
 */
function getBybuchID(buchID) {

    const alleArray = datenbankObjekt.buchGetAlle();

    const filterFkt = (buch) => buch.buchID === buchID;

    const ergArray = alleArray.filter( filterFkt );

    if (ergArray.length === 0) {

        logger.warn(`Kein Buch mit BuchID "${buchID}" gefunden.`);
        return null;

    } else {

        logger.info(`Buch mit BuchID "${buchID}" gefunden.`);
        return ergArray[0];
    }
}


/**
 * Neues Buch anlegen.
 *
 * @param {*} buchObjekt Objekt mit Autor, Titel und verfügbar als Attribute
 *
 * @returns `true`, wenn das Buch neu angelegt wurde, sonst `false`
 *          (weil es schon ein Buch mit der gleicher ID gibt).
 */
async function neu(buchObjekt) {

    // Überprüfen, ob es schon ein Buch mit der gleichen ID gibt.

    const buchID = buchObjekt.buchID;

    const buchObj = getBybuchID(buchID);
    if (buchObj) {

        logger.error(`Buch mit ID "${buchID}" existiert bereits: `);
        return false;
    }

    await datenbankObjekt.buchNeu(buchObjekt);

    logger.info(`Neues Buch angelegt: ${buchObjekt.buchID}`);

    return true;
}


/**
 * Wert eines Buchs ändern.
 *
 * @param {*} buchID ID (Schlüssel) des Buchs, für den die Buchwerte geändert werden sollen
 *
 * @param {*} buchObjekt Neue Werte, die für das Buch gespeichert werden sollen.
 *
 * @returns {object} Objekt mit geändertem Buch oder `null`, wenn kein Buch mit
 *                   der ID gefunden wurde.
 */
async function buchAendern(buchID, buchObjekt) {

    const buchGefunden = getBybuchID(buchID);
    if (buchGefunden === false) {

        logger.warn(`Ändern fehlgeschlagen, kein Buch mit ID ${buchID} gefunden.`);
        return { "fehler": `Kein Buch mit ID ${buchID} gefunden.` };
    }

    const ergebnisObjekt = await datenbankObjekt.buchAendern(buchID, buchObjekt);

    if (ergebnisObjekt === null) {

        logger.warn(`Ändern fehlgeschlagen, kein Buch mit ID ${buchID} gefunden.`);
        return { "fehler": `Kein Buch mit ID ${buchID} gefunden.` };

    } else {

        return ergebnisObjekt;
    }
}

/**
 * Buch anhand von ID löschen. Es wird zuerst geprüft, ob es überhaupt
 * ein Buch mit der als Argument übergebenen ID gibt.
 *
 * @param {number} buchID ID von Buch, das gelöscht werden soll.
 *
 * @returns {boolean} `true`, wenn Buch gelöscht wurde, sonst `false`(weil kein BUch mit `buchID`
 *                    gefunden wurde).
 */
async function buchLoeschen(buchID) {

    const buchGefunden = getBybuchID(buchID);
    if (!buchGefunden) {

        logger.warn(`Löschen fehlgeschlagen, kein Buch mit ID ${buchID} gefunden.`);
        return false;
    }

    await datenbankObjekt.buchLoeschen(buchID);

    logger.info(`Buch mit ID ${buchID} gelöscht: `+
                `${buchGefunden.titel} ${buchGefunden.autor} - ${buchGefunden.verfuegbar}`);

    return true;
}


/**
 * Alle Funktionen als Objekt exportieren.
 */
export default { getAlle, suche, getBybuchID, neu, buchAendern, buchLoeschen };