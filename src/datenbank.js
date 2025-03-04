import { JSONFilePreset } from 'lowdb/node';
import logging from "logging";


const logger = logging.default("datenbank");

const dbDateiName = "db.json"; // diese Datei in .gitignore und Ingore-Liste für nodemon aufnehmen

// Anfangsdaten, wenn die Datenbank-Datei nicht existiert
const anfangsDaten =  {

"buecher": [
        {
            "buchID": 123456,
            "titel": "Connie hat Bierschiss",
            "autor": "Petra D. Waix",
            "verfuegbar": true
        },{
            "buchID": 234567,
            "titel": "Davids Traum vom großen Klau",
            "autor": "Jules Verne",
            "verfuegbar": false
        }
    ],

    "studiengaenge": [
       {
        "kurz": "BWL",
        "lang": "Betriebswirtschaftslehre"
       },{
        "kurz": "WING",
        "lang": "Wirtschaftsingenieurwesen"
       },{
        "kurz": "WINF",
        "lang": "Wirtschaftsinformatik"
       },{
        "kurz": "INFO",
        "lang": "Informatik"
       },{
        "kurz": "IWMM",
        "lang": "Irgendwas mit Medien"
       },{
        "kurz": "VWL",
        "lang": "Volkswirtschaftslehre"
       },{
        "kurz": "BW",
        "lang": "Brauereiwesen"
       },{
        "kurz": "WBÖ",
        "lang": "Weinbau und Önologie"
       },{
        "kurz": "LUD",
        "lang": "Ludologie"
       }
    ],

    "studis": [
        {
            "matrikelnr": 123456,
            "vorname": "Hans",
            "nachname": "Wiwi",
            "studiengang": "BWL"
        },{
            "matrikelnr": 234567,
            "vorname": "Nina",
            "nachname": "Info",
            "studiengang": "INFO"
        }
    ]
};


/* Objekt für Zugriff auf Datenbank. */
let datenbank = null;


/**
 * Initialisiert die Datenbank. Wenn die Datenbank-Datei nicht existiert,
 * wird sie mit den Anfangsdaten initialisiert.
 */
async function initialisieren() {

    datenbank = await JSONFilePreset( dbDateiName, anfangsDaten );

    await datenbank.write();

    logger.info(`Datenbank mit Datei "${dbDateiName}" initialisiert.`        );
    logger.info(`Anzahl Studiengänge: ${datenbank.data.studiengaenge.length}`);
    logger.info(`Anzahl Studierende : ${datenbank.data.studis.length}`       );
}


// Namenskonvention: Alle Funktionen für den Zugriff auf die Datenbank
//                   müssen mit dem Namen des Entitätstyps beginnen,
//                   also entweder "studiengang..." oder "studi...".
//                   Erst kommen die Funktionen für die Studiengänge,
//                   dann die für die Studierenden.


/**
 * Alle Bücher von Datenbank holen.
 *
 * @returns Array mit allen Büchern;
 *          wird nicht `null` oder `undefined` sein;
 *          alphabetisch sortiert nach `titel`.
 */
function buchGetAlle() {

    if (datenbank.data && datenbank.data.buecher) {

        const sortFkt = (a, b) => a.titel.localeCompare(b.titel)

        return datenbank.data.buecher.sort( sortFkt );

    } else {

        return [];
    }
}


/**
 * Neues Buch anlegen. Es muss sichergestellt sein,
 * dass es nur ein Buch mit der gleichen ID gibt!
 *
 * @param {*} buchObjekt Objekt mit neuem Buch, muss
    *            die Attribute `ID`, `Titel`, `Autor` und `verfügbar` enthalten.
 */
async function buchNeu(buchObjekt) {

    datenbank.data.buecher.push(buchObjekt)
    await datenbank.write();

    logger.info(`Anzahl Bücher nach Anlegen von neuem Buch "${buchObjekt.buchID}": ` +
                `${datenbank.data.buecher.length}`);
}


/**
 * Neuen Langnamen für einen Studiengang setzen. Die Funktion darf nur aufgerufen
 * werden, wenn vorher sichergestellt wurde, dass es einen Studiengang mit dem
 * Kurznamen gibt.
 *
 * @param {*} buchID ID (Schlüssel) des Buchs, für die das Buchobjekt
 *                     geändert werden soll.
 *
 * @param {*} buchObjekt Neues Buchobjekt, dass für das Buch gespeichert werden soll.
 *
 * @return {object} Geändertes Buch-Objekt oder leeres Objekt, wenn kein
 *                  Buch mit der ID gefunden wurde.
 */
