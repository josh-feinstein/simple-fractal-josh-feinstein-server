const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const Papa = require('papaparse');
const axios = require('axios');

app.listen(PORT, () => console.log('Connected to port ' + PORT));

app.get('/', async (req, res, next) => {
  const id = req.params.id;

  let scoreRecords;
  let companies;

  //Retrieve and parse score records
  try {
    const { data } = await axios.get(
      'https://s3.amazonaws.com/simple-fractal-recruiting/score-records.csv'
    );

    Papa.parse(data, {
      header: true,
      download: false,
      complete: function(results) {
        scoreRecords = results.data;
      },
    });
    res.send(data2);
  } catch (error) {
    console.error(error);
  }

  //Retrieve and parse companies
  try {
    const { data } = await axios.get(
      'https://s3.amazonaws.com/simple-fractal-recruiting/companies.csv'
    );

    Papa.parse(data, {
      header: true,
      download: false,
      complete: function(results) {
        companies = results.data;
      },
    });
  } catch (error) {
    console.error(error);
  }

  res.send({ scoreRecords, companies });
});
