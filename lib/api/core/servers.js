var
// For create the http server
  http = require('http');


module.exports = {

  initAll: function (kuzzle, params) {
    var server = runHttpServer(kuzzle, params);
    runWebsocketServer(server, kuzzle, params);
    runMQListener(kuzzle, params);
  }

};

/**
 * Run a HTTP server on a specific port and will use the router object for handle request
 * @param kuzzle
 * @param params
 * @returns server
 */
function runHttpServer (kuzzle, params) {

  var port = params.port || process.env.KUZZLE_PORT || 80;

  kuzzle.log.info('Starting: HTTP server on port', port);

  kuzzle.router.initRouterHttp();

  var server = http.createServer(function (request, response) {
    kuzzle.router.routeHttp(request, response);
  });

  server.listen(port);

  return server;
}

/**
 * Run a websocket server that listen the main room entrypoint for handle write
 * and the room subscribe for handle user room subscription
 * @param server
 * @param kuzzle
 * @param params
 */
function runWebsocketServer (server, kuzzle, params) {

  kuzzle.io = require('socket.io')(server);

  kuzzle.io.set('origins', '*:*');

  kuzzle.log.info('Starting: WebSocket server');
  kuzzle.io.on('connection', function (socket) {
    kuzzle.router.routeWebsocket(socket);
  });
}

/**
 * Listen to RabbitMQ topics to handle write/subscribe/read messages send via
 * STOMP/AMQP/MQTT protocols
 * @param kuzzle
 * @param params
 */
function runMQListener (kuzzle, params) {

  kuzzle.log.info('Starting: MQ listener');
  kuzzle.router.routeMQListener();

}