var httpProxy = require('http-proxy');
var http = require('http');


var aria2Options = {
	target: {host:"127.0.0.1",port:6800} 
}

var proxy = httpProxy.createServer(aria2Options);


var proxyServer = http.createServer(function (req, res) {
  //
  // On each request, get the first location from the list...
  //
  var url = req.url;
  if(url.indexOf("/jsonrpc")===0){
  	//console.log('req: ', req.url,"proxy");
  	proxy.web(req, res, {target:"http://127.0.0.1:6800","changeOrigin":true});
  	return;
  }
  var target = { target: 'http://127.0.0.1:8899',"changeOrigin": true };
  //
  // ...then proxy to the server whose 'turn' it is...
  //
  //console.log('req: ', req.url);
  proxy.web(req, res, target);

}).listen(8080);

proxyServer.on('upgrade', function (req, socket, head) {
	//console.info("upgrade")
  proxy.ws(req, socket, head);
});

