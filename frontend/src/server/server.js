const express = require('express');
const path = require('path');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const app = express();

// Set the view engine to handlebars
app.engine('handlebars', require('express-handlebars')());
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  const App = require('./src/App').default;
  const appString = ReactDOMServer.renderToString(React.createElement(App));
  
  res.render('index', { appString });
});

// Serve static files
app.use(express.static(path.resolve(__dirname, 'build')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
