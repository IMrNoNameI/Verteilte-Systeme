import logging from "logging";

import { API_PREFIX } from "./konstanten.js";

import mitgliedService from "../services/mitglied.services.js";
import { CUSTOM_HEADER_ANZAHL, CUSTOM_HEADER_FEHLER } from "./konstanten.js";
import { HTTP_STATUS_CODES } from "./konstanten.js";

const logger = logging.default("mitglied-controller");


/**
 * Routen für einzelne REST-Endpunkte für den Entity-Typ `mitglied`
 * (Mitglied) registrieren.
 *
 * Diese Funktion ist der Default-Export des Moduls, weil es
 * sich hierbei um die einzige Methode handelt, die von außen
 * aufgerufen werden soll.
 *
 * @param {*} Express-App-Objekt
 *
 * @return {number} Anzahl der registrierten REST-Endpunkte
 */
export default function routenRegistrieren(app) {

    const entityTyp = "mitglied"; // "mitglied" für "Mitglied"

    const prefixFuerRouten = `${API_PREFIX}/${entityTyp}`;

    const routeRessource  = `${prefixFuerRouten}/:mitgliedID`;
    const routeCollection = `${prefixFuerRouten}/`;

    let anzahlRestEndpunkte = 0;

    app.get( routeRessource, getResource );
    logger.info(`Route registriert: GET ${routeRessource}`);
    anzahlRestEndpunkte++;

    app.get( routeCollection, getCollection );
    logger.info(`Route registriert: GET ${routeCollection}`);
    anzahlRestEndpunkte++;

    app.post( routeCollection, postCollection );
    logger.info(`Route registriert: POST ${routeCollection}`);
    anzahlRestEndpunkte++;

    app.delete( routeRessource, deleteResource );
    logger.info(`Route registriert: DELETE ${routeRessource}`);
    anzahlRestEndpunkte++;

    app.patch( routeRessource, patchResource );
    logger.info(`Route registriert: PATCH ${routeRessource}`);
    anzahlRestEndpunkte++;

    // HTTP-PUT wird nicht implementiert, weil es nicht sinnvoll ist,
    // einfach ein ganzes Mitglied-Objekt zu ersetzen.

    return anzahlRestEndpunkte;
};


// Namenskonvention für Funktionen, die HTTP-Requests verarbeiten:
// [GET|POST|PUT|...][Ressource|Collection]


/**
 * Funktion HTTP-GET-Request auf eine Ressource mit mitgliedID
 * als Pfadparameter
 */
