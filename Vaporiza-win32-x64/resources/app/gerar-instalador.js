var electronInstaller = require('electron-winstaller');

var settings = {
    appDirectory: './AppNome-win32-x64',
    outputDirectory: './AppNome-win32-x64/windows-installer',
    authors: 'Bruno Santos',
    exe: './AppNome.exe'
};

resultPromise = electronInstaller.createWindowsInstaller(settings);
 
resultPromise.then(() => {
    console.log("O instalador foi criado");
}, (e) => {
    console.log(`Deu ruim: ${e.message}`)
});