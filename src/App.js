import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { getCityData, get5DaysForecast } from "./store/slices/weatherSlice.js";
import { MdDelete } from "react-icons/md";
import { FaArrowUp } from "react-icons/fa6";
import { FaArrowDown } from "react-icons/fa6";
import { FiDroplet } from "react-icons/fi";
import { FaWind } from "react-icons/fa";
import { CiWavePulse1 } from "react-icons/ci";
import { SphereSpinner } from "react-spinners-kit";

function App() {
  const [citiesData, setCitiesData] = useState([]);
  const [newCity, setNewCity] = useState("");
  const unit = "metric";
  const [selectedCity, setSelectedCity] = useState(null);

  const {
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
  } = useSelector((state) => state.weather);

  const [loadings, setLoadings] = useState(true);

  const allLoadings = [citySearchLoading, forecastLoading];
  useEffect(() => {
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  const dispatch = useDispatch();

  const fetchData = (city) => {
    dispatch(
      getCityData({
        city,
        unit,
      })
    ).then((res) => {
      console.log(res);
      if (!res.payload.error) {
        const { coord, main, weather } = res.payload.data;
        const cityData = {
          name: city,
          lat: coord.lat,
          lon: coord.lon,
          temp: main.temp,
          description: weather[0].description,
          icon: weather[0].icon,
        };
        setCitiesData((prevCitiesData) => [...prevCitiesData, cityData]);
      }
    });
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    if (newCity.trim() !== "") {
      if (citiesData.length < 6) {
        fetchData(newCity);
        setNewCity("");
      } else {
        alert("You can only add up to 6 cities.");
      }
    }
  };
  const handleRemoveCity = (name) => {
    setCitiesData((prevCitiesData) =>
      prevCitiesData.filter((city) => city.name !== name)
    );
  };

  const handleCityCardClick = (city) => {
    setSelectedCity(city); // Set the selected city when a card is clicked
  };

  const handleClosePopup = () => {
    setSelectedCity(null); // Reset the selected city when the popup is closed
  };

  const fetchCityDataForPopup = () => {
    // Fetch additional data for the selected city
    dispatch(
      getCityData({
        city: selectedCity.name,
        unit,
      })
    ).then((res) => {
      console.log(res);
      if (!res.payload.error) {
        const { coord } = res.payload.data;
        // Fetch 5 days forecast data for the selected city
        dispatch(
          get5DaysForecast({
            lat: coord.lat,
            lon: coord.lon,
            unit,
          })
        ).then((res) => {
          console.log(res);
        });
      }
    });
  };

  useEffect(() => {
    if (selectedCity) {
      fetchCityDataForPopup();
    }
  }, [selectedCity]);

  const filterForecastByFirstObjTime = (forecastData) => {
    if (!forecastData) {
      return [];
    }

    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

  return (
    <Root>
      <form autoComplete="off" onSubmit={handleAddCity}>
        <label>
          <CiSearch size={20} />
        </label>
        <input
          type="text"
          className="city-input"
          placeholder="Enter City"
          required
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          readOnly={loadings}
        />
        <button type="submit">GO</button>
      </form>
      <CitiesContainer>
        {citiesData.map((cityData, index) => (
          <CityCard key={index} onClick={() => handleCityCardClick(cityData)}>
            <DeleteButton onClick={() => handleRemoveCity(cityData.name)}>
              <MdDelete size={20} />
            </DeleteButton>
            <h2>{cityData.name}</h2>
            <p>Temperature: {cityData.temp}°C</p>
            <p>Weather: {cityData.description}</p>
            <img
              src={`http://openweathermap.org/img/wn/${cityData.icon}.png`}
              alt="Weather icon"
            />
          </CityCard>
        ))}
      </CitiesContainer>
      {selectedCity && (
        <Popup>
          <PopupContent>
            <div className="current-weather-details-box">
              {loadings ? (
                <div className="loader">
                  <SphereSpinner
                    loadings={loadings}
                    color="#2fa5ed"
                    size={20}
                  />
                </div>
              ) : (
                <>
                  {citySearchData && citySearchData.error ? (
                    <div className="error-msg">{citySearchData.error}</div>
                  ) : (
                    <>
                      {forecastError ? (
                        <div className="error-msg">{forecastError}</div>
                      ) : (
                        <>
                          {citySearchData && citySearchData.data ? (
                            <div className="weather-details-container">
                              {/* details */}
                              <div className="details">
                                <h4 style={{ color: "#2fa5ed" }}>
                                  {citySearchData.data.name}
                                </h4>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <img
                                    src={`https://openweathermap.org/img/wn/${citySearchData.data.weather[0].icon}@2x.png`}
                                    alt="icon"
                                  />
                                  <h1
                                    style={{
                                      color: "#2fa5ed",
                                      fontSize: "56px",
                                    }}
                                  >
                                    {citySearchData.data.main.temp}&deg;
                                  </h1>
                                </div>

                                <h4 className="description">
                                  {citySearchData.data.weather[0].description}
                                </h4>
                              </div>

                              {/* metrices */}
                              <div className="metrices">
                                {/* feels like */}
                                <h4>
                                  Feels like{" "}
                                  {citySearchData.data.main.feels_like}
                                  &deg;C
                                </h4>

                                {/* min max temp */}
                                <div className="key-value-box">
                                  <div className="key">
                                    <FaArrowUp size={20} />
                                    <span className="value">
                                      {citySearchData.data.main.temp_max}
                                      &deg;C
                                    </span>
                                  </div>
                                  <div className="key">
                                    <FaArrowDown size={20} />
                                    <span className="value">
                                      {citySearchData.data.main.temp_min}
                                      &deg;C
                                    </span>
                                  </div>
                                </div>

                                {/* humidity */}
                                <div className="key-value-box">
                                  <div className="key">
                                    <FiDroplet size={20} />
                                    <span>Humidity</span>
                                  </div>
                                  <div className="value">
                                    <span>
                                      {citySearchData.data.main.humidity}%
                                    </span>
                                  </div>
                                </div>

                                {/* wind */}
                                <div className="key-value-box">
                                  <div className="key">
                                    <FaWind size={20} />

                                    <span>Wind</span>
                                  </div>
                                  <div className="value">
                                    <span>
                                      {citySearchData.data.wind.speed}kph
                                    </span>
                                  </div>
                                </div>

                                {/* pressure */}
                                <div className="key-value-box">
                                  <div className="key">
                                    <CiWavePulse1 size={20} />
                                    <span>Pressure</span>
                                  </div>
                                  <div className="value">
                                    <span>
                                      {citySearchData.data.main.pressure}
                                      hPa
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="error-msg">No Data Found</div>
                          )}
                          {/* extended forecastData */}
                          <h4 className="extended-forecast-heading">
                            Extended Forecast
                          </h4>
                          {filteredForecast.length > 0 ? (
                            <div className="extended-forecasts-container">
                              {filteredForecast.map((data, index) => {
                                const date = new Date(data.dt_txt);
                                const day = date.toLocaleDateString("en-US", {
                                  weekday: "short",
                                });
                                return (
                                  <div className="forecast-box" key={index}>
                                    <h5>{day}</h5>
                                    <img
                                      src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                                      alt="icon"
                                    />
                                    <h5>{data.weather[0].description}</h5>
                                    <h5 className="min-max-temp">
                                      {data.main.temp_max}&deg; /{" "}
                                      {data.main.temp_min}&deg;
                                    </h5>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="error-msg">No Data Found</div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </PopupContent>
          <CloseButton onClick={handleClosePopup}>Close</CloseButton>
        </Popup>
      )}
    </Root>
  );
}

export default App;

const Root = styled.div`
  width: 100%;
  height: 100%;
  form {
    margin-left: auto;
    margin-right: auto;
    width: 50%;
    background-color: #fff;
    border-radius: 4px;
    height: 31px;
    display: flex;
    align-items: center;
  }
  form label {
    height: 100%;
    margin-left: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #2fa5ed;
  }

  form .city-input {
    width: 100%;
    outline: none;
    border: none;
    text-indent: 15px;
  }

  form button {
    height: 100%;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border: none;
    outline: none;
    background-color: #fff;
    color: #2fa5ed;
    width: 75px;
    cursor: pointer;
  }
`;

const CitiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const CityCard = styled.div`
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: 10px;
  padding: 20px;
  max-width: 300px;
  width: 100%;
  text-align: center;

  h2 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  p {
    margin: 5px 0;
  }

  img {
    width: 50px;
    height: 50px;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: red;

  &:hover {
    color: darkred;
  }
`;

const Popup = styled.div`
  width: 60%;
  position: fixed;
  padding: 5px;
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Centering trick */
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 4px;
  height: max-content;
  @media (max-width: 768px) {
    top: 50%;
    transform: translate(-50%, -50%);
    height: 80%; /* Adjust height as needed */
    overflow-y: auto;
  }
`;

const PopupContent = styled.div`
  /* loader */
  .loader {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
  }

  /* error */
  .error-msg {
    width: 100%;
    background-color: #f8d7da;
    font-size: 12px;
    color: #721c24;
    border-color: #f5c6cb;
    padding: 0.75rem 1.25rem;
    margin-top: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
  }

  /* weather details container */
  .current-weather-details-box .weather-details-container {
    width: 100%;
    display: flex;
  }

  /* details and merices */
  .weather-details-container .details,
  .weather-details-container .metrices {
    flex: 1;
  }

  .weather-details-container .details {
    border-right: 1px solid #a09aa0;
  }

  .weather-details-container .metrices {
    padding-left: 15px;
  }

  @media (max-width: 768px) {
    .current-weather-details-box .weather-details-container {
      flex-direction: column;
    }

    .weather-details-container .details,
    .weather-details-container .metrices {
      width: 100%;
    }

    .weather-details-container .details {
      border-right: none;
      border-bottom: 1px solid #a09aa0;
      padding-bottom: 15px;
    }

    .weather-details-container .metrices {
      padding-left: 0;
      padding-top: 15px;
    }
  }

  /* details children */

  .weather-details-container .details .description {
    color: #a09aa0;
  }

  /* metrices children */
  .weather-details-container .metrices h4 {
    color: #2fa5ed;
    margin-left: 4px;
    margin-bottom: 25px;
  }

  /* key value box */
  .weather-details-container .metrices .key-value-box {
    width: 100%;
    display: flex;
    margin-top: 15px;
  }

  .key-value-box .key,
  .key-value-box .value {
    flex: 1;
  }

  .key .icon {
    color: #a09aa0;
  }

  .key .value {
    color: #2fa5ed;
  }

  .key span {
    color: #a09aa0;
    margin-left: 15px;
  }

  .value span {
    color: #2fa5ed;
  }

  .extended-forecast-heading {
    color: #a09aa0;
    margin-top: 25px;
  }

  .extended-forecasts-container {
    margin-top: 15px;
    display: flex;
  }

  .extended-forecasts-container .forecast-box {
    width: calc(20% - 10px);
    height: 150px;
    border-radius: 4px;
    background-color: #2fa5ed;
    color: #fff;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h5 {
      padding: 0;
      margin: 5px 0;
    }
  }

  @media (max-width: 768px) {
    .extended-forecasts-container {
      flex-direction: column;
    }

    .extended-forecasts-container .forecast-box {
      width: 90%;
      margin-right: 0;
      margin-bottom: 10px;
    }
  }

  .forecast-box .min-max-temp {
    margin-top: 5px;
    font-weight: 500;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #2fa5ed;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #2578a5;
  }
`;
