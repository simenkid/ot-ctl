const DEF = require('./lib/def.js');
const ot = require('./lib/otc.js');

const api = {};

/********************************************************************************************/
/** Public APIs                                                                            **/
/********************************************************************************************/
api.readStatus = function () {
    let WPAN_MESSAGE = DEF.WPAN_STATUS_MESSAGE;
    let WPAN_CODE = DEF.WPAN_STATUS_CODE;

    let rsp = {
        code: WPAN_CODE.OK,
        data: { wpanService: WPAN_CODE.Uninitialized }
    };
    let data = rsp.data;

    return api.readLine('state').then(state => {

        data.state = state;

        if (state === 'disabled') {
            rsp.code = data.wpanService = WPAN_CODE.Offline;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.Offline]);  // exit now
        } else if (state === 'detached') {
            rsp.code = data.wpanService = WPAN_CODE.Associating;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.Associating]);  // exit now
        } else {
            data.wpanService = WPAN_CODE.Associated;
        }

        return api.readLine('version');
    }).then(version => {
        data.version = version;
        return api.readLine('eui64');
    }).then(eui64 => {
        data.eui64 = eui64;
        return api.readLine('channel').then(ch => parseInt(ch));
    }).then(channel => {
        data.channel = channel;
        return api.readLine('state');
    }).then(state => {
        data.nodeType = state;
        return api.readLine('networkname');
    }).then(networkname => {
        data.networkName = networkname;
        return api.readLine('extpanid');
    }).then(extpanid => {
        data.extPanId = extpanid;
        return api.readLine('panid');
    }).then(panid => {
        data.panId = panid;
        return api.readLines('dataset active').then(lines => parseObject(lines));
    }).then((dataset) => {
        let meshLocalPrefix = dataset["Mesh Local Prefix"] || '';   // Mesh Local Prefix: fdb9:5fb:c53c:b4f5/64
        data.meshLocalPrefix = meshLocalPrefix.split('/')[0];

        // Active Timestamp: 1
        // Channel: 17
        // Channel Mask: 07fff800
        // Ext PAN ID: 25ff60e2412128ec
        // Mesh Local Prefix: fdb9:5fb:c53c:b4f5/64
        // Master Key: e947a2e6b08b8cfefa6961b5c3943928
        // Network Name: OpenThread-9603
        // PAN ID: 0x9603
        // PSKc: 89722adb7ef02054ec73111c337ec6a9
        // Security Policy: 0, onrcb

        return api.readLines('ipaddr');
    }).then(ipaddrs => {
        // fdb9:5fb:c53c:b4f5:0:ff:fe00:fc00        : Any Cast Address
        // fdb9:5fb:c53c:b4f5:0:ff:fe00:e400        : RLOC
        // fdb9:5fb:c53c:b4f5:90c6:463f:a584:e41e   : Mesh Local Address
        // fd11:22:0:0:5772:2893:48ee:99ff          : On-Mesh prefixed address
        // fe80:0:0:0:2854:5030:b40f:b111           : Link Local Address

        let MLATokenLocator = ':0:ff:fe00:';

        // find mesh local address (MLA)
        ipaddrs.forEach(addr => {
            if (addr.startsWith(data.meshLocalPrefix)) {
                if (!addr.startsWith(data.meshLocalPrefix + MLATokenLocator)) {
                    data.meshLocalAddress = addr;
                }
            }
        });

        data.ipaddr = ipaddrs;
        return rsp;
    }).catch(err => {
        if (rsp.code === WPAN_CODE.OK)
            rsp.code = WPAN_CODE.GetPropertyFailed;
        return rsp;
    }).then(() => {
        data.wpanService = WPAN_MESSAGE[data.wpanService];

        if (rsp.code !== WPAN_CODE.OK)
            rsp.message = WPAN_MESSAGE[rsp.code];

        return rsp;
    });
};

api.formNetwork = function (config, defaultRoute) {
    // [TBD] check pattern
    let WPAN_MESSAGE = DEF.WPAN_STATUS_MESSAGE;
    let WPAN_CODE = DEF.WPAN_STATUS_CODE;
    let rsp = { code: WPAN_CODE.OK };

    let { masterKey, networkName, channel, extPanId, panId, prefix, passphrase } = config;

    if (!prefix.includes('/'))
        prefix = prefix + '/64';

    return api.readLine('factoryreset')
        .then(() => delay(3000))
        .then(() => api.commitActiveDataset(config))
        .catch(() => {
            rsp.code = WPAN_CODE.SetFailed;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.SetFailed]);
        })
        .then(() => api.readLine(`pskc -p ${passphrase}`))
        .catch(() => {
            rsp.code = WPAN_CODE.SetFailed;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.SetFailed]);
        })
        .then(() => api.readLine('ifconfig up'))
        .then(() => api.readLine('thread start'))
        .then(() => api.readLine(`prefix add ${prefix} paso${defaultRoute ? 'r' : ''}`))
        .catch(() => {
            if (rsp.code === WPAN_CODE.OK)
                rsp.code = WPAN_CODE.FormFailed;

            if (rsp.code !== WPAN_CODE.OK)
                rsp.message = WPAN_MESSAGE[rsp.code];
    
        })
        .then(() => rsp);
};

