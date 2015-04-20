mau.createDeck = {};
mau.createDeck.singleKey = "";
mau.createDeck.keyArray = [];

mau.createDeck.makeAndSend = function(){
  mau.createDeck.singleKey = mau.createDeck.generateRandomKey();
  var deck = mau.createDeck.generateDeck();
  deck = mau.createDeck.encryptAllCards(mau.createDeck.singleKey, deck);
  deck = mau.createDeck.suffel(deck);
  var message = JSON.stringify({
    id:"suffel-Deck",
    message:btoa(JSON.stringify(deck)),
    sender:mau.id,
    originalSender:mau.id,
    allreadySuffeld:[mau.id]
  });
  mau.dataChannels[mau.dataChannelNames[0]].send(message);
}

mau.messageRouter.registerKey("suffel-Deck", function(message){
  mau.createDeck.singleKey = mau.createDeck.generateRandomKey();
  var deck = JSON.parse(atob(message.message));
  deck = mau.createDeck.encryptAllCards(mau.createDeck.singleKey, deck);
  deck = mau.createDeck.suffel(deck);
  message.allreadySuffeld.push(mau.id);
  var sent = false;
  for(var i = 0; i<mau.dataChannelNameMap.length; i++){
    if(!sent && message.allreadySuffeld.indexOf(mau.dataChannelNameMap[i]) === -1){
      sent = true;
      var message = JSON.stringify({
        id:"suffel-Deck",
        message:btoa(JSON.stringify(deck)),
        sender:mau.id,
        originalSender:message.originalSender,
        allreadySuffeld:message.allreadySuffeld
      });
      mau.dataChannels[mau.dataChannelNames[i]].send(message);
    }
  }
  var originalSender = message.originalSender;
  if(!sent){
    var message = JSON.stringify({
      id:"suffel-Deck-finished",
      message:btoa(JSON.stringify(deck)),
      sender:mau.id,
      originalSender:message.originalSender,
      allreadySuffeld:message.allreadySuffeld
    });
    var index = mau.dataChannelNameMap.indexOf(originalSender);
    var channelName = mau.dataChannelNames[index];
    mau.dataChannels[channelName].send(message);
  }
});

mau.messageRouter.registerKey("suffel-Deck-finished", function(message){
  var deck = JSON.parse(atob(message.message));
  deck = mau.createDeck.encryptAllCards(mau.createDeck.singleKey, deck);
  for(var i = 0; i<deck.length; i++){
    mau.createDeck.keyArray[i] = mau.createDeck.generateRandomKey();
  }
  deck = mau.createDeck.encryptCardsIndividualy(mau.createDeck.keyArray, deck);
  var message = JSON.stringify({
    id:"encrypt-Every-Card",
    message:btoa(JSON.stringify(deck)),
    sender:mau.id,
    originalSender:mau.id,
    allreadyEncrypted:[mau.id]
  });
  mau.dataChannels[mau.dataChannelNames[0]].send(message);
});

mau.messageRouter.registerKey("encrypt-Every-Card", function(message){
  var deck = JSON.parse(atob(message.message));
  deck = mau.createDeck.encryptAllCards(mau.createDeck.singleKey, deck);
  for(var i = 0; i<deck.length; i++){
    mau.createDeck.keyArray[i] = mau.createDeck.generateRandomKey();
  }
  deck = mau.createDeck.encryptCardsIndividualy(mau.createDeck.keyArray, deck);
  message.allreadyEncrypted.push(mau.id);
  var sent = false;
  for(var i = 0; i<mau.dataChannelNameMap.length; i++){
    if(!sent && message.allreadyEncrypted.indexOf(mau.dataChannelNameMap[i]) === -1){
      sent = true;
      var message = JSON.stringify({
        id:"encrypt-Every-Card",
        message:btoa(JSON.stringify(deck)),
        sender:mau.id,
        originalSender:message.originalSender,
        allreadyEncrypted:message.allreadyEncrypted
      });
      mau.dataChannels[mau.dataChannelNames[i]].send(message);
    }
  }
  var originalSender = message.originalSender;
  if(!sent){
    var message = JSON.stringify({
      id:"encrypt-Every-Card-finished",
      message:btoa(JSON.stringify(deck)),
      sender:mau.id,
      originalSender:message.originalSender,
      allreadyEncrypted:message.allreadyEncrypted
    });
    var index = mau.dataChannelNameMap.indexOf(originalSender);
    var channelName = mau.dataChannelNames[index];
    mau.dataChannels[channelName].send(message);
  }
});

