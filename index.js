const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const Papa = require('papaparse');

app.listen(PORT, () => console.log('Connected to port ' + PORT));

app.get('/', (req, res, next) => {
  const id = req.params.id;

  Papa.parse(
    'https://s3.amazonaws.com/simple-fractal-recruiting/score-records.csv',
    {
      header: true,
      download: true,
      complete: function(results) {
        res.send(results);
      },
    }
  );

  //   Papa.parse('https://s3.amazonaws.com/simple-fractal-recruiting/companies.csv', {
  //     header: true,
  //     download: true,
  //     complete: this.updateCompaniesData,
  //   });
});