async function buchAendern(buchID, buchObjekt) {

    const buch = datenbank.data.buecher.find( (buch) => buch.buchID === buchID );

    if (buch) {

        buch.titel = buchObjekt.titel;
        buch.autor = buchObjekt.autor;
        buch.verfuegbar = buchObjekt.verfuegbar;
        await datenbank.write();

        logger.info(`Werte von Buch "${buchID}" geändert: ${buchObjekt.titel}`);

        return buch;

    } else {

        logger.error(`INTERNER FEHLER: Kein Buch mit ID "${buchID}" gefunden.`);
        return {};
    }
    
}
/**
 * Bücher anhand ID löschen.
 *
 * @param {*} buchID ID von zu löschenden Buch.
 */
async function buchLoeschen(buchID)  {

    const filterFkt = (buch) => buch.buchID !== buchID;

    datenbank.data.buecher = datenbank.data.buecher.filter( filterFkt );

    await datenbank.write();

    logger.info(`Anzahl Bücher nach Löschen: ${datenbank.data.buecher.length}`);
}

// ****** ab jetzt die Funktionen für die Mitglieder-Datensätze ******

/**
 * Alle Mitglieder von Datenbank holen.
 *
 * @returns Array mit allen Mitgliedern, sortiert nach aufsteigenden
 *          MitgliederID; wird nicht `null` oder `undefined` sein.
 */
function mitgliedGetAlle() {

    if (datenbank.data && datenbank.data.mitglieder) {

        const sortFkt = (a, b) => a.mitgliedID - b.mitgliedID;

        return datenbank.data.mitglieder.sort(sortFkt);

    } else {

        return [];
    }
}


/**
 * Neues Mitglied anlegen. Es muss sichergestellt sein,
 * dass es nur ein Mitglied mit der gleichen ID
 * gibt!
 *
 * @param {*} mitgliedObjekt Objekt mit neuem Mitglied, muss
 *                        die Attribute `mitgliedID`, `vorname`,
 *                        `nachname` und `adresse` enthalten.
 */
async function mitgliedNeu(mitgliedObjekt) {

    datenbank.data.mitglieder.push(mitgliedObjekt)
    await datenbank.write();

    logger.info(`Anzahl Mitglieder nach Anlegen von neuem Mitglied: ${datenbank.data.mitglieder.length}`);
}


/**
 * Mitglieder anhand ID löschen.
 *
 * @param {*} mitgliedID ID von zu löschenden Mitglied.
 */
async function mitgliedLoeschen(mitgliedID)  {

    const filterFkt = (mitglied) => mitglied.mitgliedID !== mitgliedID;

    datenbank.data.mitglieder = datenbank.data.mitglieder.filter( filterFkt );

    await datenbank.write();

    logger.info(`Anzahl Mitglieder nach Löschen: ${datenbank.data.mitglieder.length}`);
}


/**
 * Ändert ausgewählte Eigenschaften eines Mitglieds.
 *
 * @param {number} mitgliedID ID des zu ändernden Mitglieds; es muss
 *                            vorher überprüft werden, dass ein Mitglied mit
 *                            dieser ID existiert.
 *
 * @param {*} mitgliedObjekt Objekt mit neuen Werten für das Mitglied; die Werte
 *                        müssen schon normalisiert sein
 *
 * @return {object} Geändertes Mitglied-Objekt oder `null`, wenn kein Mitglied
 *                  mit der ID gefunden wurde.
 */
async function mitgliedAendern(matrikelnr, deltaObjekt) {

    let studiObjekt = null;
    for (let i=0; i < datenbank.data.studis.length; i++) {

        if (datenbank.data.studis[i].matrikelnr === matrikelnr) {

            studiObjekt = datenbank.data.studis[i];
            break;
        }
    }

    if (studiObjekt === null) {

        logger.error(`INTERNER FEHLER: Kein Studi mit Matrikelnr "${matrikelnr}" gefunden.`);
        return null;
    }

    if (deltaObjekt.vorname) {

        studiObjekt.vorname = deltaObjekt.vorname;
        logger.info(`Vorname von Studi ${matrikelnr} geändert: ${studiObjekt.vorname}`);
    }
    if (deltaObjekt.nachname) {

        studiObjekt.nachname = deltaObjekt.nachname;
        logger.info(`Nachname von Studi ${matrikelnr} geändert: ${studiObjekt.nachname}`);
    }
    if (deltaObjekt.studiengang) {

        studiObjekt.studiengang = deltaObjekt.studiengang;
        logger.info(`Studiengang von Studi ${matrikelnr} geändert: ${studiObjekt.studiengang}`);
    }

    await datenbank.write();

    return studiObjekt;
}


/**
 * Alle Funktionen mit Default-Objekt exportieren.
 */
export default {

    initialisieren,

    buchGetAlle, buchNeu, buchAendern, buchLoeschen,

    mitgliedGetAlle, mitgliedNeu, mitgliedLoeschen, mitgliedAendern
};