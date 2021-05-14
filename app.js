const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg")

const axios = require('axios');
const { response } = require("express");



const pool = new Pool({ user: "postgres", host: "139.59.187.228", database: "dvf_202010", password: "root", port: 5432 })
const app = express();
const adresse = "23 rue Henri Salvador 13320 Bouc Bel Air"
const myHouse = {
    region: "PACA",
    department: "Bouche-duRhone",
    ville: "Marseille",
    voisinage: "Cadastre",
    codePostale: "",
    rue: "",
    numero: ""
}
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});
app.use(bodyParser.json());
async function getlonglatbyadress(adress) {
    let coordinates = { long: 0, lat: 0 };
    await axios.get('https://api-adresse.data.gouv.fr/search/?q=' + adress)
        .then(response => {
            coordinates.long = response.data.features[0].geometry.coordinates[0];
            coordinates.lat = response.data.features[0].geometry.coordinates[1];
            console.log('Coordinates', coordinates)
            //console.log(response.data.features);
            // console.log(response.data.explanation);

        })
        .catch(error => {
            console.log(error);
        });
    return coordinates;

}

app.get("/longlat", async (req, res, next) => {
    console.log("REquest Params", req.query.adress)
    let coordinates = await getlonglatbyadress(req.query.adress)
    res.json(coordinates)
})


// 500m => 4500eu /M2
// 1KM =>
// Commmune
//Ville
//Departement


app.get("/adressHelper", async (req, res, next) => {

    let adressArray = req.query.adress.split(",");

    const currentDepartement = await axios.get('https://geo.api.gouv.fr/communes?codePostal=' + adressArray[0] + '&fields=codeDepartement&format=json&geometry=centre').then(response => {
        if (response.data.length) {
            console.log("Current Departement ", adressArray[0], response.data[0]);
            return response.data[0].codeDepartement;
        }
    }).catch(error => {
        console.log(error);
    });
    let result = [];
    for (const adress of adressArray) {
        //One String city of d
        if (adress.match('^[a-zA-Z-]*$')) {

            // Departement Checking 
            const code = await axios.get('https://geo.api.gouv.fr/departements?nom=' + adress + '&fields=code')
                .then(response => {
                    if (response.data.length) {
                        console.log("REsponde Departement for ", adress, response.data[0]);
                        return response.data[0];
                    }
                }).catch(error => {
                    console.log(error);
                });
            if (code && code.code !== undefined) {
                result.push(code)
                const communes = await axios.get('https://geo.api.gouv.fr/departements/' + code.code + '/communes?fields=nom,codesPostaux&format=json&geometry=centre')
                    .then(response => {
                        return response.data
                    }).catch(error => {
                        console.log(error);
                    });
                console.log("Communes", communes);
                communes.forEach(element => {
                    result.push(element)
                });

            }
            console.log("CODE", code)

            //City checking
            const city = await axios.get('https://geo.api.gouv.fr/communes?nom=' + adress + '&fields=nom,code,codesPostaux,codeDepartement,codeRegion,population&format=json&geometry=centre')
                .then(response => {
                    return response.data
                }).catch(error => {
                    console.log(error);
                });
            city.forEach(element => {
                result.push(element)
            });

        }
        if (adress.match('^((0[1-9])|([1-8][0-9])|(9[0-8])|(2A)|(2B))[0-9]{3}$')) {
            console.log("We go there", adress.substring(0, 1), currentDepartement)

            if (adress.substring(0, 2) === currentDepartement) {

                const commune = await axios.get('https://geo.api.gouv.fr/communes?codePostal=' + adressArray[0] + '&fields=nom,code&format=json&geometry=centre').then(response => {
                    console.log("response", response.data)
                    if (response.data.length) {
                        console.log("REsponde Departement for ", adress, response.data[0]);
                        return response.data[0];
                    }
                }).catch(error => {
                    console.log(error);
                });
                console.log("Commune", commune)
                const parsedCommune = {
                    nom: commune.nom,
                    codesPostaux: [adress
                    ],
                    code: commune.code
                };
                result.push(parsedCommune)
            }

        }
        if (adress.match('^[0-9]{2}$')) {
            // Numero de Departement

        }
    }
    //Ville ou Departement

    res.json(result)
    // await axios.get('https://api-adresse.data.gouv.fr/search/?q=' + adress)
    //     .then(response => {
    //         coordinates.long = response.data.features[0].geometry.coordinates[0];
    //         coordinates.lat = response.data.features[0].geometry.coordinates[1];
    //         console.log('Coordinates', coordinates)
    //         //console.log(response.data.features);
    //         // console.log(response.data.explanation);

    //     })
    //     .catch(error => {
    //         console.log(error);
    //     });

})

app.post("/requestHomes", function (req, res) {
    // let distance = req.body.distance;
    // let surface = [req.body.surface.min, req.body.surface.max];
    // let prices = req.body.prices;
    console.log(req.body);
    res.status(200).json(req.body);
});
app.get("/getnearhouses", async (req, res, next) => {
    // http://localhost:3000/getnearhouses?adress=23+rue+Henri+Salvador+13320&distance=5&codepostal=13320
    console.log("REquest Params", req.query.adress)
    let coordinates = await getlonglatbyadress(req.query.adress)
    let codepostal = req.query.codepostal;
    let distancemax = req.query.distance;
    // SELECT * FROM public.dvf   WHERE  code_postal = 13320 AND evaluate_earth_distance(43.45942,5.402147,  latitude ,  longitude) <= 0.5 LIMIT 20
    const sqlrequest = `SELECT * FROM  public.dvf  WHERE code_postal = ` + codepostal + ` AND evaluate_earth_distance(` + coordinates.lat + `,` + coordinates.long + `, latitude ,  longitude) <= ` + distancemax;
    console.log("SQL:", sqlrequest)
    pool.query(sqlrequest, [], (err, response) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Response", response.rows)
            res.json(response.rows)
        }
    })
})

app.get("/testbdconnexion", (req, res, next) => {

    const sqlRequest = `SELECT * FROM public.dvf LIMIT 3`;
    pool.query(sqlRequest, [], (err, res) => {
        if (err) {
            console.log("Erreur d'acces a la BAse de DOnneess")
        }
        console.log("Result:", res.rows)
    })
})


app.post("/api/auth/signin", (req, res, next) => {

});

app.use("/api/stuff", (req, res, next) => {
    const stuff = [
        {
            _id: "oeihfzeoi",
            title: "Mon premier objet",
            description: "Les infos de mon premier objet",
            imageUrl: "https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg",
            price: 4900,
            userId: "qsomihvqios",
        },
        {
            _id: "oeihfzeomoihi",
            title: "Mon deuxieme objet",
            description: "Les infos de mon deuxième objet",
            imageUrl: "https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg",
            price: 2900,
            userId: "qsomihvqios",
        },
    ];
    res.status(200).json(stuff);
});


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

module.exports = app;