var async = require('async'),
    fs = require('fs');

function populateFile(filename, cb) {
  var data = fs.readFileSync(filename, 'utf-8');
  createBrands(JSON.parse(data), cb);
}

function populateArray(brands, cb) {
  createBrands(brands, cb);
}

function createBrands(brands, callback) {
  console.info('Creating Brands...');
  async.every(brands, function(brand, cb) {
    createBrand(brand, function (err, record) {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  }, function (err) {
    if (err) {
      return callback && callback(err);
    }
    console.info('All brands created!');
    callback && callback(null);
  });
}

function createBrand(brand, cb) {
  console.info('Creating Brand...');
  formatElement(brand);
  var models = brand.models;
  delete brand.models;
  CarBrand.create(brand, function (err, record) {
    if (err) {
      console.error('Brand not created');
      return cb(err);;
    }
    console.info('Brand created');
    addModels(record, models, function () {
      cb(null, record);
    });

  });
}

function createModel(model, cb) {
  console.info('Creating Model...');
  formatElement(model);
  CarModel.create(model, function (err, record) {
    if (err) {
      console.error('Model not created');
      return cb(err);
    }
    console.info('Model created');
    cb(null, record);
  });
}

function addModels(brand, models, callback) {
  console.info('Adding Models...');
  async.each(models, function(model, cb) {
    createModel(model, function (err, record) {
      if (err) {
        return cb(err);
      }
      brand.models.add(record.id);
      cb(null);
    });
  }, function (err) {
    console.info('Models added to Brand!');
    brand.save();
    if (err) {
      console.error('Some Models couldnt be created or added');
      return callback(err);
    }
    console.info('All models processed successfully');
    callback(null);
  });
}

function formatElement(element) {
  delete element.id;
  if (element.synonimous !== undefined) {
    element.alias = element.alias;
    delete element.synonimous;
  }
  return element;
}

module.exports = {
  populate: function (param, cb) {
    console.info('Populating JSON Data...');
    switch (typeof param) {
      case 'string':
        populateFile(param, cb);
      break;
      case 'object':
        populateArray(param, cb);
      break;
      default:
        cb('Invalid param type. Should be filepath or array');
      break;
    }
  }
}
