var ot = require('./index');


//ot.readLine('factoryreset').then(() => console.log('reset'));

//ot.readStatus()
//.then(data => console.log(data))
//ot.scanAvailableNetwork()
//.then(data => console.log(data))
//ot.getWpanServiceStatus()
//.then(data => console.log(data))
//ot.readLines('networkdiagnostic get fd11:1111:1122:0:0:ff:fe00:fc00 0 1 2 3 4 5 6')
//ot.readLines('networkdiagnostic get ff02::1 0 1 2 3 4 5 6')
ot.networkDiagnosticGet('ff02::1', '12 13 14 15 16')
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
})
*/
//.then(() => ot.readStatus())

//ot.readLines('state')
.then(data => console.log(data));

// var x = 'Mode:';
// x = x.split(':');
// console.log(x);