function getResource(req, res) {

    const mitgliedID = req.params.mitgliedID;

    // versuche, die mitgliedID zu parsen
    let mitgliedIDInt = parseInt(mitgliedID);

    if ( isNaN(mitgliedIDInt) ) {

        logger.error(`Pfadparameterwert "${mitgliedID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "MitgliedID muss eine Zahl sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json({});
        return;
    }

    const ergebnisObjekt = mitgliedService.getByMitgliedID(mitgliedIDInt);

    if(ergebnisObjekt) {

        res.status( HTTP_STATUS_CODES.OK_200 );
        res.json( ergebnisObjekt );

    } else {

        res.status( HTTP_STATUS_CODES.NOT_FOUND_404 );
        res.json( {} );
    }
}


/**
 * Funktion für GET-Request auf Mitglied-Collection.
 * Kann Such-Parameter `q` auswerten.
 */
function getCollection(req, res) {

    let ergebnisArray = null;

    const suchString = req.query.q;
    if (suchString) {

        ergebnisArray = mitgliedService.suche(suchString);

    } else {

        ergebnisArray = mitgliedService.getAlle();
    }

    const anzahl = ergebnisArray.length;

    res.setHeader(CUSTOM_HEADER_ANZAHL, anzahl);

    if (anzahl === 0) {

        res.status(HTTP_STATUS_CODES.NOT_FOUND_404);
        res.json( [] );

    } else {

        res.status( HTTP_STATUS_CODES.OK_200 );
        res.json( ergebnisArray );
    }
}

/**
 * Neues Mitglied anlegen.
 */
async function postCollection(req, res) {

    const mitgliedID  = req.body.mitgliedID;
    const vorname     = req.body.vorname;
    const nachname    = req.body.nachname;
    const adresse     = req.body.adresse;

    if (mitgliedID === undefined) {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'mitgliedID' fehlt.");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }
    if (vorname === undefined || vorname.trim() === "" ) {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'vorname' fehlt oder ist leer");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }
    if (nachname === undefined || nachname.trim() === "" ) {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'nachname' fehlt oder ist leer");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }
    if (adresse === undefined || adresse.trim() === "" ) {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'adresse' fehlt oder ist leer");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }

    // In neues Objekt umwandeln, damit evtl. überflüssige Attribute
    // entfernt werden; außerdem werden die Werte normalisiert.
    const neuesMitglied = {

        mitgliedID : mitgliedID,
        vorname    : vorname.trim(),
        nachname   : nachname.trim(),
        adresse    : adresse.trim(),
    };

    const fehlerMeldung = await mitgliedService.neu(neuesMitglied);

    if (fehlerMeldung === "") {

        res.status( HTTP_STATUS_CODES.CREATED_201 );
        res.json( neuesMitglied );

    } else {

        res.setHeader(CUSTOM_HEADER_FEHLER, fehlerMeldung);
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
    }
}


/**
 * Funktion für HTTP-DELETE zu mitglied-Ressource, also um Mitglied zu löschen.
 */
async function deleteResource(req, res) {

    const mitgliedID = req.params.mitgliedID;

    // versuche, die matrikelnummer zu parsen
    let mitgliedIDInt = parseInt(mitgliedID);

    if ( isNaN(mitgliedIDInt) ) {

        logger.error(`Pfadparameterwert "${mitgliedID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "MitgliedID muss eine ganze Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }

    const erfolgreich = await mitgliedService.mitgliedLoeschen(mitgliedIDInt);

    if (erfolgreich) {

        res.status( HTTP_STATUS_CODES.NO_CONTENT_204 );
        res.json( {} );

    } else {

        res.setHeader(CUSTOM_HEADER_FEHLER,
                      `Löschen fehlgeschlagen, kein Mitglied mit dieser MitgliedID ${mitgliedIDInt} gefunden.`);
        res.status( HTTP_STATUS_CODES.NOT_FOUND_404 );
        res.json( {} );
    }
}


/**
 * Einzelne Felder einer Mitglied-Ressource ändern.
 * Im JSON-Body muss mindestens ein neuer Wert für eines
 * der folgenden Attribute enthalten sein:
 * `vorname`, `nachname`, `adresse`.
 */
async function patchResource(req, res) {

    const mitgliedID = req.params.mitgliedID;

    // versuche, die matrikelnummer zu parsen
    let mitgliedIDInt = parseInt(mitgliedID);

    if ( isNaN(mitgliedIDInt) ) {

        logger.error(`Pfadparameterwert "${mitgliedID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "MitgliedID muss eine ganze Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }

    const vorname     = req.body.vorname;
    const nachname    = req.body.nachname;
    const adresse     = req.body.adresse;

    const mitgliedObjekt = {};

    let einAttributGeaendert = false;
    if (vorname && vorname.trim().length > 0 ) {

        einAttributGeaendert = true;
        mitgliedObjekt.vorname = vorname.trim();
    }
    if (nachname && nachname.trim().length > 0 ) {

        einAttributGeaendert = true;
        mitgliedObjekt.nachname = nachname.trim();
    }
    if (adresse && adresse.trim().length > 0 ) {

        einAttributGeaendert = true;
        mitgliedObjekt.adresse = adresse.trim();
    }
    if (einAttributGeaendert === false) {

        res.setHeader(CUSTOM_HEADER_FEHLER,
                      "Es muss mindestens ein Attribut mit neuem Wert im JSON-Body enthalten sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }


    const ergebnisObjekt = await mitgliedService.mitgliedAendern(mitgliedIDInt, mitgliedObjekt);

    if (ergebnisObjekt.fehler) {

        res.status( HTTP_STATUS_CODES.NOT_FOUND_404 );
        res.setHeader(CUSTOM_HEADER_FEHLER, ergebnisObjekt.fehler);
        res.json( {} );
        return;

    } else {

        res.status( HTTP_STATUS_CODES.OK_200 );
        res.json( ergebnisObjekt );
    }
}