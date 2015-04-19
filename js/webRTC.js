function acceptOffer (offer, handleAnswer, handleDataChannel) {
  var peerConnection = new webkitRTCPeerConnection(
    { iceServers: [{ url:'stun:23.21.150.121' }] },
    { optional: [
      { DtlsSrtpKeyAgreement: true },
      {'RtpDataChannels': true }
    ] }
  );

  peerConnection.ondatachannel = handleDataChannel;

  peerConnection.onicecandidate = function (e) {
    if (e.candidate === null) {
      return;
    }

    peerConnection.onicecandidate = null;

    handleAnswer(null, peerConnection.localDescription);
  };

  var offerDescription =
    new RTCSessionDescription(offer);

  peerConnection
    .setRemoteDescription(offerDescription);

  peerConnection
    .createAnswer(function (answerDescription) {
      peerConnection
        .setLocalDescription(answerDescription);
    });
}

function onAnswer (err, answer) {
  var answerField =
    document.querySelector('#answer');
  answerField.value = JSON.stringify(answer);
}

function onDataChannel (e) {
  var channleIndex = e.channel.label;
  mau.dataChannels[e.channel.label] = e.channel;

  mau.dataChannels[channleIndex].onmessage = function (e) {
    mau.messageRouter.message(e.data);
  }

  mau.dataChannels[channleIndex].onopen = function (e) {
    console.log('Data channel open to ' + e.currentTarget.label);
    mau.dataChannels[e.currentTarget.label].send(JSON.stringify({
      id:"update-Id",
      message:mau.id,
      sender:e.currentTarget.label.replace("mau-channel-", "")
    }));
    mau.currentlyMitigating = e.currentTarget.label.replace("mau-channel-", "");
    mau.mitigationId = 0;
    if(mau.dataChannelNames.length > 0){
      mau.dataChannels[mau.dataChannelNames[mau.mitigationId]].send(JSON.stringify({
        id:"additional-Channel-Offer-Request",
        message:"",
        sender:mau.dataChannelNames[mau.mitigationId].replace("mau-channel-", "")
      }));
    } else{
      mau.dataChannelNames.push(e.currentTarget.label);
    }
    mau.mitigationId++;
  }

}

document.querySelector('#connect').addEventListener('click', function() {
  var offerField =
    document.querySelector('#offer');
  var offer = JSON.parse(offerField.value);

  acceptOffer(offer, onAnswer, onDataChannel);
});
