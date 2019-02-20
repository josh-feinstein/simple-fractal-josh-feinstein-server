const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const server = app.listen(PORT, () => console.log('Connected to port ' + PORT));

app.get('/test', (req, res, next) => {
  res.json({ test: 123 });
});
