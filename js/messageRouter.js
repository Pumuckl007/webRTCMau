mau.messageRouter = {};
mau.messageRouter.map = {};

//Key list
//additional-Channel-Offer-Request - asks to be sent another offer for another client
//additional-Channel-Offer-Return - response to additional-Channel-Offer-Request
//additional-Channel-Answer-Request - asks for a response to the offer that is given
//additional-Channel-Answer-Return - reponse to additional-Channel-Answer-Request that is given
//additional-Channel-Connection-Request - asks to accept the answer given
//additional-Channel-Connection-Return - reponse saying if it was sucsessfull or not
//update-Id - sends id of the client
//suffle-Deck - asks to encrypt and shuffle deck
//suffel-Deck-finished - tell that all of the player have suffled and encryped
//encrypt-Every-Card - tells to remove encryption and encrypt every card individualy
//encrypt-Every-Card-finished - the final message regarding card encription, transfers the deck back
//deck-update - the final giving out to everyone of the deck
//take-card - tell the player and the card they took from the deck
//encryption-key - sends the encryption key for one card

mau.messageRouter.registerKey = function(key, callBack){
  if(mau.messageRouter.map[key]){
    mau.messageRouter.map[key].push(callBack);
  } else {
    mau.messageRouter.map[key] = [callBack];
  }
};

mau.messageRouter.send = function(id, message){
  message.sender = mau.id;
  var dataChannel = mau.dataChannels[mau.dataChannelNames[mau.dataChannelNameMap.indexOf(id)]];
  dataChannel.send(JSON.stringify(message));
}

mau.messageRouter.message = function(message){
  var hasProssesed = false;
  if(!mau.messageRouter.isJson(message)){
    console.log(message);
    return;
  }
  var parsedMessage = JSON.parse(message);
  var ids = parsedMessage.id.split("|");
  var allreadyCalled = [];
  for(var i = 0; i<ids.length; i++){
    if(mau.messageRouter.map[ids[i]]){
      var callBacks = mau.messageRouter.map[ids[i]];
      for(var k = 0; k<callBacks.length; k++){
        if(allreadyCalled.indexOf(callBacks[k]) === -1){
          callBacks[k](parsedMessage);
          allreadyCalled.push(callBacks[k]);
          hasProssesed = true;
        }
      }
    }
  }
  if(!hasProssesed){
    console.log(parsedMessage);
  }
};

mau.messageRouter.isJson = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

mau.sendMessageToAll = function(json){
  for(var i = 0; i<mau.dataChannelNames.length; i++){
    mau.dataChannels[mau.dataChannelNames[i]].send(JSON.stringify(json));
  }
};
