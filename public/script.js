// DOM Elements
const userLocation = document.getElementById("userLocation");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const feelslike = document.getElementById("feelslike");
const description = document.getElementById("description");
const city = document.getElementById("city");
const dateElement = document.getElementById("date");
const mapElement = document.getElementById("map");
const forecastContainer = document.getElementById("forecast");
const hourlyForecastContainer = document.getElementById("hourlyForecast");

// API Configuration
const apiKey = "564e80d44861fd35d80644350a721550";
const weatherApiEndpoint = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric&q=`;
const forecastApiEndpoint = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metric`;

// Map Variables
let map;
let marker;
let layerControl;

// Initialize Map with both weather layers
function initMap(lat = 51.505, lon = -0.09) {
    if (map) map.remove();
    
    // Create base map
    map = L.map('map').setView([lat, lon], 11);
    
    // Base map layer
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Weather layers
    const clouds = L.OWM.cloudsClassic({showLegend: true, opacity: 0.7, appId: apiKey});
    const precipitation = L.OWM.precipitationClassic({showLegend: true, opacity: 0.7, appId: apiKey});
    const temp = L.OWM.temperature({showLegend: true, opacity: 0.4, appId: apiKey});
    const pressure = L.OWM.pressure({showLegend: true, opacity: 0.5, appId: apiKey});
    var wind = L.OWM.wind({showLegend: true, opacity: 0.8, appId: apiKey});
    
    // Layer control
    const baseMaps = {
        "OpenStreetMap": osm
    };
    
    const overlayMaps = {
        "Cloud Cover": clouds,
        "Precipitation": precipitation,
        "Temperature": temp,
        "Pressure": pressure,
        "Wind Speed": wind
    };
    
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
    
    // Add or update marker
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map);
}

// Main Weather Function
function findUserLocation() {
    const location = userLocation.value.trim();
    if (!location) return;
    
    // Fetch current weather
    fetch(weatherApiEndpoint + location)
    .then(response => response.json())
    .then(data => {
        if (data.cod && data.cod !== 200) {
            alert(data.message);
            return;
        }
        
        // Update current weather display
        updateCurrentWeather(data);
        
        // Update map
        initMap(data.coord.lat, data.coord.lon);
        
        // Fetch forecast data
        fetch(`${forecastApiEndpoint}&lat=${data.coord.lat}&lon=${data.coord.lon}`)
        .then(response => response.json())
        .then(forecastData => {
            updateHourlyForecast(forecastData);
            updateDailyForecast(forecastData);
        })
        .catch(error => {
            console.error("Error fetching forecast:", error);
        });
    })
    .catch(error => {
        console.error("Error fetching location:", error);
        alert("Location not found. Please try again.");
    });
}

// Update Current Weather Display
function updateCurrentWeather(data) {
    city.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    feelslike.textContent = `${Math.round(data.main.feels_like)}°C`;
    description.textContent = data.weather[0].description;
    
    // Update date
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Update weather details
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("wind").textContent = `${data.wind.speed} m/s`;
    document.getElementById("clouds").textContent = `${data.clouds.all}%`;
    document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
}

// Update Hourly Forecast
function updateHourlyForecast(data) {
    hourlyForecastContainer.innerHTML = "";
    
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    
    // Filter for the next 12 hours (4 periods of 3 hours each)
    const hourlyData = data.list.filter(item => {
        const forecastTime = new Date(item.dt * 1000);
        const hoursDiff = (forecastTime - now) / (1000 * 60 * 60);
        return hoursDiff >= 0 && hoursDiff <= 12;
    }).slice(0, 4); // Show next 4 periods (12 hours)
    
    // If we don't have enough future data, show whatever we have
    if (hourlyData.length === 0 && data.list.length > 0) {
        hourlyData.push(data.list[0]);
    }
    
    hourlyData.forEach(item => {
        const forecastTime = new Date(item.dt * 1000);
        const time = forecastTime.toLocaleTimeString([], { hour: '2-digit' });
        const temp = Math.round(item.main.temp);
        
        const card = document.createElement("div");
        card.className = "hourly-card";
        card.innerHTML = `
            <div class="hourly-time">${time}</div>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                 alt="${item.weather[0].description}">
            <div class="hourly-temp">${temp}°</div>
        `;
        hourlyForecastContainer.appendChild(card);
    });
}

// Update Daily Forecast
function updateDailyForecast(data) {
    forecastContainer.innerHTML = "";
    
    // Group forecasts by day
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        } else {
            // Update min/max temps if this period has more extreme values
            if (item.main.temp_min < dailyForecasts[date].main.temp_min) {
                dailyForecasts[date].main.temp_min = item.main.temp_min;
            }
            if (item.main.temp_max > dailyForecasts[date].main.temp_max) {
                dailyForecasts[date].main.temp_max = item.main.temp_max;
            }
        }
    });
    
    // Get next 5 days (excluding today)
    const forecastDates = Object.keys(dailyForecasts).slice(1, 6);
    
    forecastDates.forEach(date => {
        const forecast = dailyForecasts[date];
        const dayName = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" 
                 alt="${forecast.weather[0].description}">
            <div>${forecast.weather[0].main}</div>
            <div class="forecast-temp">
                <div class="temp-container">
                    <div class="temp-label">max</div>
                    <div class="temp-value">${forecast.main.temp_max.toFixed(0)}°</div>
                </div>
                <div class="temp-container">
                    <div class="temp-label">min</div>
                    <div class="temp-value">${forecast.main.temp_min.toFixed(0)}°</div>
                </div>
            </div>
        `;
        forecastContainer.appendChild(card);
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    userLocation.value = "Port of Spain";
    findUserLocation();
    
    // Add event listener for Enter key
    userLocation.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            findUserLocation();
        }
    });
});