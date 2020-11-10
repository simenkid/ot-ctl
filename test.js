var ot = require('./index');


//ot.readLine('factoryreset').then(() => console.log('reset'));

//ot.readStatus()
//ot.scanAvailableNetwork()
ot.getWpanServiceStatus()
//.then(data => console.log(data))

//ot.readLines('networkdiagnostic get fd62:e632:a58f:1904:0:ff:fe00:fc00 0 1 6')
//ot.readLines('networkdiagnostic get ff02::1 0 1')
/*
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
*/
.then(data => console.log(data));


