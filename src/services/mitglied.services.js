import logging         from "logging";
import datenbankObjekt from "../datenbank.js";
import buchService       from "./buch.services.js";


const logger = logging.default("mitglied-service");


/**
 * Alle Mitglieder zurückgeben.
 *
 * @returns Array mit allen Mitgliedern; kann leer sein,
 *          aber nicht `null` oder `undefined`.
 */
function getAlle() {

    const ergArray = datenbankObjekt.mitgliedGetAlle();

    if (ergArray.length > 0) {

        logger.info(`Alle ${ergArray.length} Mitglieder ausgelesen.` );

    } else {

        logger.warn("Keine Mitglieder in der Datenbank.");
    }

    return ergArray;
}


/**
 * Sucht nach Mitglieder anhand Such-String in Vor- oder Nachname.
 * Die Suche ist case-insensitive.
 *
 * @param {*} suchString Such-String, wird auf Vor- und Nachname angewendet.
 *
 * @return Array mit Mitgliedern; kann leer sein, aber nicht `null` oder `undefined`.
 */
function suche(suchString) {

    const alleArray = datenbankObjekt.mitgliedGetAlle();

    if (alleArray.length === 0) {

        logger.warn("Keine Mitglieder in der Datenbank.");
        return [];
    }

    const suchStringLowerCase = suchString.toLowerCase();

    const teilmengeArray =  alleArray.filter(
        (mitglied) => mitglied.vorname.toLowerCase( ).includes( suchStringLowerCase ) ||
                   mitglied.nachname.toLowerCase().includes( suchStringLowerCase )
    );

    logger.info(`Anzahl gefundener Mitglieder für Such-String "${suchString}": ` +
                 teilmengeArray.length);

    return teilmengeArray;
}


/**
 * Suche nach Mitglied anhand MitgliedID.
 *
 * @param {number} mitgliedID MitgliedID (Integer).
 *
 * @returns Mitglied-Objekt oder `null`, wenn nicht gefunden.
 */
function getByMitgliedID(mitgliedID) {

    const alleArray = datenbankObjekt.mitgliedGetAlle();

    const foundMitglied = alleArray.find(mitglied => mitglied.mitgliedID === mitgliedID);

    if (foundMitglied) {

        logger.info(`Studi mit MitgliedID "${mitgliedID}" gefunden: `+
                    `${foundMitglied.vorname} ${foundMitglied.nachname}`);
        return foundMitglied;

    } else {

        logger.info(`Kein Mitglied mit MitgliedID "${mitgliedID}" gefunden.`);
        return null;
    }
}


/**
 * Neues Mitglied anlegen. Es muss sichergestellt sein, dass `mitgliedObjekt`
 * die Attribute `mitgliedID`, `vorname`, `nachname` sowie `adresse`
 * enthält.
 *
 * @return String mit Fehlermeldung; ist leer, wenn kein Fehler aufgetreten
 *         ist, das Mitglied also erfolgreich angelegt wurde.
 */
async function neu(mitgliedObjekt) {

    const mitgliedID = mitgliedObjekt.mitgliedID;

    if ( !Number.isInteger(mitgliedID) ) {

        return "MitgliedID ist keine ganze Zahl (Integer).";
    }

    const mitgliedGefunden = getByMitglied(mitgliedID);
    if (mitgliedGefunden) {

        return `Mitglied mit MitgliedID ${mitgliedID} existiert bereits: ` +
               `${mitgliedGefunden.vorname} ${mitgliedGefunden.nachname}`;
    }

    // check if studiengang ist existing
    const sgKurz = studiObjekt.studiengang;

    const buchObjekt = buchService.getBybuchID(sgKurz);
    if (!buchObjekt) {

        return `Mitglied mit unbekanntem Buch "${sgKurz}" kann nicht angelegt werden.`;
    }

    // eigentliches Anlegen neuer Mitglied
    await datenbankObjekt.mitgliedNeu(mitgliedObjekt);

    logger.info(`Neues Mitglied angelegt: ${mitgliedObjekt.mitgliedID} - ` +
                `${mitgliedObjekt.vorname} ${mitgliedObjekt.nachname} - ${sgKurz}`);

    return "";
}


/**
 * Einzelne Attribute in Mitglied-Objekt ändern
 * (MitgliedID ist Schlüssel und kann daher nicht geändert werden).
 *
 * @param {*} mitgliedID  MitgliedID von Mitglied, für den Änderungen vorgenommen werden sollen.
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