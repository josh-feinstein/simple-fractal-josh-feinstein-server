const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const Papa = require('papaparse');
const axios = require('axios');

app.listen(PORT, () => console.log('Connected to port ' + PORT));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json'
  );
  next();
});

app.get('/:id', async (req, res, next) => {
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

  //Get current candidate
  let currentCandidate = scoreRecords.filter(
    candidate => candidate.candidate_id === id
  );
  //   res.send(currentCandidate);

  //Send null to frontend if incorrect ID is entered
  if (!currentCandidate.length) {
    res.send({ noUser: true });
  }

  //Set up variables with candidate data for later use
  let candidateID = currentCandidate[0].candidate_id;
  let candidateCommunicationScore = parseInt(
    currentCandidate[0].communication_score
  );
  let candidateCodingScore = parseInt(currentCandidate[0].coding_score);
  let candidateTitle = currentCandidate[0].title;
  let candidateCompanyID = currentCandidate[0].company_id;
  let candidateCompanyFractalIndex = companies.find(
    company => company.company_id === currentCandidate[0].company_id
  ).fractal_index;

  //GET SIMILAR COMPANIES (within 0.15 variance of Fractal Index)
  //Copy Company Data
  let allCompaniesArray = companies.slice();

  //Remove Companies outside 0.15 variance
  let similarCompanies = allCompaniesArray.filter(
    company =>
      Math.abs(company.fractal_index - candidateCompanyFractalIndex) < 0.15
  );

  //Create area with ID values for later use
  let similarCompaniesIDs = similarCompanies.map(company => company.company_id);

  //GET SIMILAR EMPLOYEES
  //Copy Employee Data
  let allEmployeesArray = scoreRecords.slice();

  //Remove Employees with different titles
  let similarEmployees = allEmployeesArray.filter(
    employee => candidateTitle === employee.title
  );

  //Remove Employees at non-similar companies
  let similarEmployeesAtSimilarCompanies = similarEmployees.filter(employee =>
    similarCompaniesIDs.includes(employee.company_id)
  );

  //CALCULATE COMMUNICATION SCORE PERCENTILE
  let relevantCommuncationScores = similarEmployeesAtSimilarCompanies
    .map(employee => parseInt(employee.communication_score))
    .sort(function(a, b) {
      return a - b;
    });

  let numberOfCommunicationScoreValues = relevantCommuncationScores.length;

  let candidateCommunicationScoreRank =
    relevantCommuncationScores.indexOf(candidateCommunicationScore) + 1;

  let numberOfCommunicationScoresBelowCandidate =
    candidateCommunicationScoreRank - 1;

  let communicationsPercentile = (
    (numberOfCommunicationScoresBelowCandidate /
      numberOfCommunicationScoreValues) *
    100
  ).toFixed(2);

  //CALCULATE CODING SCORE PERCENTILE
  let relevantCodingScores = similarEmployeesAtSimilarCompanies
    .map(employee => parseInt(employee.coding_score))
    .sort(function(a, b) {
      return a - b;
    });

  let numberOfCodingScoreValues = relevantCodingScores.length;

  let candidateCodingScoreRank =
    relevantCodingScores.indexOf(candidateCodingScore) + 1;

  let numberOfCodingScoresBelowCandidate = candidateCodingScoreRank - 1;

  let codingPercentile = (
    (numberOfCodingScoresBelowCandidate / numberOfCodingScoreValues) *
    100
  ).toFixed(2);

  res.send({
    communicationsPercentile,
    codingPercentile,
  });
});

// error handling endware
app.use((err, req, res, next) =>
  res.status(err.status || 500).send(err.message || 'Internal server error.')
);
