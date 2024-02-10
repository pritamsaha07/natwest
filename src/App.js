import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = '18985a7a605dea7423d6444d0594fef1';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const MAX_DAYS = 7;

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [temperatureUnit, setTemperatureUnit] = useState('°C');
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('recentSearches')) {
      setRecentSearches(JSON.parse(localStorage.getItem('recentSearches')));
    }
  }, []);

  const handleSearch = () => {
    fetch(`${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${unit}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('City not found');
        }
        return response.json();
      })
      .then(data => {
        setWeatherData(data);
        updateRecentSearches(data.name);
        fetchForecast(data.coord.lat, data.coord.lon);
      
        setError(null);
      })
      .catch(error => {
        setError(error.message);
        setWeatherData(null);
      });
     
  };

  const fetchForecast = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=${MAX_DAYS}&appid=${API_KEY}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Forecast data not available');
        }
        return response.json();
      })
      .then(data => {
        console.log('Forecast data:', data); // Log the response data
        setWeatherData(prevState => ({
          ...prevState,
          forecast: data.daily
        }));
      })
      .catch(error => {
        console.error('Error fetching forecast:', error); // Log the error
        setError(error.message);
        setWeatherData(prevState => ({
          ...prevState,
          forecast: null
        }));
      });
  };
  

  const updateRecentSearches = cityName => {
    const updatedSearches = [cityName, ...recentSearches.slice(0, 4)];
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleUnitChange = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
    setTemperatureUnit(unit === 'metric' ? '°F' : '°C');
  };

  const convertTemperature = temp => {
    if (temperatureUnit === '°C') {
      return ((temp - 32) * 5) / 9;
    } else {
      return (temp * 9) / 5 + 32;
    }
  };

  const dropdown = () => {
    setTimeout(() => {
      setShowRecentSearches(false);
    }, 1500);
  };

  return (
    <div className="App">
      <header>
        <h1>Weather App</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={e => setCity(e.target.value)}
            onMouseEnter={() => setShowRecentSearches(true)}
            onMouseLeave={() => dropdown()}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={handleUnitChange} style={{ marginLeft: '5px' }}>Switch Units</button>

          {showRecentSearches && (
            <div className="recent-searches-dropdown">
              {recentSearches.map((search, index) => (
                <div key={index} onClick={() => setCity(search)}>
                  {search}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
      <main>
        {error && <div className="error">{error}</div>}
        {weatherData && (
          <div className="weather-info">
            <h2>{weatherData.name}</h2>
            <p>
              Temperature: {convertTemperature(weatherData.main.temp).toFixed(2)} {temperatureUnit}
            </p>
            <p>Weather: {weatherData.weather[0].main}</p>
            <p>Wind Speed: {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
            {weatherData.forecast && (
              <div>
                <h3>7-Day Forecast</h3>
                <ul>
                  {weatherData.forecast.map((day, index) => (
                    <li key={index}>
                      {new Date(day.dt * 1000).toLocaleDateString()}: {day.weather[0].main}, {convertTemperature(day.temp.day).toFixed(2)} {temperatureUnit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
