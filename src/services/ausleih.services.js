// Diese Datei enthält die Business-Logik für den Entitätstyp "Studiengang" (sg).

import logging         from "logging";
import datenbankObjekt from "../datenbank.js";


const logger = logging.default("ausleih-service");


/**
 * Alle Ausleihen zurückgeben.
 *
 * @returns Array mit Ausleihobjekten; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function getAlle() {

    const ergebnisArray = datenbankObjekt.ausleihGetAlle();

    logger.info("Anzahl Ausleihen ausgelesen: " + ergebnisArray.length);

    return ergebnisArray;
}


/**
 * Volltextsuche Ausleihen.
 * Die Suche ist case-insensitive.
 *
 * @param {*} suchString Such-String, wird auf verliehen-Bezeichnung angewendet.
 *
 * @returns Array mit Ausleihobjekten; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function suche(suchString) {

    const alleArray = datenbankObjekt.ausleihGetAlle();

    if (alleArray.length === 0) {

        logger.warn("Keine Ausleihen in der Datenbank.");
        return [];
    }

    const suchStringLowerCase = suchString.toLowerCase();

    const teilmengeArray =  alleArray.filter(
        (ausleih) => ausleih.verliehen.toLowerCase().includes(suchStringLowerCase) );

    logger.info(`Anzahl gefundener Ausleihen für Such-String "${suchString}": `+
                 teilmengeArray.length);

    return teilmengeArray;
}


/**
 * Ausleih anhand der ID zurückgeben.
 *
 * @param {number} ausleihID ID des Ausleihs, z.B. "123456"
 *
 * @return Ausleihobjekt oder `null`, wenn
 *         kein Ausleih mit der ID gefunden wurde.
 */
function getByAusleihID(ausleihID) {

    const alleArray = datenbankObjekt.ausleihGetAlle();

    const filterFkt = (ausleih) => ausleih.ausleihID === ausleihID;

    const ergArray = alleArray.filter( filterFkt );

    if (ergArray.length === 0) {

        logger.warn(`Kein Ausleih mit ID "${ausleihID}" gefunden.`);
        return null;

    } else {

        logger.info(`Ausleih mit ID "${ausleihID}" gefunden.`);
        return ergArray[0];
    }
}


/**
 * Neuen Ausleih anlegen.
 *
 * @param {*} ausleihObjekt Objekt mit `buchID`, `mitgliedID`und verliehen als Attribute
 *
 * @returns `true`, wenn der Ausleih neu angelegt wurde, sonst `false`
 *          (weil es schon einen Ausleih mit der gleichen ID gibt).
 */
async function neu(ausleihObjekt) {

    // Überprüfen, ob es schon einen Ausleih mit der gleichen ID gibt.

    const ausleihID = ausleihObjekt.ausleihID;

    const ausleihObj = getByAusleihID(ausleihID);
    if (ausleihObj) {

        logger.error(`Ausleih mit Kürzel "${ausleihID}" existiert bereits: `);
        return false;
    }

    await datenbankObjekt.ausleihNeu(ausleihObjekt);

    logger.info(`Neuer Ausleih angelegt: ${ausleihObjekt.ausleihID} `);

    return true;
}


/**
 * Wert eines Ausleihs ändern.
 *
 * @param {*} ausleihID Kürzel (Schlüssel) des Ausleihs, für den die Werte
 *                     geändert werden soll.
 *
 * @param {*} ausleihObjekt Neue Werte, die für den Ausleih gespeichert werden soll.
 *
 * @returns {object} Objekt mit geänderten Ausleih oder `null`, wenn kein Ausleih mit
 *                   der ID gefunden wurde.
 */
async function ausleihAendern(ausleihID, ausleihObjekt) {

    const ausleihGefunden = getByAusleihID(ausleihID);
    if (ausleihGefunden === false) {

        logger.warn(`Ändern fehlgeschlagen, kein Ausleih mit ID ${ausleihID} gefunden.`);
        return { "fehler": `Kein Ausleih mit ID ${ausleihID} gefunden.` };
    }

    const ergebnisObjekt = await datenbankObjekt.ausleihAendern(ausleihID, ausleihObjekt);

    if (ergebnisObjekt === null) {

        logger.warn(`Ändern fehlgeschlagen, kein Ausleih mit ID ${ausleihID} gefunden.`);
        return { "fehler": `Kein Ausleih mit ID ${ausleihID} gefunden.` };

    } else {

        return ergebnisObjekt;
    }
}

/**
 * Ausleih anhand von ID löschen. Es wird zuerst geprüft, ob es überhaupt
 * einen Ausleih mit der als Argument übergebenen ID gibt.
 *
 * @param {number} ausleihID ID von Ausleih, das gelöscht werden soll.
 *
 * @returns {boolean} `true`, wenn Buch gelöscht wurde, sonst `false`(weil kein BUch mit `buchID`
 *                    gefunden wurde).
 */
async function ausleihLoeschen(ausleihID) {

    const ausleihGefunden = getByAusleihID(ausleihID);
    if (!ausleihGefunden) {

        logger.warn(`Löschen fehlgeschlagen, kein Ausleih mit ID ${ausleihID} gefunden.`);
        return false;
    }

    await datenbankObjekt.ausleihLoeschen(ausleihID);

    logger.info(`Ausleih mit ID ${ausleihID} gelöscht: `+
                `${ausleihGefunden.buchID} ${ausleihGefunden.mitgliedID} - ${ausleihGefunden.verliehen}`);

    return true;
}

 // check if studiengang ist existing 
    const sgKurz = studiObjekt.studiengang;

    const buchObjekt = buchService.getBybuchID(sgKurz);
    if (!buchObjekt) {

        return `Mitglied mit unbekannter Adresse "${sgKurz}" kann nicht angelegt werden.`;
    }

/**
 * Alle Funktionen als Objekt exportieren.
 */
export default { getAlle, suche, getByAusleihID, neu, ausleihAendern, ausleihLoeschen };