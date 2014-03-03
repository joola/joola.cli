var
  colors = require('colour'),
  program = require('commander'),
  repl = require('repl'),
  prettyjson = require('prettyjson'),

  version = require('./package.json').version,
  joolaio = global.joolaio = require('joola.io.sdk');

program
  .version(version)
  .option('-h, --host [http://localhost:8080]', 'joola.io host (http://hostname:port)', 'http://localhost:8080')
  .option('-u, --username [username]', 'username for login with joola.io')
  .option('-p, --password [password]', 'password for login with joola.io')
  .option('-a, --apitoken [apitoken]', 'APIToken to use instead of username/password')

program
  .command('setup')
  .description('run remote setup commands')
  .action(function () {
    console.log('setup');
  });

program
  .command('exec <cmd>')
  .description('run the given remote command')
  .action(function (cmd) {
    console.log('exec "%s"', cmd);
  });

program
  .command('*')
  .description('deploy the given env')
  .action(function (env) {
    console.log('deploying "%s"', env);
  });

program.parse(process.argv);

console.log('joola.io-cli (' + version + ') starting...');
console.log('Connecting to joola.io @ ' + program.host + '...');

if (program.apitoken) {
  joolaio.init({APIToken: program.apitoken, host: program.host, debug: {enabled: false}}, function (err) {
    if (err)
      throw err;

    startCLI();
  });
}
else if (program.username && program.password) {
  joolaio.init({host: program.host, debug: {enabled: false}}, function (err) {
    if (err)
      throw err;

    joolaio.users.authenticate('joola', program.username, program.password, function (err, token) {
      if (err)
        throw err;
      joolaio.TOKEN = token;
      startCLI();
    });
  });
}
else {
  console.error('Autentication failed, no login details provided.');
  process.exit();
}


var startCLI = function () {
  console.log('Connected to joola.io.');
  var exit = function () {
    process.exit();
  };

  var quit = function () {
    process.exit();
  };

  var _repl = repl.start({
    prompt: 'joola.io @ ' + program.host.replace('http://', '').replace('https://', '') + ' > ',
    input: process.stdin,
    output: process.stdout,
    useGlobal: true,
    eval: function (cmd, context, filename, callback) {
      try {
        var result;
        if (cmd.indexOf('joolaio.') > -1) {
          var fn = function (err, result) {
            return callback(err, result);
            /*if (err)
             return process.stdout.write('Error: ' + err + '\n');

             return process.stdout.write(prettyjson.render(result) + '\n');*/
          };

          var inject = fn.toString();
          cmd = cmd.substring(1, cmd.length - 2).replace(')', ',' + inject + ')');
          eval(cmd);
        }
        else {
          result = eval(cmd);
          return callback(null, result);
        }

      }
      catch (ex) {
        if (typeof callback === 'function')
          return callback(ex);
        else {
          console.error(ex);
        }
      }
    }
  });
  require('repl.history')(_repl, 'joolaio_repl_history');
};