mau.messageRouter.registerKey("encrypt-Every-Card-finished", function(message){
  mau.deck = JSON.parse(atob(message.message));
  var message = {
    id:"deck-update",
    message:message.message,
    sender:mau.id
  };
  mau.sendMessageToAll(message);
  setTimeout(mau.player.takeCard,1000);
});

mau.messageRouter.registerKey("deck-update", function(message){
  mau.deck = JSON.parse(atob(message.message));
  console.log(message);
});

//generates a deck which is allways in the same order
mau.createDeck.generateDeck = function(){
  var deck = [];
  var suit = ["s", "h", "d", "c"];
  var type = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "0", "j", "q", "k"];
  for(var suitType = 0; suitType<suit.length; suitType++){
    for(var cardType = 0; cardType<type.length; cardType++){
      deck.push(type[cardType] + suit[suitType]);
    }
  }
  return deck;
}

mau.createDeck.encryptAllCards = function(key, deck){
  for(var i = 0; i<deck.length; i++){
    deck[i] = mau.createDeck.encrypt(deck[i], key);
  }
  return deck;
}

mau.createDeck.encryptCardsIndividualy = function(keys, deck){
  for(var i = 0; i<deck.length; i++){
    deck[i] = mau.createDeck.encrypt(deck[i], keys[i]);
  }
  return deck;
}

//shuffles a deck
mau.createDeck.suffel = function(deck) {
  var currentIndex = deck.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = deck[currentIndex];
    deck[currentIndex] = deck[randomIndex];
    deck[randomIndex] = temporaryValue;
  }

  return deck;
}

//generates random hexadecimal string 32 characters long
mau.createDeck.generateRandomKey = function(){
  var buf = new Uint32Array(100);
  window.crypto.getRandomValues(buf);
  var string = "";
  for(var i = 0; i<100; i++){
    string = string + buf[i];
  }
  return(CryptoJS.SHA3(string, { outputLength: 8 }).toString());
}

mau.createDeck.encrypt = function(string, key){
  var stringBytes = [];
  for (var i = 0; i < string.length; ++i) {
    stringBytes.push(string.charCodeAt(i));
  }
  var encriptionBytes = [];
  for (var i = 0; i < key.length; ++i) {
    encriptionBytes.push(key.charCodeAt(i));
  }
  var bytes = [];
  for(var i = 0; i<Math.max(stringBytes.length, encriptionBytes.length); i++){
    bytes[i] = (stringBytes[i] ? stringBytes[i] : 0) ^ (encriptionBytes[i] ? encriptionBytes[i] : 0);
  }
  var string = "";
  for(var i = 0; i<bytes.length; i++){
    string += String.fromCharCode(bytes[i]);
  }
  return string;
}

mau.createDeck.decryptCard = function(keys, card){
  for(var i = 0; i<keys.length; i++){
    card = mau.createDeck.encrypt(card, keys[i])
  }
  return card;
}

mau.messageRouter.registerKey("encryption-key", function(message){
  if(mau.dataChannelNames.length === 1){
    var keys = [message.encryptionKey, mau.createDeck.keyArray[message.cardNumber]];
    mau.decrypedDeck[message.cardNumber] = mau.createDeck.decryptCard(keys, mau.deck[message.cardNumber]);
    if((index = mau.hand.indexOf(mau.deck[message.cardNumber])) != -1){
      mau.hand[index] = mau.decrypedDeck[message.cardNumber];
    }
  }else if(mau.decrypedDeck[message.cardNumber] && mau.decrypedDeck[message.cardNumber].length + 1 >= mau.dataChannelNames.length){
    mau.decrypedDeck[message.cardNumber].push(message.encryptionKey);
    console.log(message.cardNumber);
    mau.decrypedDeck[message.cardNumber].push(mau.createDeck.keyArray[message.cardNumber]);
    mau.decrypedDeck[message.cardNumber] = mau.createDeck.decryptCard(mau.decrypedDeck[message.cardNumber], mau.deck[message.cardNumber]);
    var index = 0;
    if((index = mau.hand.indexOf(mau.deck[message.cardNumber])) != -1){
      mau.hand[index] = mau.decrypedDeck[message.cardNumber];
    }
  } else if(mau.decrypedDeck[message.cardNumber]){
    mau.decrypedDeck[message.cardNumber].push(message.encryptionKey);
  } else {
    mau.decrypedDeck[message.cardNumber] = [message.encryptionKey];
  }
});
