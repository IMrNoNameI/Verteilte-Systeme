import logging from "logging";

import { API_PREFIX }                                 from "./konstanten.js";
import { HTTP_STATUS_CODES  }                         from "./konstanten.js";
import { CUSTOM_HEADER_ANZAHL, CUSTOM_HEADER_FEHLER } from "./konstanten.js";

import ausleihService from "../services/ausleih.services.js";
import ausleihServices from "../services/ausleih.services.js";


const logger = logging.default("ausleih-controller");


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

    const entityTyp = "ausleih"; // "buch" für "Buch"

    const prefixFuerRouten = `${API_PREFIX}/${entityTyp}`;

    const routeRessource  = `${prefixFuerRouten}/:ausleihID`;
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
    
    app.patch( routeRessource, patchResource );
    logger.info(`Route registriert: PATCH ${routeRessource}`);
    anzahlRestEndpunkte++;

    app.delete( routeRessource, deleteResource );
    logger.info(`Route registriert: DELETE ${routeRessource}`);
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
 * (Suche einen Studiengang nach AusleihID als Pfadparameter).
 */
function getResource(req, res) {

    const ausleihID = req.params.ausleihID;

    // versuche, die ausleihID zu parsen
    let ausleihIDInt = parseInt(ausleihID);

    if ( isNaN(ausleihIDInt) ) {

        logger.error(`Pfadparameterwert "${ausleihID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "AusleihID muss eine ganze positive Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }

    const ergebnisObjekt = ausleihService.getByAusleihID(ausleihIDInt);

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
 * (Suche alle Bücher).
 */
function getCollection(req, res) {

    let ergebnisArray = null;

    const suchString = req.query.q;
    if (suchString) {

        ergebnisArray = ausleihService.suche(suchString);

    } else {

        ergebnisArray = ausleihService.getAlle();
    }

    const anzahl = ergebnisArray.length;

    res.setHeader(CUSTOM_HEADER_ANZAHL, anzahl);

    if (anzahl === 0) {

        res.status(HTTP_STATUS_CODES.NO_CONTENT_204);
        res.json( [] );

    } else {

        res.status( HTTP_STATUS_CODES.OK_200 );
        res.json( ergebnisArray );
    }
}


/**
 * Funktion für HTTP-POST-Request auf die Collection, um
 * neues Buch anzulegen.
 */
async function postCollection(req, res) {

    const ausleihID = req.body.ausleihID;
    const buchID = req.body.buchID;
    const mitgliedID = req.body.mitgliedID;
    const verliehen = req.body.verliehen;

    if (ausleihID === undefined || ausleihID === "") {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'ausleihID' fehlt oder ist leer.");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }

    let ausleihIDInt = parseInt(ausleihID);

    if ( isNaN(ausleihIDInt || ausleihIDInt < 1 ) ) {

        logger.error(`Pfadparameterwert "${ausleihID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "AusleihID muss eine ganze positive Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }
    
    if (buchID === undefined) {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'buchID' fehlt oder ist leer.");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }

    if (mitgliedID === undefined) {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'mitgliedID' fehlt oder ist leer.");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }

    if (verliehen === undefined ) {

        res.setHeader(CUSTOM_HEADER_FEHLER, "Attribut 'verliehen' fehlt oder ist leer.");
        res.status( HTTP_STATUS_CODES.BAD_REQUEST_400 );
        res.json( {} );
        return;
    }

    let buchIDInt = parseInt(buchID);

    if ( isNaN(buchIDInt || ausleihIDInt < 1) ) {

        logger.error(`Pfadparameterwert "${buchID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "AusleihID muss eine ganze positive Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }    
    
    let mitgliedIDInt = parseInt(mitgliedID);

    if ( isNaN(mitgliedIDInt || ausleihIDInt < 1) ) {

        logger.error(`Pfadparameterwert "${mitgliedID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "AusleihID muss eine ganze positive Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }

    // In neues Objekt umwandeln, damit evtl. überflüssige Attribute
    // entfernt werden; außerdem werden die Werte normalisiert.
    const neuesObjekt = { ausleihID:ausleihIDInt, buchID: buchIDInt,
                          mitgliedID: mitgliedIDInt, verliehen: verliehen};

    const erfolgreich = await ausleihService.neu(neuesObjekt);
    if (erfolgreich === true) {

        res.status( HTTP_STATUS_CODES.CREATED_201 );
        res.json( neuesObjekt );

    } else if (erfolgreich === false){

        res.setHeader( CUSTOM_HEADER_FEHLER, "Ausleih mit AusleihID existierte bereits." );
        res.status( HTTP_STATUS_CODES.CONFLICT_409 );
        res.json( {} );
    }
    else if (erfolgreich.startsWith("Mitglied")){

        res.setHeader( CUSTOM_HEADER_FEHLER, "Mitglied mit MitgliedID existiert nicht." );
        res.status( HTTP_STATUS_CODES.CONFLICT_409 );
        res.json( {} );
    }
    else if (erfolgreich.startsWith("Buch")){

        res.setHeader( CUSTOM_HEADER_FEHLER, "Buch mit BuchID existiert nicht." );
        res.status( HTTP_STATUS_CODES.CONFLICT_409 );
        res.json( {} );
    }
}

async function deleteResource(req, res) {
    
    const ausleihID = req.params.ausleihID;

    // versuche, die ID zu parsen
    let ausleihIDInt = parseInt(ausleihID);

    if ( isNaN(ausleihIDInt) ) {

        logger.error(`Pfadparameterwert "${ausleihID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "AusleihID muss eine ganze positive Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }

    const erfolgreich = await ausleihServices.ausleihLoeschen(ausleihIDInt);

    if (erfolgreich) {

        res.status( HTTP_STATUS_CODES.NO_CONTENT_204 );
        res.json( {} );

    } else {

        res.setHeader(CUSTOM_HEADER_FEHLER,
                      `Löschen fehlgeschlagen, kein Ausleih mit dieser AusleihID ${ausleihIDInt} gefunden.`);
        res.status( HTTP_STATUS_CODES.NOT_FOUND_404 );
        res.json( {} );
    }
}

async function patchResource(req, res) { 
    
    const ausleihID = req.params.ausleihID;

    // versuche, die ausleihID zu parsen
    let ausleihIDInt = parseInt(ausleihID);

    if ( isNaN(ausleihIDInt) ) {

        logger.error(`Pfadparameterwert "${ausleihID}" konnte nicht nach Int geparst werden.`);
        res.setHeader(CUSTOM_HEADER_FEHLER, "AusleihID muss eine ganze positive Zahl (Integer) sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }

    const buchID     = req.body.buchID;
    const mitgliedID    = req.body.mitgliedID;
    const verliehen = req.body.verliehen;

    const deltaObjekt = {};

    let einAttributGeaendert = false;
    if (buchID && buchID.length > 0 ) {

        einAttributGeaendert = true;
        deltaObjekt.buchID = buchID;
    }
    if (mitgliedID && mitgliedID.length > 0 ) {

        einAttributGeaendert = true;
        deltaObjekt.mitgliedID = mitgliedID;
    }
    if (verliehen ) {

        einAttributGeaendert = true;
        deltaObjekt.verliehen = verliehen;
    }
    if (einAttributGeaendert === false) {

        res.setHeader(CUSTOM_HEADER_FEHLER,
                      "Es muss mindestens ein Attribut mit neuem Wert im JSON-Body enthalten sein.");
        res.status(HTTP_STATUS_CODES.BAD_REQUEST_400);
        res.json( {} );
        return;
    }


    const ergebnisObjekt = await ausleihService.ausleihAendern(ausleihIDInt, deltaObjekt);

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