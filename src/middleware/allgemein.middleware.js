import logging from "logging";

const logger = logging.default("http-anfrage");

// Namenskonvention:
// alle Middleware-Funktionen in dieser Datei beginnen mit `mw`

/**
 * Diese Middleware-Funktion schreibt für jeden HTTP-Request eine Zeile
 * mit HTTP-Verb (z.B. `GET` oder `POST`) und Pfad (z.B. `/api/v1/...`
 * auf den Logger `request`.
 * <br><br>
 *
 * Beispiel-Zeilen:
 * ```
 * 16:53:06.900 [http-anfrage] GET  /api/v1/sg/VWL
 * 16:53:46.390 [http-anfrage] POST /api/v1/sg/
 * ```
 *
 * @param {*} req Request-Objekt, aus dem HTTP-Verb und Pfad gelesen werden
 *
 * @param {*} res Response-Objekt (wird nicht verwendet)
 *
 * @param {*} next Funktion, um nächste Middleware-Funktion aufzurufen
 */
function mwRequestLogger(req, res, next) {

    logger.info(`${req.method} ${req.originalUrl}`);

    next();
};


/**
 * Diese Middleware-Funktion fängt SyntaxError-Objekte ab, die von
 * `express.json()` geworfen werden, wenn der Body eines HTTP-Requests
 * (z.B. HTTP-POST) kein gültiges JSON enthält.
 */
function mwCatchIllegalJson(err, req, res, next) {

    if (err instanceof SyntaxError) {

        logger.error("Illegal JSON in HTTP-Request: " + err );
        res.status(400).send("Bad Request: JSON-Body kein gültiges JSON.");

    } else {

        next();
    }
}


// Middleware-Funktionen als Array exportieren
export default [ mwRequestLogger, mwCatchIllegalJson ];