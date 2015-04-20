function makeOffer (handleOffer, handleAnswer) {
  var peerConnection = new webkitRTCPeerConnection(
    { iceServers: [{ url:'stun:23.21.150.121' }] },
    { optional: [
      { DtlsSrtpKeyAgreement: true },
      {'RtpDataChannels': true }
    ] }
  );

  peerConnection.createOffer(function (description) {
    peerConnection.setLocalDescription(description);

  });
}

var peerConnection = new webkitRTCPeerConnection(
  { iceServers: [{ url:'stun:23.21.150.121' }] },
  { optional: [
    { DtlsSrtpKeyAgreement: true },
    {'RtpDataChannels': true }
  ] }
);

peerConnection.onicecandidate = function (e) {
  if (e.candidate === null) {
    return;
  }

  document.querySelector('#offer').value =
    JSON.stringify(peerConnection.localDescription);

  peerConnection.onicecandidate = null;
};

document.querySelector('#accept').addEventListener('click', function() {
  var answerField =
    document.querySelector('#answer');
  var answer = JSON.parse(answerField.value);
  var sessionDescription =
    new RTCSessionDescription(answer);

  peerConnection
    .setRemoteDescription(sessionDescription);
});

var unOpedDataChannelId = Math.random();
var unOpedDataChannel;

try {
  unOpedDataChannel =
    peerConnection.createDataChannel('mau-channel-' + unOpedDataChannelId, {
      reliable: true
    });
} catch (e) {
  console.warn('no data channel');
}

unOpedDataChannel.onopen = function (e) {
  mau.dataChannels['mau-channel-' + unOpedDataChannelId] = unOpedDataChannel;
  unOpedDataChannel.send(JSON.stringify({
    id:"update-Id",
    message:mau.id,
    sender:unOpedDataChannelId + ""
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
};

unOpedDataChannel.onmessage = function (e) {
  mau.messageRouter.message(e.data);
};

peerConnection.createOffer(function (description) {
  peerConnection.setLocalDescription(description, function (arg) { });
});
