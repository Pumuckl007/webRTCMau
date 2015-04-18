function makeOffer (handleOffer, handleAnswer) {
  var peerConnection = new webkitRTCPeerConnection(
    { iceServers: [{ url:'stun:23.21.150.121' }] },
    { optional: [
      { DtlsSrtpKeyAgreement: true },
      {'RtpDataChannels': true }
    ] }
  );

  peerConnection.createOffer(function (description) {
    peerConnection.setLocalDescription(description, function () { });
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

try {
  mau.dataChannels['mau-channel-' + unOpedDataChannelId] =
    peerConnection.createDataChannel('mau-channel-' + unOpedDataChannelId, {
      reliable: true
    });
} catch (e) {
  console.warn('no data channel');
}

mau.dataChannels['mau-channel-' + unOpedDataChannelId].onopen = function (e) {
  console.log('Data channel open..');
};

mau.dataChannels['mau-channel-' + unOpedDataChannelId].onmessage = function (e) {
  console.log('message', e.data);
};

peerConnection.createOffer(function (description) {
  peerConnection.setLocalDescription(description, function (arg) { });
});
