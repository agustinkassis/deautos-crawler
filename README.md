# deautos-crawler
Crawler de marcas y modelos de DeAutos

## Install
```
npm install deautos-crawler
```

## Usage
```javascript
const crawler = require('deautos-crawler');

cont filename = './data/results.json';

crawler.generateJSON(filename, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.info('Results saved on filename provided!');
  }
});
```
