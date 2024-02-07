// Import dotenv and configure it to load environment variables
require('dotenv').config();

// Define variables for DOM elements
const cityInput = document.getElementById('city-input');
const citySearchForm = document.getElementById('city-search-form');
const searchHistory = document.getElementById('search-history');
const weatherDisplay = document.getElementById('weather-display');
const forecastDisplay = document.getElementById('forecast');

// Event listener for search form submission
citySearchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const cityName = cityInput.value.trim();
    if (cityName !== '') {
        await getWeatherData(cityName); // Await the asynchronous function
        cityInput.value = ''; // Clear input field after searching for city
    }
});

// Function to fetch weather data from OpenWeatherMap API
async function getWeatherData(cityName) {
    const apiKey = process.env.API_KEY; // Access API key from environment variables
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            displayWeatherData(data);
            saveToLocalStorage(cityName);
        } else {
            throw new Error('You must be imagining things. This place does not exist!');
        }
    } catch (error) {
        console.error('I borked fetching weather data:', error);
    }
}

// Function to display weather data
function displayWeatherData(data) {
    // Display current weather
    const currentWeather = data.list[0];
    const currentWeatherHTML = `
        <h2>${data.city.name}</h2>
        <p>Date: ${currentWeather.dt_txt}</p>
        <p>Temperature: ${currentWeather.main.temp}°C</p>
        <p>Humidity: ${currentWeather.main.humidity}%</p>
        <p>Wind Speed: ${currentWeather.wind.speed} m/s</p>
    `;
    weatherDisplay.innerHTML = currentWeatherHTML;

    // Display 5-day forecast
    const forecastHTML = data.list
        .filter((item, index) => index % 8 === 0) // Select every 8th element for daily forecast
        .map(day => `
            <div class="forecast-card">
                <h3>${day.dt_txt}</h3>
                <p>Temperature: ${day.main.temp}°C</p>
                <p>Humidity: ${day.main.humidity}%</p>
                <p>Wind Speed: ${day.wind.speed} m/s</p>
            </div>
        `)
        .join('');
    forecastDisplay.innerHTML = forecastHTML;
}

// Function to save searched city to local storage
function saveToLocalStorage(cityName) {
    let cities = JSON.parse(localStorage.getItem('cities')) || [];
    cities.push(cityName);
    localStorage.setItem('cities', JSON.stringify(cities));
    renderSearchHistory();
}

// Function to render search history
function renderSearchHistory() {
    searchHistory.innerHTML = '';
    const cities = JSON.parse(localStorage.getItem('cities')) || [];
    cities.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.addEventListener('click', function() {
            getWeatherData(city);
        });
        searchHistory.appendChild(button);
    });
}

// On page load, render search history if available
window.addEventListener('load', renderSearchHistory);
