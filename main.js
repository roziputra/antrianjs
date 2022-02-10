const { app, BrowserWindow } = require('electron')
const { ipcRenderer } = require('electron')

const { dialog } = require('electron');
const { networkInterfaces } = require('os');

let server = require('./bin/www');

function createWindow() {
  let win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  const options = {
    type: 'info',
    buttons: ['OK'],
    title: 'Alamat Aplikasi',
    message: 'Aplikasi bisa diakses melalui alamat IP berikut: \n ' + getAddress(),
  };

  dialog.showMessageBoxSync(null, options, (response) => {
    console.log(response);
  });

  win.loadURL('http://localhost:3000');
  win.on('closed', function () {
    win = null
    app.quit()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function getAddress() {
  const nets = networkInterfaces();
  i = 0;
  let address = '';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4') {
        address = address + '\n http://' + net.address + ':3000';
      }
    }
  }
  return address;
}