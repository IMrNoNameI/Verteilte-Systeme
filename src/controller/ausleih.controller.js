import logging from "logging";

import { API_PREFIX }                                 from "./konstanten.js";
import { HTTP_STATUS_CODES  }                         from "./konstanten.js";
import { CUSTOM_HEADER_ANZAHL, CUSTOM_HEADER_FEHLER } from "./konstanten.js";

import sgService from "../services/sg.service.js";


const logger = logging.default("sg-controller");


/**
 * Routen für einzelne REST-Endpunkte für den Entity-Typ `sg`
 * (Studiengang) registrieren.
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

    const entityTyp = "sg"; // "sg" für "Studiengang"

    const prefixFuerRouten = `${API_PREFIX}/${entityTyp}`;

    const routeRessource  = `${prefixFuerRouten}/:abk`;
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

    /*
    // Handler-Funktion für alle nicht explizit registrierten HTTP-Verben.
    // ACHTUNG: HTTP-OPTIONS funktioniert dann nicht mehr ohne es
    //          explizit zu registrieren.
    app.all(routeCollection, httpVerbNichtUnterstuetzt);
    app.all(routeRessource , httpVerbNichtUnterstuetzt);
    */

    return anzahlRestEndpunkte;
};


// Namenskonvention für Funktionen, die HTTP-Requests verarbeiten:
// [GET|POST|PUT|...][Ressource|Collection]


/**
 * Funktion für HTTP-GET-Request auf die Ressource
 * (Suche einen Studiengang nach Kurzname als Pfadparameter).
 */
function getResource(req, res) {

    const kurzname = req.params.abk;

    const ergebnisObjekt = sgService.getByKurzname(kurzname);

    if(ergebnisObjekt) {

        res.status( HTTP_STATUS_CODES.OK_200 );
        res.json( ergebnisObjekt );

    } else {

        res.status( HTTP_STATUS_CODES.NOT_FOUND_404 );
        res.json( {} );
    }
}


/**
 * Funktion für HTTP-GET-Request auf die Collection
 * (Suche alle alle Studiengänge).
 */
function getCollection(req, res) {

    let ergebnisArray = null;

    const suchString = req.query.q;
    if (suchString) {

        ergebnisArray = sgService.suche(suchString);

    } else {

        ergebnisArray = sgService.getAlle();
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
 * Funktion für HTTP-POST-Request auf die Collection, um
 * neuen Studiengang anzulegen.
 */
async function postCollection(req, res) {

    const kurzName = req.body.kurz;
    const langName = req.body.lang;

    if (kurzName === undefined || kurzName.trim() === "") {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'kurz' fehlt oder ist leer.");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }

    if (langName === undefined || langName.trim() === "") {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'lang' fehlt oder ist leer.");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }

    // In neues Objekt umwandeln, damit evtl. überflüssige Attribute
    // entfernt werden; außerdem werden die Werte normalisiert.
    const neuesObjekt = { kurz: kurzName.trim().toUpperCase(),
                          lang: langName.trim() };

    const erfolgreich = await sgService.neu(neuesObjekt);
    if (erfolgreich) {

        res.status( HTTP_STATUS_CODES.CREATED_201 );
        res.json( neuesObjekt );

    } else {

        res.setHeader( CUSTOM_HEADER_FEHLER, "Studienrichtung mit diesem Kurznamen existierte bereits." );
        res.status( HTTP_STATUS_CODES.CONFLICT_409 );
        res.json( {} );
    }
}