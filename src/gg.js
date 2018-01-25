const { spawn, exec } = require('child_process');
var fs = require("fs");
var path = require("path");
var async = require("async");
var colors = require("colors");

function shell(command, cwd, cb){
    var p = exec(command, {
        cwd: cwd
    }, cb);
}

function getBranch(cwd, cb){
    shell("git rev-parse --abbrev-ref HEAD", cwd, function(error, stdout, stderr){
        if(error){
            return cb(error, null);
        }
        return cb(null, stdout.trim());

        var myRegexp = /On branch (.+)/g;
        var match = myRegexp.exec(stdout);
        if(match == null || match.length < 2){
            return cb("bad output", null);
        }
        cb(null, match[1]);
    });
}

if(process.argv.length <= 2){
    var p = spawn("git", ["status"], {
        stdio: "inherit"
    });
    p.on( 'close', code => {
        process.exit(code);
    });
}else{
    var pattern = process.argv[2];
    var dirs = fs.readdirSync(".").filter(f => {
        try{
            return fs.statSync(path.join(".", f)).isDirectory() &&
                f.startsWith(pattern);
        }catch(e){
            return false;
        }
    });
    async.eachSeries(dirs, function iteratee(dir, callback) {
        getBranch(dir, function(error, branch){
            if(error == null){
                console.log(dir.green + " -> " + branch.blue);
            }
            callback();
        });
    });
}
