import React, { useEffect, useState } from 'react'
import "./App.css"
import { FormControl, Select, MenuItem, Card, CardContent } from "@material-ui/core"
import InfoBox from './Components/InfoBox'
import Map from './Components/Map'
import Table from "./Components/Table"
import { prettyPrintStat, sortData } from "./util"
import LineGraph from "./Components/LineGraph"
import "leaflet/dist/leaflet.css"


function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("worldwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [casesType, setCaseType] = useState("cases")
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4798 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, SetMapCountries] = useState([])


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then((data) => {
        setCountryInfo(data)
      })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }
          ))
          const sortedData = sortData(data);
          setTableData(sortedData)
          setCountries(countries)
          SetMapCountries(data)
        })
    }

    getCountriesData()
  }, [countries])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode)
    const url = countryCode === "wolrdwide" ? "https://disease.sh/v3/covid-19/all" :
      `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data)

        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)
      })
  }


  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Analyse COVID 19</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">World Wide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>

                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox isRed
            active={casesType === "cases"}
            onClick={e => setCaseType("cases")} title="Corona Virus Cases" total={countryInfo?.cases} cases={prettyPrintStat(countryInfo?.todayCases)} />
          <InfoBox active={casesType === "recovered"}
            onClick={e => setCaseType("recovered")} title="Recovered" total={countryInfo?.recovered} cases={countryInfo?.todayRecovered} />
          <InfoBox title="Death" active={casesType === "deaths"}
            onClick={e => setCaseType("deaths")} total={countryInfo?.deaths} cases={countryInfo?.todayDeaths} />
        </div>
        <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          casesType={casesType}
        />
      </div>
      <div className="app__right">
        <Card>
          <CardContent>
            <h3>Live Case by country</h3>
            <Table countries={tableData} />
            <h3>World Wide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

export default App

