mau.createDeck = {};
mau.createDeck.generateRandomKey = function(){
  var buf = new Uint32Array(100);
  window.crypto.getRandomValues(buf);
  var string = "";
  for(var i = 0; i<100; i++){
    string = string + buf[i];
  }
  return(CryptoJS.SHA3(string, { outputLength: 512 }).toString());
}
