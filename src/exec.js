const childProcess = require('child_process')

module.exports = async function exec (log, command, cwd) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, { cwd: cwd || process.cwd() }, (err, stdout, stderr) => {
      if (stdout) log.debug(stdout)
      if (stderr) log.error(stderr)

      if (err) reject(err)
      else resolve()
    })
  })
}
