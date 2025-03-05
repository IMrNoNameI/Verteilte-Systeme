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

        logger.info(`Mitglied mit ID "${mitgliedID}" gefunden: `+
                    `${foundMitglied.vorname} ${foundMitglied.nachname}`);
        return foundMitglied;

    } else {

        logger.info(`Kein Mitglied mit ID "${mitgliedID}" gefunden.`);
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

    const mitgliedGefunden = getByMitgliedID(mitgliedID);
    if (mitgliedGefunden) {

        return `Mitglied mit ID ${mitgliedID} existiert bereits: ` +
               `${mitgliedGefunden.vorname} ${mitgliedGefunden.nachname}`;
    }

    // eigentliches Anlegen von neuem Mitglied
    await datenbankObjekt.mitgliedNeu(mitgliedObjekt);

    logger.info(`Neues Mitglied angelegt: ${mitgliedObjekt.mitgliedID} - ` +
                `${mitgliedObjekt.vorname} ${mitgliedObjekt.nachname} - ${mitgliedObjekt.adresse}`);

    return "";
}


/**
 * Einzelne Attribute in Mitglied-Objekt ändern
 * (MitgliedID ist Schlüssel und kann daher nicht geändert werden).
 *
 * @param {*} mitgliedID  MitgliedID von Mitglied, für das Änderungen vorgenommen werden sollen.
 *
 * @param {*} mitgliedObjekt Objekt mit neuen Werten von Attributen, die geändert werden sollen.
 *                        Es muss mindestens ein Attribut enthalten.
 *
 * @returns Mitglied-Objekt mit geänderten Attributen oder Objekt mit `fehler`-Attribut,
 *          wenn die Änderung nicht erfolgreich war.
 */
async function mitgliedAendern(mitgliedID, mitgliedObjekt) {

    const mitgliedGefunden = getByMitgliedID(mitgliedID);
    if (mitgliedGefunden === false) {

        logger.warn(`Ändern fehlgeschlagen, kein Mitglied mit ID ${mitgliedID} gefunden.`);
        return { "fehler": `Kein Mitglied mit ID ${mitgliedID} gefunden.` };
    }

    const ergebnisObjekt = await datenbankObjekt.mitgliedAendern(mitgliedID, mitgliedObjekt);

    if (ergebnisObjekt === null) {

        logger.warn(`Ändern fehlgeschlagen, kein Mitglied mit ID ${mitgliedID} gefunden.`);
        return { "fehler": `Kein Mitglied mit ID ${mitgliedID} gefunden.` };

    } else {

        return ergebnisObjekt;
    }
}


/**
 * Mitglied anhand von MitgliedID löschen. Es wird zuerst geprüft, ob es überhaupt
 * ein Mitglied mit der als Argument übergebenen ID gibt.
 *
 * @param {number} mitgliedID MitgliedID von Mitglied, das gelöscht werden soll.
 *
 * @returns {boolean} `true`, wenn Mitglied gelöscht wurde, sonst `false`(weil kein Mitglied mit `mitgliedID`
 *                    gefunden wurde).
 */
async function mitgliedLoeschen(mitgliedID) {

    const mitgliedGefunden = getByMitgliedID(mitgliedID);
    if (!mitgliedGefunden) {

        logger.warn(`Löschen fehlgeschlagen, kein Mitglied mit ID ${mitgliedID} gefunden.`);
        return false;
    }

    await datenbankObjekt.mitgliedLoeschen(mitgliedID);

    logger.info(`Mitglied mit ID ${mitgliedID} gelöscht: `+
                `${mitgliedGefunden.vorname} ${mitgliedGefunden.nachname} - ${mitgliedGefunden.adresse}`);

    return true;
}


/**
 * Alle Funktionen als Objekt exportieren.
 */
export default {

    // Lese-Funktionen
    getAlle, suche, getByMitgliedID,

    // Schreib-Funktionen
    neu, mitgliedLoeschen, mitgliedAendern
};