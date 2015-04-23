mau.playDeck = [];
mau.unplayedDeck = [];
mau.playDeckOffset = 0;
mau.playDeckCard = 0;
mau.unplayDeckOffset = 0;
mau.playDeckCardDecryption = [];
mau.drawCards = true;

mau.messageRouter.registerKey("everyone-has-cards", function(message){
  mau.playDeckOffset = message.firstUnusedCard;
  mau.unplayDeckOffset = message.firstUnusedCard + 1;
  for(var i = mau.unplayDeckOffset; i<mau.deck.length; i++){
    mau.unplayedDeck[i-mau.unplayDeckOffset] = mau.deck[i];
  }
  var playdeckCardDecryption = {
    id:"play-deck-card-decryption",
    key:mau.createDeck.keyArray[mau.playDeckOffset + 1],
    sender:mau.id
  }
  mau.sendMessageToAll(playdeckCardDecryption);
});

mau.messageRouter.registerKey("play-deck-card-decryption", function(message){
  mau.playDeckCardDecryption.push(message.key);
  if(mau.playDeckCardDecryption.length >= mau.players.length){
    mau.playDeckCardDecryption.push(mau.createDeck.keyArray[mau.deck.indexOf(mau.unplayedDeck[0])]);
    mau.playDeck.push(mau.createDeck.decryptCard(mau.playDeckCardDecryption, mau.unplayedDeck[0]));
    mau.unplayedDeck.takeFirstCard();
    mau.playDeckCardDecryption = [];
    mau.unplayDeckOffset ++;
    mau.playDeckCard ++;
  }
});

mau.playDeck.revealTopCard = function(){
  var revealTopCard = {
    id:"reveal-top-card",
    sender:mau.id
  }
  mau.sendMessageToAll(revealTopCard);
  mau.messageRouter.message(JSON.stringify(revealTopCard));
}

mau.messageRouter.registerKey("reveal-top-card", function(message){
  var playdeckCardDecryption = {
    id:"play-deck-card-decryption",
    key:mau.createDeck.keyArray[mau.deck.indexOf(mau.unplayedDeck[0])],
    sender:mau.id
  }
  mau.sendMessageToAll(playdeckCardDecryption);
});

mau.hand.playCard = function(card){
  if(card >= mau.hand.length){
    return;
  }
  var cayrd = mau.hand[card];
  var playCard = {
    id:"play-card",
    card:cayrd,
    sender:mau.id
  }
  mau.sendMessageToAll(playCard);
  mau.hand.splice(card,1);
  mau.playDeck.push(playCard.card);
}

mau.messageRouter.registerKey("play-card", function(message){
  mau.playDeck.push(message.card);
  mau.players[mau.playerNames.indexOf(message.sender)].numberOfCards --;
});

mau.unplayedDeck.penelize = function(playerId, reason){
  var playCard = {
    id:"penilize-player",
    player:playerId,
    reason:reason,
    sender:mau.id
  }
  mau.sendMessageToAll(playCard);
}

mau.unplayedDeck.takeFirstCard = function(){
  mau.unplayDeckOffset ++;
  mau.unplayedDeck.shift(-1);
  if(mau.unplayedDeck.length === 0){
    mau.createDeck.usePlaydeckAndSend();
    mau.playDeckOffset = 0;
    mau.playDeckCard = 0;
    mau.unplayDeckOffset = 0;
    var message = {
      id:"rest-playdeck-counters",
      sender:mau.id
    }
    mau.sendMessageToAll(message);
  }
}

mau.unplayedDeck.takeFirstCardWithoutUpdate = function(){
  mau.playDeckOffset ++;
  mau.unplayedDeck.shift(-1);
}

mau.messageRouter.registerKey("rest-playdeck-counters", function(message){
  mau.playDeckOffset = 0;
  mau.playDeckCard = 0;
  mau.unplayDeckOffset = 0;
  while(mau.playDeck.length > 1){
    mau.playDeck.shift(-1);
  }
});

mau.messageRouter.registerKey("penilize-player", function(message){
  if(mau.id === message.player){
    console.log(mau.players[mau.playerNames.indexOf(message.sender)].nick + " is penilizeing you for " + message.reason)
    console.log("exicute mau.accept(), or mau.reject() to accept or reject the penalty");
  } else {
    console.log(mau.players[mau.playerNames.indexOf(message.sender)].nick + " is penilizeing " + mau.players[mau.playerNames.indexOf(message.player)].nick + " because of " + message.reason);
  }
});

mau.accept = function(){
  var accept = {
    id:"accept-penalty",
    card:mau.unplayedDeck[0],
    sender:mau.id
  }
  mau.sendMessageToAll(accept);
  mau.hand.push(mau.unplayedDeck[0]);
  setTimeout(mau.acceptCont, 1000);
};

mau.acceptCont = function(){
  mau.unplayedDeck.takeFirstCard();
  mau.unplayDeckOffset ++;
  mau.playDeckCard ++;
}

mau.messageRouter.registerKey("accept-penalty", function(message){
  var messageToSend = {
    id:"encryption-key",
    encryptionKey:mau.createDeck.keyArray[mau.deck.indexOf(message.card)],
    cardNumber:mau.deck.indexOf(message.card)
  };
  mau.unplayedDeck.takeFirstCardWithoutUpdate();
  mau.messageRouter.send(message.sender,messageToSend);
});

mau.reject = function(){
  var message = {
    id:"reject-penalty",
    sender:mau.id
  };
  mau.sendMessageToAll(message);
}

mau.messageRouter.registerKey("reject-penalty", function(message){
  console.log(mau.players[mau.playerNames.indexOf(message.sender)].nick + " rejects the penalty");
});

mau.playDeck.playBottomCard = function(){
  var message = {
    id:"play-bottom-playdeck-card",
    sender:mau.id
  };
  mau.sendMessageToAll(message);
  mau.playDeck.push(mau.playDeck[0]);
  mau.playDeck.shift(-1);
}

mau.messageRouter.registerKey("play-bottom-playdeck-card", function(message){
  mau.playDeck.push(mau.playDeck[0]);
  mau.playDeck.shift(-1);
});
