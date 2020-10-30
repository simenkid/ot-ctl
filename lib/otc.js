const { spawn } = require('child_process');
const DEF = require('./def.js');

var otc = null;
var stdoutText = '';
var timeout = null;

const otExec = function (cmdArg) {
    if (otc === null) {
        clean();
        setup();
    }

    return new Promise((resolve, reject) => {
        otc.once(`result:${cmdArg}`, result => {
            cleanTimeout();

            if (result.code === 0) {
                resolve(result);
            } else {
                let err = new Error(result.message);
                err.code = result.code;
                reject(err);
            }
        });

        timeout = setTimeout(() => {
            timeout = null;
            let errorCode = DEF.OT_ERROR_CODE.OtCtlTimeout;
            let errorMsg = DEF.OT_ERROR_MESSAGE[errorCode];

            otc.emit(`result:${cmdArg}`, { code: errorCode, message: errorMsg });
        }, 10000);

        // launch command
        if (cmdArg === 'factoryreset') {
            var ootc = otc;
            setTimeout(() => {
                ootc.emit(`result:${cmdArg}`, { code: 0, lines: [''] });
            }, 2000);
        }

        otc.stdin.write(`${cmdArg}\n`);
    });
};

/********************************************************************************************/
/** Private Functions                                                                      **/
/********************************************************************************************/
function setup() {
    otc = spawn('sudo', [ 'ot-ctl' ]);

    otc.stdout.on('data', data => {
        stdoutText = stdoutText + data.toString();
        let msg = extractMessage(stdoutText);
        let doneToken = '> ';

        if (msg.cmd === 'scan') {
            if (stdoutText.endsWith('Done\r\n')) {
                otc.emit(`result:${msg.cmd}`, msg);
                stdoutText = '';
            }
        } else if (stdoutText.endsWith('> ')  && stdoutText !== '> ') {    // prompt token: '> '
            otc.emit(`result:${msg.cmd}`, msg);
            stdoutText = '';
        }
    });

    otc.stderr.on('data', (data) => {
        if (!data.toString().includes('not running'))
            throw new Error(data);
    });

    otc.on('close', code => {
        clean();
        setup();
    });
}

function clean() {
    cleanTimeout();
    stdoutText = '';
    otc = null;
}

function cleanTimeout() {
    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = null;
}

function extractMessage(text) {
    let cmd = text.slice(0, text.indexOf('\n'));
    let rxText = text.slice(text.indexOf('\n') + 1);    // take prompt off
    let result = {
        code: 0,
        message: DEF.OT_ERROR_MESSAGE['0'],
        cmd: cmd.startsWith('> ') ? cmd.slice(2) : cmd,
        lines: null
    };

    if (rxText.startsWith('Error ')) {                  // Error token: 'Error '
        let errorCode = rxText.slice(6, rxText.indexOf(':'));
        result.code = parseInt(errorCode);
        result.message = DEF.OT_ERROR_MESSAGE[errorCode];
    } else {
        let lines = rxText.split(/\r?\n/);
        result.lines = removeInvalidLastLine(lines);
    }

    return result;
}

function removeInvalidLastLine(lines) {
    let lastLine = lines[lines.length - 1];
    let isInvalid = (lastLine === '' || lastLine.startsWith('Done') || lastLine.startsWith('> '));

    while (isInvalid) {
        lines.pop();
        if (lines.length === 0)
            break;
            
        lastLine = lines[lines.length - 1];
        isInvalid = (lastLine === '' || lastLine.startsWith('Done') || lastLine.startsWith('> '));
    }
    return lines;
}

module.exports = otExec;
