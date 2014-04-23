var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  console.log(req.method + ' ' + req.url);
  res.end(req.method + ' ' + req.url);
}).listen(1339, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1339');
