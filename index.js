const request = require('request'),
    fs = require('fs'),
    async = require('async'),
    _ = require('lodash');

module.exports = {
  filename: './data/brands.json',
  limitParallel: 4,

  initialize: function (next) {
    return next();
  },
  startCrawler: function (cb) {
    console.info('Starting crawler...');
    filename = this.filename;
    async.waterfall([getBrands.bind(this), populateBrands.bind(this)], function (err, results) {
      if (err) {
        console.error(err);
      } else {
        console.info('Salió todo bien!');
      }
      cb && cb(err, results);
    });
  },
  generateJSON : function (filename, cb) { // filename optional
    if (typeof filename === 'string') {
      this.filename = filename;
    } else if (typeof filename === 'function') {
      cb = filename;
    }
    console.info('Initializing whole process...');
    this.startCrawler(cb);
  }
};

function getBrands(cb) {
  var url = 'https://api.deautos.com/car/0/brands/1/';

  request(url, (error, response, body)=> {
    if (!error && response.statusCode === 200) {
      cb(null, JSON.parse(body));
    } else {
      console.log("Got an error: ", error, ", status code: ", response.statusCode);
      cb('No se pudo encontrar la respuesta');
    }
  })
}

var brandsInProgress = [];

function populateBrands(brands, cb) {
  console.info('Crawling brands...');
  brandsInProgress = brands;
  async.eachLimit(brandsInProgress, this.limitParallel, getModels.bind(this), function (err) {
    if (err) {
      cb(err);
    }
    cb(null, brandsInProgress);
  })
}

function getModels(brand, cb) {
  var url = 'https://api.deautos.com/car/0/brands/' + brand.id + '/models/1';
  request(url, (error, response, body)=> {
    if (!error && response.statusCode === 200) {
      brand.name = brand.description;
      delete brand.description;
      brand.models = _.map(JSON.parse(body), function (model) {
        model.name = model.description;
        delete model.description;
        delete model.sponsored;
        return model;
      });
      saveJSON(this.filename, brandsInProgress);
      cb();
    } else {
      console.log("Got an error: ", error, ", status code: ", response.statusCode);
      cb('No se pudo encontrar la respuesta');
    }
  })
}

function saveJSON(filepath, brands) {
  fs.writeFileSync(filepath, JSON.stringify(brands), 'utf-8');
};
