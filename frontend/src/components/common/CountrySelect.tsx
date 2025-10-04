import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import axios from "axios";
import React, {useEffect, useState} from "react";

interface Country
{
  name: {common: string};
  currencies?: {[key: string]: {name: string; symbol: string}};
}

interface CountrySelectProps
{
  value: string;
  onChange: (event: SelectChangeEvent) => void;
  label?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  label = "Country"
}) =>
{
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    axios.get("https://restcountries.com/v3.1/all?fields=name,currencies")
    .then((response) =>
    {
      setCountries(response.data);
      setLoading(false);
    })
    .catch((error) =>
    {
      console.error("Error fetching countries:", error);
      setLoading(false);
    });
  }, []);

  if(loading) return <div>Loading countries...</div>;

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={onChange} label={label}>
        {countries
        .filter(country => country.currencies) // Only countries with currencies
        .sort((a, b) => a.name.common.localeCompare(b.name.common))
        .map((country) =>
        {
          const currencyCode = Object.keys(country.currencies || {})[0];
          const currencyName = country.currencies?.[currencyCode]?.name || "";
          return (
            <MenuItem key={country.name.common} value={country.name.common}>
              {country.name.common} ({currencyCode} - {currencyName})
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default CountrySelect;
