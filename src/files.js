const fs = require('fs-extra')
const path = require('path')
const exec = require('./exec')

exports.fetchAndExtract = async (log, url, unzipDir, overwrite = true) => {
  const parsedPath = path.parse(new URL(url).pathname)
  const archiveFile = `downloads/${parsedPath.name}${parsedPath.ext}`
  const file = `downloads/${parsedPath.name}`
  // remove uncompressed result
  if (await fs.pathExists(file)) {
    if (overwrite) {
      await fs.remove(file)
    } else {
      console.log(`${file} already exists`)
      return file
    }
  }

  log.info(`download ${url}`)
  const ext = url.split('.').pop()
  // -N is for timestamping, so not re-fetching previous versions of the file
  // add --server-response occasionaly to debug output
  await exec(log, `wget -N -nv --no-check-certificate --retry-connrefused --waitretry=60 --timeout=120 -t 20 "${url}"`, process.cwd() + '/downloads/')
  log.info(`extract ${archiveFile} -> ${file}`)
  if (unzipDir) {
    await fs.ensureDir(file)
    await exec(log, `unzip ${archiveFile} -d ${file}`)
  } else if (ext === 'xz') {
    await fs.ensureDir(file)
    await exec(log, `tar -xJf ${archiveFile} -C ${file}`)
  } else if (ext === '001' || ext === '7z') {
    await exec(log, `7z x -bb0 -r ${archiveFile} -o${file}`)
  } else {
    await exec(log, `gunzip ${archiveFile}`)
  }
  return file
}

exports.fetch = async (log, url, dir = 'downloads', fileName, overwrite = true) => {
  await fs.ensureDir(`${dir}`)
  const parsedPath = path.parse(new URL(url).pathname)
  const file = `${dir}/${fileName || parsedPath.name + parsedPath.ext}`

  // remove previous result
  if (await fs.pathExists(file)) {
    if (overwrite) {
      await fs.remove(file)
    } else {
      log.info(`${file} already exists`)
      return file
    }
  }

  log.info(`download ${url} -> ${file}`)
  // -N is for timestamping, so not re-fetching previous versions of the file
  // add --server-response occasionaly to debug output
  let cmd = `wget -N -nv --no-check-certificate --retry-connrefused --waitretry=60 --timeout=120 -t 20 "${url}"`
  if (fileName) cmd += ` -O ${fileName}`
  await exec(log, cmd, `${process.cwd()}/${dir}/`)
  return file
}
