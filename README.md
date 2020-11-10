# ot-ctl

IPv6:MeshLocalAddress
fd11:1111:1122:0:78a9:f386:e566:d992

IPv6:MeshLocalPrefix
fd11:1111:1122:0/64

NCP:Channel
> 15 Done >

NCP:HardwareAddress
> 00124b001ca16143 Done >

NCP:State
> leader Done >

NCP:Version
> OPENTHREAD/0.01.00; POSIX; Aug 5 2020 03:15:18 Done >

Network:Name
> OpenThreadDemo Done >

Network:NodeType
> leader Done >

Network:PANID
> 0x1234 Done >

Network:XPANID
> 1111111122222222 Done >

WPAN service
associated


HandleJoinNetworkRequest
// input
 index        = root["index"].asUInt();
    masterKey    = root["masterKey"].asString();
    prefix       = root["prefix"].asString();
    defaultRoute = root["defaultRoute"].asBool();

// steps
FactoryReset()
commitActiveDataset()
ifconfig up
thread start
("prefix add %s paso%s", prefix.c_str(), (defaultRoute ? "r" : ""))


HandleFormNetworkRequest
FactoryReset()
commitActiveDataset()
"pskc %s", pskcStr
"ifconfig up"
"thread start"
"prefix add %s paso%s", prefix.c_str(), (defaultRoute ? "r" : "")

HandleAddPrefixRequest
"prefix add %s paso%s", prefix.c_str(), (defaultRoute ? "r" : "")

HandleDeletePrefixRequest
"prefix remove %s", prefix.c_str()

HandleStatusRequest
Execute("state")
"version"
"eui64"
"channel"
"state"
"networkname"
"extpanid"
"panid"

"dataset active"
"ipaddr"


[TBD]HandleAvailableNetworkRequest
client.Scan()

GetWpanServiceStatus
"state"
"networkname"
"extpanid"

HandleCommission
"commissioner start"
"commissioner joiner add * %s", pskd.c_str()

commitActiveDataset
"dataset init new"
"dataset masterkey %s", aMasterKey.c_str()
"dataset networkname %s"
"dataset channel %u", aChannel
"dataset extpanid %016" PRIx64, aExtPanId
"dataset panid %u", aPanId
"dataset commit active"