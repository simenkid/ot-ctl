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
            console.log('called .....');
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

        if (stdoutText.endsWith('> ')  && stdoutText !== '> ') {    // prompt token: '> '
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
    let rxText = text.slice(text.indexOf('\n') + 1, -3);    // take prompt off and trim the tail
    let result = {
        code: 0,
        message: DEF.OT_ERROR_MESSAGE['0'],
        cmd: cmd.startsWith('> ') ? cmd.slice(2) : cmd,
        lines: null
    };

    if (rxText.startsWith('Error ')) {                                  // Error token: 'Error '
        let errorCode = rxText.slice(6, rxText.indexOf(':'));
        result.code = parseInt(errorCode);
        result.message = DEF.OT_ERROR_MESSAGE[errorCode];
    } else {
        let lines = rxText.split(/\r?\n/);
        let lastLine = lines[lines.length -1];

        if (lastLine === 'Done\r' || lastLine === '')   // if 'Done\r' or '' at the tail
            lines.pop();                                // drop it

        lastLine = lines[lines.length -1];
        if (lastLine === 'Done\r' || lastLine === '')   // check again: if 'Done\r' or '' at the tail
            lines.pop();                                // drop it

        result.lines = lines;
    }

    return result;
}

module.exports = otExec;
