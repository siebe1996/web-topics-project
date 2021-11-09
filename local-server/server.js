/**
 * @author Van de Voorde Siebe
 * @Version 6-11-2021
 */
;(function () {
    "use strict";

    let express = require("express");
    let app = express();
    let port = 3006;

    app.use(function(req, res , next){
        console.log(`${new Date()} - ${req.method} request for ${req.url}`);
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(express.static("../static"));

    app.listen(port, function () {
        console.log(`Serving static on http://localhost:${port}`)
    });
})();