import { useEffect, useState } from "react";
import Icon from "react-icons-kit";
import { search } from "react-icons-kit/feather/search";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { getCityData } from "./store/slices/weatherSlice.js";

function App() {
  const [loadings, setLoadings] = useState(true);
  const [city, setCity] = useState("Mohali");
  const [unit, setUnit] = useState("metric");

  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(
      getCityData({
        city,
        unit,
      })
    ).then((res) => {
      console.log(res);
    });
  };

  useEffect(() => {
    fetchData();
  }, [])

  const handleCitySearch = (e) => {
    e.preventDefault();
    // setLoadings(true);
    // fetchData();
  };
  return (
    <Root>
      <form autoComplete="off" onSubmit={handleCitySearch}>
        <label>
          <Icon icon={search} size={20} />
        </label>
        <input
          type="text"
          className="city-input"
          placeholder="Enter City"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          // readOnly={!loadings}
        />
        <button type="submit">GO</button>
      </form>
    </Root>
  );
}

export default App;

const Root = styled.div`
  background: linear-gradient(to bottom, #2fa5ed, #b5d3f9, #ebeefb);
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  background-color: #ebeefb;
  width: 100%;
  height: 100vh;
  padding: 5px;
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
