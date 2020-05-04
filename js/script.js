
var Trader = (function () {
    
    var socket;

    function init(endpoint) {

    return new Promise(function(resolve, reject) {
        // Open a connection
        socket =   new WebSocket(endpoint);

        socket.onopen = () => {
            resolve();
            console.log('Opened connection');
        }
        
        // A connection could not be made
        socket.onerror = (event) => {
            console.log(event);
            reject(err);
        }
        
        // A connection was closed
        socket.onclose = (code, reason) => {
            console.log(code, reason);
        }
        
        // Close the connection when the window is closed
        window.addEventListener('beforeunload', function() {
            socket.close();
        });

    });

    }

    
    function send( method,params,id ) {

        return new Promise(function(resolve, reject) {

        // When data is received
        socket.onmessage = (event) => {

            console.log(event.data);
            let response=JSON.parse(event.data); 
            resolve(response);        

        }
        
        // send data to the server
        var json = JSON.stringify({
            "method": method,
            "params": params,
            "id": id
        });

        socket.send(json);

        });
    }


    async function getSymbols(){

        let response=await send('getSymbols',{},'getSymbols');
        return response.result;

    }

    async function subscribeOrderbook(symbol){

        let response=await send('subscribeOrderbook',{"symbol":symbol},'Subscribed to '+symbol);
        return response.result;

    }

    async function watch(pairs){
        
        Object.entries(await getSymbols()).forEach(async ([key, val]) => {

            if(pairs.includes(val.baseCurrency) || pairs.includes(val.quoteCurrency)){
                console.log(await subscribeOrderbook(val.id));
                console.log('Subscribed to '+val.id);
            }
            
          });

    }


    return {
        init:init,
        getSymbols:getSymbols,
        watch:watch
    };

})();


(async () => {

var pairs=['DAI'];

    try {

        await Trader.init('wss://api.hitbtc.com/api/2/ws');
        await Trader.watch(pairs);

    } catch (error) {
        console.log("ooops ", error)
    }

})();


