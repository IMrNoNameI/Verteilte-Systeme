import { JSONFilePreset } from 'lowdb/node';
import logging from "logging";


const logger = logging.default("datenbank");

const dbDateiName = "db.json"; // diese Datei in .gitignore und Ingore-Liste für nodemon aufnehmen

// Anfangsdaten, wenn die Datenbank-Datei nicht existiert
const anfangsDaten =  {

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
 * Alle Studiengänge von Datenbank holen.
 *
 * @returns Array mit allen Studiengängen;
 *          wird nicht `null` oder `undefined` sein;
 *          alphabetisch sortiert nach `kurz`.
 */
function studiengangGetAlle() {

    if (datenbank.data && datenbank.data.studiengaenge) {

        const sortFkt = (a, b) => a.kurz.localeCompare(b.kurz)

        return datenbank.data.studiengaenge.sort( sortFkt );

    } else {

        return [];
    }
}


/**
 * Neuen Studiengang anlegen. Es muss sichergestellt sein,
 * dass es nur keinen Studiengang mit dem gleichen Kurznamen
 * gibt!
 *
 * @param {*} sgObjekt Objekt mit neuem Studiengang, muss
 *            die Attribute `kurz` und `lang` enthalten.
 */
async function studiengangNeu(sgObjekt) {

    datenbank.data.studiengaenge.push(sgObjekt)
    await datenbank.write();

    logger.info(`Anzahl Studiengänge nach Anlegen neuer Studiengang "${sgObjekt.kurz}": ` +
                `${datenbank.data.studiengaenge.length}`);
}


/**
 * Neuen Langnamen für einen Studiengang setzen. Die Funktion darf nur aufgerufen
 * werden, wenn vorher sichergestellt wurde, dass es einen Studiengang mit dem
 * Kurznamen gibt.
 *
 * @param {*} kurzname Kurzname (Schlüssel) des Studiengangs, für den der Langname
 *                     geändert werden soll.
 *
 * @param {*} langname Neuer Langname, der für den Studiengang gespeichert werden soll.
 *
 * @return {object} Geändertes Studiengang-Objekt oder leeres Objekt, wenn kein
 *                  Studiengang mit dem Kurznamen gefunden wurde.
 */
async function studiengangLangnameAendern(kurzname, langname) {

    const studiengang = datenbank.data.studiengaenge.find( (sg) => sg.kurz === kurzname );

    if (studiengang) {

        studiengang.lang = langname;
        await datenbank.write();

        logger.info(`Langname von Studiengang "${kurzname}" geändert: ${langname}`);

        return studiengang;

    } else {

        logger.error(`INTERNER FEHLER: Kein Studiengang mit Kurzname "${kurzname}" gefunden.`);
        return {};
    }
}


// ****** ab jetzt die Funktionen für die Studi-Datensätze ******

/**
 * Alle Studierenden von Datenbank holen.
 *
 * @returns Array mit allen Studierenden, sortiert nach aufsteigenden
 *          Matrikelnummer; wird nicht `null` oder `undefined` sein.
 */
function studiGetAlle() {

    if (datenbank.data && datenbank.data.studis) {

        const sortFkt = (a, b) => a.matrikelnr - b.matrikelnr;

        return datenbank.data.studis.sort(sortFkt);

    } else {

        return [];
    }
}


/**
 * Neuen Studierenden anlegen. Es muss sichergestellt sein,
 * dass es nur keinen Studierenden mit der gleichen Matrikelnummer
 * gibt!
 *
 * @param {*} studiObjekt Objekt mit neuem Studierenden, muss
 *                        die Attribute `matrikelnr`, `vorname`,
 *                        `nachname` und `studiengang` enthalten.
 */
async function studiNeu(studiObjekt) {

    datenbank.data.studis.push(studiObjekt)
    await datenbank.write();

    logger.info(`Anzahl Studis nach Anlegen neuer Studi: ${datenbank.data.studis.length}`);
}


/**
 * Studierenden anhand Matrikelnummer löschen.
 *
 * @param {*} matrikelnr Matrikelnummer von zu löschemden studi.
 */
async function studiLoeschen(matrikelnr)  {

    const filterFkt = (studi) => studi.matrikelnr !== matrikelnr;

    datenbank.data.studis = datenbank.data.studis.filter( filterFkt );

    await datenbank.write();

    logger.info(`Anzahl Studis nach Löschen: ${datenbank.data.studis.length}`);
}


/**
 * Ändert ausgewählte Eigenschaften eines Studierenden.
 *
 * @param {number} matrikelnr Matrkelnummer des zu ändernden Studis; es muss
 *                            vorher überprüft werden, dass ein Studi mit
 *                            dieser Matrikelnummer existiert.
 *
 * @param {*} deltaObjekt Objekt mit neuen Werten für den Studi; die Werte
 *                        müssen schon normalisiert sein und der Studiengang
 *                        (falls enthalten) muss existieren.
 *
 * @return {object} Geändertes Studi-Objekt oder `null`, wenn kein Studi
 *                  mit der Matrikelnummer gefunden wurde.
 */
async function studiAendern(matrikelnr, deltaObjekt) {

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

    studiengangGetAlle, studiengangNeu, studiengangLangnameAendern,

    studiGetAlle, studiNeu, studiLoeschen, studiAendern
};