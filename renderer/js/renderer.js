const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

const loadImage = (e) =>{
    const file = e.target.files[0];
    if(!isFileImage(file)){
        alertmsg("Please select an image",'red');
        return;
    }

    // get original dimasions

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    }

    form.style.display = 'block';
    filename.innerText =file.name;
    outputPath.innerText = path.join(os.homedir(),'imageresizer')
}
//send data to main
function sendImage(e){
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;
    if(!img.files[0]){
        alertmsg("Please upload an image",'red');
        return;
    }
    if(width === '' || height === ''){
        alertmsg('Please fill in a height and width',"red");
        return;
    }

    //send to main using ipcRenderer

    ipcRenderer.send('image:resize',{
        imgPath,
        width,
        height
    });

}

// /cath the image done event
ipcRenderer.on('image:done',()=>{
    alertmsg(`Image resized to ${widthInput.value} x ${heightInput.value}`,'green');
})

const isFileImage=  (file)=> {
    const acceptedImageTypes = ['image/gif','image/png','image/jpeg'];
    return file && acceptedImageTypes.includes(file['type']);
}

function alertmsg(message,col){
    Toastify.toast({
        text:message,
        duration:5000,
        close:false,
        style:{
            background:col,
            color:'white',
            textAlign:'center'
        }
    })
}

img.addEventListener('change',loadImage);
form.addEventListener('submit',sendImage);