api.addPrefix = function (prefix, defaultRoute) {
    if (!prefix.includes('/'))
        prefix = prefix + '/64';

    return api.readLine(`prefix add ${prefix} paso${defaultRoute ? 'r' : ''}`)
        .then(() => { return { code: DEF.WPAN_STATUS_CODE.OK }; })
        .catch(() => {
            return { code: DEF.WPAN_STATUS_CODE.SetGatewayFailed, message: DEF.WPAN_STATUS_MESSAGE[DEF.WPAN_STATUS_CODE.SetGatewayFailed] };
        });
};

api.deletePrefix = function (prefix) {
    return api.readLine(`prefix remove ${prefix}`)
        .then(() => { return { code: DEF.WPAN_STATUS_CODE.OK }; })
        .catch(() => {
            return { code: DEF.WPAN_STATUS_CODE.SetGatewayFailed, message: DEF.WPAN_STATUS_MESSAGE[DEF.WPAN_STATUS_CODE.SetGatewayFailed] };
        });
};

api.scanAvailableNetwork = function () {
    let WPAN_MESSAGE = DEF.WPAN_STATUS_MESSAGE;
    let WPAN_CODE = DEF.WPAN_STATUS_CODE;

    let rsp = {
        code: WPAN_CODE.OK,
        data: null
    };

    return api.readLines(`scan`)
        .then(lines => parseTable(lines))
        .then(nets => {
            rsp.data = nets;

            if (nets.length === 0) {
                rsp.code = WPAN_CODE.NetworkNotFound;
                rsp.message = WPAN_MESSAGE[rsp.code];
            }
            return rsp;
        }).catch(() => {
            rsp.code = WPAN_CODE.SetGatewayFailed;
            rsp.message = WPAN_MESSAGE[rsp.code];
            return rsp;
        });
};

api.getWpanServiceStatus = function (networkName, extPanId) {
    let WPAN_MESSAGE = DEF.WPAN_STATUS_MESSAGE;
    let WPAN_CODE = DEF.WPAN_STATUS_CODE;

    let rsp = {
        code: WPAN_CODE.OK,
        data: {
            wpanService: WPAN_CODE.Uninitialized
        }
    };
    let data = rsp.data;

    return api.readLine('state').then(state => {
        if (state === 'disabled') {
            rsp.code = data.wpanService = WPAN_CODE.Offline;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.Offline]);       // exit now
        } else if (state === 'detached') {
            rsp.code = data.wpanService = WPAN_CODE.Associating;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.Associating]);   // exit now
        } else if (state === '') {
            rsp.code = data.wpanService = WPAN_CODE.Down;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.Down]);          // exit now
        } else {
            data.wpanService = WPAN_CODE.Associated;
        }

        return api.readLine('networkname');
    }).then(networkname => {
        if (networkname === '') {
            rsp.code = data.wpanService = WPAN_CODE.Down;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.Down]);          // exit now
        } else {
            data.networkName = networkname;
        }
        return api.readLine('extpanid');
    }).then((extpanid) => {
        if (extpanid === '') {
            rsp.code = data.wpanService = WPAN_CODE.Down;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.Down]);          // exit now
        } else {
            data.extPanId = extpanid;
        }
        return rsp;
    }).catch(() => {
        if (rsp.code === WPAN_CODE.OK)
            rsp.code = WPAN_CODE.Down;
        return rsp;
    }).then(() => {
        data.wpanService = WPAN_MESSAGE[data.wpanService];

        if (rsp.code !== WPAN_CODE.OK)
            rsp.message = WPAN_MESSAGE[rsp.code];

        return rsp;
    });
};

api.commission = function (pskd) {
    return api.readLine('commissioner start')
        .then(() => api.readLine(`commissioner joiner add * ${pskd}`))
        .then(() => { return { code: DEF.WPAN_STATUS_CODE.OK }; })
        .catch(() => {
            return { code: DEF.WPAN_STATUS_CODE.Down, message: DEF.WPAN_STATUS_MESSAGE[DEF.WPAN_STATUS_CODE.Down] };
        });
};

api.joinNetwork = function (config, defaultRoute) {
    // [TBD] check pattern
    let WPAN_MESSAGE = DEF.WPAN_STATUS_MESSAGE;
    let WPAN_CODE = DEF.WPAN_STATUS_CODE;
    let rsp = { code: WPAN_CODE.OK };

    let { masterKey, networkName, channel, extPanId, panId, prefix, passphrase } = config;

    if (!prefix.includes('/'))
        prefix = prefix + '/64';

    return api.readLine('factoryreset')
        .catch(() => {
            rsp.code = WPAN_CODE.LeaveFailed;
            throw new Error(WPAN_MESSAGE[WPAN_CODE.LeaveFailed]);
        })
        .then(() => api.commitActiveDataset(config))
        .then(() => api.readLine(`pskc -p ${passphrase}`))
        .catch(() => {
            if (rsp.code === WPAN_CODE.OK)
                rsp.code = WPAN_CODE.SetFailed;

            throw new Error(WPAN_MESSAGE[rsp.code]);
        })
        .then(() => api.readLine('ifconfig up'))
        .then(() => api.readLine('thread start'))
        .catch(() => {
            if (rsp.code === WPAN_CODE.OK)
                rsp.code = WPAN_CODE.JoinFailed;

            throw new Error(WPAN_MESSAGE[rsp.code]);
        })
        .then(() => api.readLine(`prefix add ${prefix} paso${defaultRoute ? 'r' : ''}`))
        .catch(() => {
            if (rsp.code === WPAN_CODE.OK)
                rsp.code = WPAN_CODE.SetFailed;

            if (rsp.code !== WPAN_CODE.OK)
                rsp.message = WPAN_MESSAGE[rsp.code];
            return rsp;
        })
        .then(() => rsp);
};

/********************************************************************************************/
/** Protected Methods                                                                      **/
/********************************************************************************************/
api.readLines = function (cmdArg) {
    return ot(cmdArg).then(result => {
        return result.lines;
    });
};

api.readLine = function (cmdArg) {
    return ot(cmdArg).then(result => {
        return result.lines[0];
    });
};

api.readTable = function (cmdArg) {
    return api.readLines(cmdArg).then(lines => {
        return parseTable(lines);
    });
};

api.commitActiveDataset = function (config) {
    let { masterKey, networkName, channel, extPanId, panId } = config;

    return api.readLine('dataset init new')
        .then(() => api.readLine(`dataset masterkey ${masterKey}`))     // 32 hexadecimal digits: dfd34f0f05cad978ec4e32b0413038ff
        .then(() => api.readLine(`dataset networkname ${networkName}`)) // 16 chars, whitespace should escape /
        .then(() => api.readLine(`dataset channel ${channel}`))         // 11-26
        .then(() => api.readLine(`dataset extpanid ${extPanId}`))       // 16 hexadecimal characters  long
        .then(() => api.readLine(`dataset panid ${panId}`))             // 4 hexadecimal digits long.
        .then(() => api.readLine('dataset commit active'))
        .then(() => { return { code: DEF.WPAN_STATUS_CODE.OK }; })
        .catch(() => {
            return { code: DEF.WPAN_STATUS_CODE.SetFailed, message: DEF.WPAN_STATUS_MESSAGE[DEF.WPAN_STATUS_CODE.SetFailed] };
        });
};

/********************************************************************************************/
/** Private Functions                                                                      **/
/********************************************************************************************/
function delay(t) {
    return new Promise((resolve) => {
        setTimeout(resolve, t);
    });
}

function parseObject(lines) {
    let obj = {};

    lines.forEach(line => {
        let delimiterIndex = line.indexOf(':');
        let key = line.slice(0, delimiterIndex).trim();
        let value = line.slice(delimiterIndex + 1).trim();

        obj[key] = value;
    });

    return obj;
}

function parseTableFields(line) {

    let fields = line.split('|');
    fields.shift();
    fields.pop();

    for (let i = 0; i < fields.length; i++) {
        fields[i] = fields[i].trim();
    }

    return fields;
}

function parseTable(lines) {
    // Example:
    //  lines[0]> | J | Network Name     | Extended PAN     | PAN  | MAC Address      | Ch | dBm | LQI |
    //  lines[1]> +---+------------------+------------------+------+------------------+----+-----+-----+
    //  lines[2]> | 0 | OpenThread       | dead00beef00cafe | ffff | f1d92a82c8d8fe43 | 11 | -20 |   0 |
    let infoList = [];
    let fieldNames = parseTableFields(lines[0]);

    // parse items from index = 2
    for (let i = 2; i < lines.length; i++) {
        let line = lines[i];
        
        if (line === 'Done' || line === '')
            break;

        let values = parseTableFields(line);
        let item = {};

        // create info object
        fieldNames.forEach((key, i) => {
            item[key] = values[i];
        });

        infoList.push(item);
    }

    return infoList;
}

module.exports = api;

