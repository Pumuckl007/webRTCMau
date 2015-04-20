var mau = {};
mau.dataChannels = {};
mau.onLoadFunctions = [];
mau.currentlyMitigating = "";
mau.mitigationId = -1;
mau.dataChannelNames = [];
mau.dataChannelNameMap = [];
mau.id = Math.random();
mau.deck = {};
mau.decrypedDeck = [];

var load = function(e){
  for(var i = 0; i<mau.onLoadFunctions.length; i++){
    mau.onLoadFunctions[i]();
  }
}

requestAnimationFrame(load);

//creats a new data channel in response to a request and sends offer back
mau.onLoadFunctions.push(function(){
  var additionalChannelOfferRequest = function(message){
    var peerConnection = new webkitRTCPeerConnection(
      { iceServers: [{ url:'stun:23.21.150.121' }] },
      { optional: [
        { DtlsSrtpKeyAgreement: true },
        {'RtpDataChannels': true }
      ] }
    );
    var unOpedDataChannelId = Math.random();

    try {
      mau.dataChannels['mau-channel-' + unOpedDataChannelId] =
        peerConnection.createDataChannel('mau-channel-' + unOpedDataChannelId, {
          reliable: true
        });
    } catch (e) {
      console.warn('no data channel');
    }

    mau.dataChannels['mau-channel-' + unOpedDataChannelId].onopen = function (e) {
      console.log('Data channel open to ' + e.currentTarget.label);
      mau.dataChannelNames.push(e.currentTarget.label);
      mau.dataChannels[e.currentTarget.label].send(JSON.stringify({
        id:"update-Id",
        message:mau.id,
        sender:e.currentTarget.label.replace("mau-channel-", "")
      }));
    };

    mau.dataChannels['mau-channel-' + unOpedDataChannelId].onmessage = function (e) {
      mau.messageRouter.message(e.data);
    };
    peerConnection.createOffer(function (description) {
      peerConnection.setLocalDescription(description, function (arg) { });
    });
    window.peerConnection = peerConnection;
    peerConnection.onicecandidate = function (e) {
      if (e.candidate === null) {
        return;
      }
      mau.dataChannels["mau-channel-" + message.sender].send(JSON.stringify(
        {id:"additional-Channel-Offer-Return",
        message:JSON.stringify(peerConnection.localDescription),
        sender:message.sender
        }));

      peerConnection.onicecandidate = null;
    };
  };
  mau.messageRouter.registerKey("additional-Channel-Offer-Request", additionalChannelOfferRequest)
});

//fowards medigated offer to other client
mau.onLoadFunctions.push(function(){
  var additionalChannelOfferReturn = function(message){
    mau.dataChannels["mau-channel-" + mau.currentlyMitigating].send(JSON.stringify(
      {id:"additional-Channel-Answer-Request",
      message:message.message,
      sender:mau.currentlyMitigating
      }));
    mau.currentlyMitigating = message.sender;

  };
  mau.messageRouter.registerKey("additional-Channel-Offer-Return", additionalChannelOfferReturn)
});

//creates a answer to the offer sent by medigator
mau.onLoadFunctions.push(function(){
  var additionalChannelAnswerRequest = function(message){
    acceptOffer(JSON.parse(message.message), function(err, answer){
      mau.dataChannels["mau-channel-" + message.sender].send(JSON.stringify(
        {id:"additional-Channel-Answer-Return",
        message:answer,
        sender:message.sender
      }))}, function (e) {
        var channleIndex = e.channel.label;
        mau.dataChannels[e.channel.label] = e.channel;

        mau.dataChannels[channleIndex].onmessage = function (e) {
          mau.messageRouter.message(e.data);
        }

        mau.dataChannels[channleIndex].onopen = function (e) {
          console.log('Data channel open to ' + e.currentTarget.label);
          mau.dataChannelNames.push(e.currentTarget.label);
          mau.dataChannels[e.currentTarget.label].send(JSON.stringify({
            id:"update-Id",
            message:mau.id,
            sender:e.currentTarget.label.replace("mau-channel-", "")
          }));
        }

    });
  };
  mau.messageRouter.registerKey("additional-Channel-Answer-Request", additionalChannelAnswerRequest)
});

//fowards answer to other channel
mau.onLoadFunctions.push(function(){
  var additionalChannelAnswerReturn = function(message){
    mau.dataChannels["mau-channel-" + mau.currentlyMitigating].send(JSON.stringify(
      {id:"additional-Channel-Connection-Request",
      message:message.message,
      sender:mau.currentlyMitigating
      }));
    mau.currentlyMitigating = message.sender;

  };
  mau.messageRouter.registerKey("additional-Channel-Answer-Return", additionalChannelAnswerReturn)
});

//opens channel with answer recived sends back whether it was sucessfull or not
mau.onLoadFunctions.push(function(){
  var additionalChannelConnectionRequest = function(message){
    var sessionDescription =
      new RTCSessionDescription(message.message);

    peerConnection
      .setRemoteDescription(sessionDescription);

    mau.dataChannels["mau-channel-" + message.sender].send(JSON.stringify(
      {id:"additional-Channel-Connection-Return",
      sucsess:true,
      sender:message.sender
    }));

  };
  mau.messageRouter.registerKey("additional-Channel-Connection-Request", additionalChannelConnectionRequest)
});

//repeats medigation prosses with next client
mau.onLoadFunctions.push(function(){
  var send = function(){
    mau.dataChannels[mau.dataChannelNames[mau.mitigationId]].send(JSON.stringify({
      id:"additional-Channel-Offer-Request",
      message:"",
      sender:mau.dataChannelNames[mau.mitigationId].replace("mau-channel-", "")
    }));
    mau.mitigationId++;
  }
  var additionalChannelConnectionReturn = function(message){
    if(mau.dataChannelNames.length > mau.mitigationId){

      if(mau.mitigationId%2===0){
        setTimeout(send, 1000);
      } else {
        send();
      }
    } else {
      mau.dataChannelNames.push("mau-channel-" + mau.currentlyMitigating);
      mau.currentlyMitigating = "";
      for(var i = 0; i< mau.dataChannelNames.length; i++){
        mau.dataChannels[mau.dataChannelNames[i]].send(JSON.stringify({
          id:"update-Id",
          message:mau.id,
          reply: true,
          sender:mau.dataChannelNames[i].replace("mau-channel-", "")
        }));
      }
    }
  };
  mau.messageRouter.registerKey("additional-Channel-Connection-Return", additionalChannelConnectionReturn)
});

//Sets the mapping between the id of a channel and the peer's id
mau.onLoadFunctions.push(function(){
  var updateId = function(message){
    mau.dataChannelNameMap[mau.dataChannelNames.indexOf("mau-channel-" + message.sender)] = message.message;
    if(message.reply){
      mau.dataChannels["mau-channel-" + message.sender].send(JSON.stringify({
        id:"update-Id",
        message:mau.id,
        sender:message.sender
      }));
    }
  };
  mau.messageRouter.registerKey("update-Id", updateId)
});
