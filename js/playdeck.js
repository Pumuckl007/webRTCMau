mau.playDeck = [];
mau.unplayedDeck = [];
mau.playDeckOffset = 0;
mau.playDeckCard = 0;
mau.unplayDeckOffset = 0;
mau.playDeckCardDecryption = [];

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
    mau.playDeckCardDecryption.push(mau.createDeck.keyArray[mau.playDeckCard + mau.playDeckOffset + 1]);
    mau.playDeck.push(mau.createDeck.decryptCard(mau.playDeckCardDecryption, mau.unplayedDeck[0]));
    mau.unplayedDeck.shift(-1);
    mau.playDeckCardDecryption = [];
  }
});
