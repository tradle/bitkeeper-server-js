'use strict'

module.exports = function (app) {
  app.use('/', require('./routes/store'))
}
