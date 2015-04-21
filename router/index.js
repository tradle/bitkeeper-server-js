'use strict';

module.exports = function(app) {
  app.use('/', require('./routes/main'));
  app.use('/ping', require('./routes/ping'));
  app.use('/clear', require('./routes/clear'));
}
