const packager = require('electron-packager');

packager({
    afterPrune: [serialHooks([
      (buildPath, electronVersion, platform, arch, callback) => {
        setTimeout(() => {
          console.log('first function')
          callback()
        }, 1000)
      },
      (buildPath, electronVersion, platform, arch, callback) => {
        console.log('second function')
        callback()
      }
    ])],
    // ...
  })