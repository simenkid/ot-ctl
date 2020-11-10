var ot = require('./index');


//ot.readLine('factoryreset').then(() => console.log('reset'));

ot.readStatus()
.then(data => console.log(data))
.then(() => {
  return ot.formNetwork({
    masterKey: 'aabb2233445566778899aabbccddeeff',
    networkName: 'ggyyn',
    channel: 16,
    extPanId: '11222222AAAAAAAA',
    panId: '0xAACE',
    prefix: 'fd11:22::',
    passphrase: '654321',
  }, false);
}).then(() => ot.readStatus())
.then(data => console.log(data));


