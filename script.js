const userLocation = document.getElementById("userLocation");
const convert = document.getElementById("converter");
const weatherIcon = document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelslike = document.querySelector(".feelslike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.querySelector(".city");

const HValue = document.getElementById("HValue");
const WValue = document.getElementById("WValue");
const SRValue = document.getElementById("SRValue");
const SSValue = document.getElementById("SSValue");
const CValue = document.getElementById("CValue");
const UVValue = document.getElementById("UVValue");
const PValue = document.getElementById("PValue");

const Forecast = document.querySelector(".Forecast");

weather_api_endpoint = `https://api.openweathermap.org/data/2.5/weather?appid=564e80d44861fd35d80644350a721550&q=`;
weather_data_endpoint = `https://api.openweathermap.org/data/2.5/onecall?appid=564e80d44861fd35d80644350a721550&exclude=minutely&units=metric&`;

function findUserLocation(){
    fetch(weather_api_endpoint + userLocation.value)
    .then((response)=>response.json())
    .then((data) => {
        if(data.cod != '' && data.cod != 200){
            alert(data.message);
            return;
        }

        fetch(weather_data_endpoint+`lon=${data.coord.lon}&lat=${data.coord.lat}`)
        .then((response)=>response.json())
        .then((data) => {
            console.log(data);
        });
        console.log(data.coord.lon,data.coord.lat)
    });
}