import logging         from "logging";
import datenbankObjekt from "../datenbank.js";
import buchService       from "./buch.services.js";


const logger = logging.default("studi-service");


/**
 * Alle Studis zurückgeben.
 *
 * @returns Array mit allen Studis; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function getAlle() {

    const ergArray = datenbankObjekt.studiGetAlle();

    if (ergArray.length > 0) {

        logger.info(`Alle ${ergArray.length} Studis ausgelesen.` );

    } else {

        logger.warn("Keine Studis in der Datenbank.");
    }

    return ergArray;
}


/**
 * Sucht nach Studis anhand Such-String in Vor- oder Nachname.
 * Die Suche ist case-insensitive.
 *
 * @param {*} suchString Such-String, wird auf Vor- und Nachname angewendet.
 *
 * @return Array mit Studis; kann leer sein, aber nicht `null` oder `undefined`.
 */
function suche(suchString) {

    const alleArray = datenbankObjekt.studiGetAlle();

    if (alleArray.length === 0) {

        logger.warn("Keine Studis in der Datenbank.");
        return [];
    }

    const suchStringLowerCase = suchString.toLowerCase();

    const teilmengeArray =  alleArray.filter(
        (studi) => studi.vorname.toLowerCase( ).includes( suchStringLowerCase ) ||
                   studi.nachname.toLowerCase().includes( suchStringLowerCase )
    );

    logger.info(`Anzahl gefundener Studis für Such-String "${suchString}": ` +
                 teilmengeArray.length);

    return teilmengeArray;
}


/**
 * Suche nach Studi anhand Matrikelnummer.
 *
 * @param {nuber} matrikelnr Matrikelnummer (Integer).
 *
 * @returns Studi-Objekt oder `null`, wenn nicht gefunden.
 */
function getByMatrikelnr(matrikelnr) {

    const alleArray = datenbankObjekt.studiGetAlle();

    const foundStudi = alleArray.find(studi => studi.matrikelnr === matrikelnr);

    if (foundStudi) {

        logger.info(`Studi mit Matrikelnr "${matrikelnr}" gefunden: `+
                    `${foundStudi.vorname} ${foundStudi.nachname}`);
        return foundStudi;

    } else {

        logger.info(`Kein Studi mit Matrikelnr "${matrikelnr}" gefunden.`);
        return null;
    }
}


/**
 * Neuen Studi anlegen. Es muss sichergestellt sein, dass `studiObjekt`
 * die Attribute `matrikelnr`, `vorname`, `nachname` sowie `studiengang`
 * enthält.
 *
 * @return String mit Fehlermeldung; ist leer, wenn kein Fehler aufgetreten
 *         ist, der Student also erfolgreich angelegt wurde.
 */
async function neu(studiObjekt) {

    const matrikelnr = studiObjekt.matrikelnr;

    if ( !Number.isInteger(matrikelnr) ) {

        return "Matrikelnummer ist keine ganze Zahl (Integer).";
    }

    const studiGefunden = getByMatrikelnr(matrikelnr);
    if (studiGefunden) {

        return `Studi mit Matrikelnummer ${matrikelnr} existiert bereits: ` +
               `${studiGefunden.vorname} ${studiGefunden.nachname}`;
    }

    // check if studiengang ist existing
    const sgKurz = studiObjekt.studiengang;

    const sgObjekt = buchService.getBybuchID(sgKurz);
    if (!sgObjekt) {

        return `Studi mit unbekanntem Studiengang "${sgKurz}" kann nicht angelegt werden.`;
    }

    // eigentliches Anlegen neuer Studi
    await datenbankObjekt.studiNeu(studiObjekt);

    logger.info(`Neuer Studi angelegt: ${studiObjekt.matrikelnr} - ` +
                `${studiObjekt.vorname} ${studiObjekt.nachname} - ${sgKurz}`);

    return "";
}


/**
 * Einzelne Attribute in Studi-Objekt ändern
 * (Matrikelnummer ist Schlüssel und kann daher nicht geändert werden).
 *
 * @param {*} matrikelnr  Matrikelnummer von Studi, für den Änderungen vorgenommen werden sollen.
 *
 * @param {*} deltaObjekt Objekt mit neuen Werten von Attributen, die geändert werden sollen.
 *                        Es muss mindestens ein Attribut enthalten.
 *
 * @returns Studi-Objekt mit geänderten Attributen oder Objekt mit `fehler`-Attribut,
 *          wenn die Änderung nicht erfolgreich war.
 */
async function aendern(matrikelnr, deltaObjekt) {

    const studiGefunden = getByMatrikelnr(matrikelnr);
    if (studiGefunden === false) {

        logger.warn(`Ändern fehlgeschlagen, kein Studi mit Matrikelnummer ${matrikelnr} gefunden.`);
        return { "fehler": `Kein Studi mit Matrikelnummer ${matrikelnr} gefunden.` };
    }

    if (deltaObjekt.studiengang) {

        const sgObjekt = buchService.getBybuchID(deltaObjekt.studiengang);
        if (!sgObjekt) {

            logger.warn(`Ändern fehlgeschlagen, Studiengang "${deltaObjekt.studiengang}" existiert nicht.`);
            return { "fehler": `Studiengang "${deltaObjekt.studiengang}" existiert nicht.` };
        }
    }

    const ergebnisObjekt = await datenbankObjekt.studiAendern(matrikelnr, deltaObjekt);

    if (ergebnisObjekt === null) {

        logger.warn(`Ändern fehlgeschlagen, kein Studi mit Matrikelnummer ${matrikelnr} gefunden.`);
        return { "fehler": `Kein Studi mit Matrikelnummer ${matrikelnr} gefunden.` };

    } else {

        return ergebnisObjekt;
    }
}


/**
 * Studi anhand von Matrikelnummer löschen. Es wird zuerst geprüft, ob es überhaupt
 * einen Studi mit der als Argument übergebenen Matrikelnummer gibt.
 *
 * @param {number} matrikelnr Matrikelnummer von Studi, der gelöscht werden soll.
 *
 * @returns {boolean} `true`, wenn Studi gelöscht wurde, sonst `false`(weil kein Studi mit `matrinr`
 *                    gefunden wurde).
 */
async function loeschen(matrikelnr) {

    const studiGefunden = getByMatrikelnr(matrikelnr);
    if (!studiGefunden) {

        logger.warn(`Löschen fehlgeschlagen, kein Studi mit Matrikelnummer ${matrikelnr} gefunden.`);
        return false;
    }

    await datenbankObjekt.studiLoeschen(matrikelnr);

    logger.info(`Studi mit Matrikelnummer ${matrikelnr} gelöscht: `+
                `${studiGefunden.vorname} ${studiGefunden.nachname} - ${studiGefunden.studiengang}`);

    return true;
}


/**
 * Alle Funktionen als Objekt exportieren.
 */
export default {

    // Lese-Funktionen
    getAlle, suche, getByMatrikelnr,

    // Schreib-Funktionen
    neu, loeschen, aendern
};