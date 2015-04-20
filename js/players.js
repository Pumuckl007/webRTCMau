mau.playerNames = [];
mau.players = [];
mau.hand = [];
mau.player = {};

mau.player.takeCard = function(){
  var card = mau.deck[0];
  var sendTo = mau.dataChannelNameMap[0];
  for(var i = 0; i<mau.dataChannelNameMap.length; i++){
    if(sendTo != mau.dataChannelNameMap[i]){
      takeCard = {
        id:"take-card",
        cardNumber:0
      };
      mau.messageRouter.send(mau.dataChannelNameMap[i], takeCard);
    } else {
      takeCard = {
        id:"take-card-next",
        originalSender: mau.id,
        allreadyChoose: [mau.id],
        cardNumber:0,
        cardsEveryoneHas:0
      };
      mau.messageRouter.send(sendTo, takeCard);
    }
  }
  mau.hand.push(card);
}

mau.messageRouter.registerKey("take-card", function(message){
  if(mau.playerNames.indexOf(message.sender) === -1){
    mau.players[mau.playerNames.length] = mau.newPlayer(message.sender);
    mau.playerNames.push(message.sender);
  }
  var player = mau.players[mau.playerNames.indexOf(message.sender)];
  player.cards.push(message.cardNumber);
  player.numberOfCards ++;
  var messageToSend = {
    id:"encryption-key",
    cardNumber: message.cardNumber,
    encryptionKey: mau.createDeck.keyArray[message.cardNumber],
    sender:mau.id
  };
  mau.messageRouter.send(message.sender, messageToSend);
});

mau.messageRouter.registerKey("take-card-next", function(message){
  if(mau.playerNames.indexOf(message.sender) === -1){
    mau.players[mau.playerNames.length] = mau.newPlayer(message.sender);
    mau.playerNames.push(message.sender);
  }
  var player = mau.players[mau.playerNames.indexOf(message.sender)];
  player.cards.push(message.cardNumber);
  player.numberOfCards ++;
  var messageToSend = {
    id:"encryption-key",
    cardNumber: message.cardNumber,
    encryptionKey: mau.createDeck.keyArray[message.cardNumber],
    sender:mau.id
  };
  mau.messageRouter.send(message.sender, messageToSend);
  var sent = false;
  var sendTo = 0;
  for(var i = 0; i<mau.dataChannelNameMap.length; i++){
    if(!sent && message.allreadyChoose.indexOf(mau.dataChannelNameMap[i]) === -1){
      sent = true;
      sendTo = mau.dataChannelNameMap[i];
    }
  }
  if(!sent){
      sendTo = message.originalSender;
      message.allreadyChoose = [];
  }
  if(message.allreadyChoose.length === 0){
    message.cardsEveryoneHas ++;
    if(!(message.cardsEveryoneHas > 9)){
      var card = mau.deck[message.cardNumber + 1];
      for(var i = 0; i<mau.dataChannelNameMap.length; i++){
        if(sendTo != mau.dataChannelNameMap[i]){
          takeCard = {
            id:"take-card",
            cardNumber:message.cardNumber + 1
          };
          mau.messageRouter.send(mau.dataChannelNameMap[i], takeCard);
        } else {
          if(message.originalSender != sendTo){
            message.allreadyChoose.push(mau.id);
          }
          takeCard = {
            id:"take-card-next",
            originalSender: message.originalSender,
            allreadyChoose: message.allreadyChoose,
            cardNumber:message.cardNumber + 1,
            cardsEveryoneHas:message.cardsEveryoneHas
          };
          mau.messageRouter.send(sendTo, takeCard);
        }
      }
      mau.hand.push(card);
    } else {
      console.log("Everyone has 5 cards");
    }
  }
  else if(mau.deck.length <= message.cardNumber +1){
    takeCard = {
      id:"all-Cards-Taken",
      sender:mau.id
    };
    mau.sendMessageToAll(takeCard);
  } else {
    var card = mau.deck[message.cardNumber + 1];
    for(var i = 0; i<mau.dataChannelNameMap.length; i++){
      if(sendTo != mau.dataChannelNameMap[i]){
        takeCard = {
          id:"take-card",
          cardNumber:message.cardNumber + 1
        };
        mau.messageRouter.send(mau.dataChannelNameMap[i], takeCard);
      } else {
        if(message.originalSender != sendTo){
          message.allreadyChoose.push(mau.id);
        }
        takeCard = {
          id:"take-card-next",
          originalSender: message.originalSender,
          allreadyChoose: message.allreadyChoose,
          cardNumber:message.cardNumber + 1,
          cardsEveryoneHas:message.cardsEveryoneHas
        };
        mau.messageRouter.send(sendTo, takeCard);
      }
    }
    mau.hand.push(card);
  }
});

mau.newPlayer = function(name){
  var player = {
    name:name,
    cards:[],
    numberOfCards:0
  };
  return player;
}
