const { execFile } = require('child_process');
const DEF = require('./def.js');

var otExec = function () {
    
    return new Promise((resolve, reject) => {
        let cmdArgs = [ 'ot-ctl', ...arguments ];
        let cmd = cmdArgs[1];
    
        execFile('sudo', cmdArgs, (err, stdout, stderr) => {
            if (err || stderr) {
                // console.log(`err: ${err}`);
                // console.log(`stderr: ${stderr}`);
                reject(new Error(err || stderr));
            } else {
                //console.log(`stdout: ${stdout}`);
                let result = extractMessage(stdout);
                result.cmd = cmd;
                resolve(result);
            }
        });
    });
};

function extractMessage(text) {
    let result = {
        code: 0,
        message: DEF.OT_ERROR_MESSAGE['0'],
        cmd: '',
        lines: null
    };

    if (text.startsWith('Error ')) {                        // Error token: 'Error '
        let errorCode = text.slice(6, text.indexOf(':'));
        result.code = parseInt(errorCode);
        result.message = DEF.OT_ERROR_MESSAGE[errorCode];
    } else {
        result.lines = trimLines(text.split(/\r?\n/));
    }

    return result;
}

function trimLines(lines) {
    let lastLine = lines[lines.length - 1];
    let isLastLineUseless = function (line) {
        return (line === '' || line === 'Done')
    };
    
    while (isLastLineUseless(lastLine)) {
        lines.pop();
        lastLine = lines[lines.length - 1];
    }

    return lines;
}

module.exports = otExec;
