import express from 'express';
import axios from "axios";
import bodyParser from 'body-parser';

const app = express();
app.use(express.json());
const port = 3000;
const API_URL = 'http://api.openweathermap.org/geo/1.0/direct?q='
const API_KEY = 'a94868876d300e0fa26e8816596b733a'

function contentExist(lavel, value){
    return `${label} : ${value !== undefined ? value : "No disponible"}`
}



app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("index.ejs", {content: "Waiting for data...", options: null, error: null})
})

app.post("/city", async (req, res) => {
    const searchName = req.body.citySearch;
    console.log(searchName);
    try {
        
        const result = await axios.get(API_URL + searchName + '&limit=5' + '&appid=' + API_KEY);
        // for(let i = 0; i < (result.data).length; i++){
        //     console.log(result.data[i].country)
        // }

// console.log(Geolocation.getCurrentPositon());
        res.render("index.ejs", { options: result.data, error: "No se encontró la locación" ,contentExist});
    } catch (error) {
        res.render("index.ejs", { options:null, error: "No se encontró la locación"});
    }
    });

    app.post("/currentLoc", async (req, res) => {
        const lat = req.body.lat;
        const lon = req.body.lon;
        console.log(lat, lon)
    
        if (!lat || !lon) {
            return res.status(400).json({ error: "Coordenadas no disponibles" });
        }

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`);
            const weatherData = response.data;
            
            

            const forecast = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`)
            const groupedData = forecast.data.list.reduce((acc, curr) => {
                const date = curr.dt_txt.split(' ')[0]; // Extraemos solo la fecha
                if (!acc[date]) acc[date] = []; // Si no existe el día, lo creamos
                acc[date].push(curr); // Añadimos el registro al día correspondiente
                return acc;
            }, {});
            // const forecastData = forecast.data
            res.render("maps.ejs", { weatherItem: weatherData, forecast: groupedData, options: null, error: null ,contentExist});
        } catch (error) {
            console.error("Error al obtener los datos del clima:", error);
            res.status(500).json({ error: "Error al obtener los datos del clima" });
        }
    });

    
app.post("/cityS", async (req, res) => {
    const coordinates = req.body.coordinates;
    const [lat, lon]= coordinates.split(',');
    console.log("Latitud:", lat);
    console.log("Longitud:", lon);
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const weatherData = response.data;
        res.render("maps.ejs", { weatherItem: weatherData, coordinates: coordinates , options: null, error: null ,contentExist});
    } catch (error) {
        res.render("index.ejs", { content:null, options: null, error: "No se encontró la locación"});
        
    }
        
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
