var Trader = (function () {
  var socket;

  function init(endpoint) {
    return new Promise(function (resolve, reject) {
      // Open a connection
      socket = new WebSocket(endpoint);

      socket.onopen = () => {
        resolve();
        console.log("Opened connection");
      };

      // A connection could not be made
      socket.onerror = (event) => {
        console.log(event);
        reject(err);
      };

      // A connection was closed
      socket.onclose = (code, reason) => {
        console.log(code, reason);
      };

      // Close the connection when the window is closed
      window.addEventListener("beforeunload", function () {
        socket.close();
      });
    });
  }

  function send(method, params, id) {
    return new Promise(function (resolve, reject) {
      // When data is received
      socket.onmessage = (event) => {
        let response = JSON.parse(event.data);
        resolve(response);
      };

      // send data to the server
      var json = JSON.stringify({
        method: method,
        params: params,
        id: id,
      });

      socket.send(json);
    });
  }

  async function getSymbols() {
    let response = await send("getSymbols", {}, "getSymbols");
    return response.result;
  }

  async function subscribeOrderbook(symbol) {
    let response = await send("subscribeOrderbook",{ symbol: symbol },"Subscribed to " + symbol);
    console.log(response);
    return response.result;
  }

  async function watch(symbols) {
    for (let symbol of await getSymbols()) {
      if (symbols.includes(symbol.id)) {
        console.log(symbol.id);
        let response = await subscribeOrderbook(symbol.id);
        console.log(response);
        console.log("Subscribed to " + symbol.id);
      }
    }
    
    console.log('subscribed 1');
  }

  return {
    init: init,
    getSymbols: getSymbols,
    watch: watch,
  };
})();

(async () => {
  var pairs = ['BTCDAI','ETHDAI','USDDAI'];

  try {
    await Trader.init("wss://api.hitbtc.com/api/2/ws");
    await Trader.watch(pairs);
    console.log('subscribed 2');
  } catch (error) {
    console.log("Error: ", error);
  }
})();
