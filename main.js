const {app,BrowserWindow,Menu,ipcMain,shell} = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');


const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === "darwin";

let mainWindow;
//crete the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title:'Image Resizer',
        width: isDev?1000:500,
        height:600,
        webPreferences:{
            contextIsolation:true,
            nodeIntegration:true,
            preload:path.join(__dirname,'preload.js')
        }
    })

    //open devtools if in dev env
    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname,'./renderer/index.html'));
}

function createAboutWindow(){
    const Aboutwindow = new BrowserWindow({
        title:'Image Resizer',
        width: 300,
        height:300,
    })

       Aboutwindow.loadFile(path.join(__dirname,'./renderer/about.html'));
}

//meun template

const menu = [
    ...(isMac?[{label:app.name,submenu:[{label: 'About',click:createAboutWindow}]}]:[]),
    {
        role:'fileMenu',
    },
    ...(!isMac? [{label:'Help',submenu:[{label:'About',click:createAboutWindow}]}]:[])
]
//app in ready



app.whenReady().then(()=>{
    createMainWindow();

    //imaplement menu

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu)

    //remove main window
    mainWindow.on('closed',()=>(mainWindow=null));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
})

async function resizeImgage({imgPath,width,height,dest}){
try{
    const newPath = await resizeImg(fs.readFileSync(imgPath),{width:+width,height:+height});

    const filename= path.basename(imgPath);

    if(!fs.existsSync(dest)){
        fs.mkdirSync(dest);
    }
    fs.writeFileSync(path.join(dest,filename),newPath);

    mainWindow.webContents.send('image:done');

    shell.openPath(dest);
}catch(err){
    console.log(err)
}
}

ipcMain.on('image:resize',(e,options)=>{
    options.dest = path.join(os.homedir(),'imageresizer')
    resizeImgage(options);
})

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })

