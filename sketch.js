const heightBuffer = 15;
const widthBuffer = 15;


//gasのURL
const sheetUrl =
  "https://script.google.com/macros/s/AKfycbyOFBHAgXLui9lpUyoiKkJh0OJL4eRmk0NJFryLa-XCkOpm_R2nyblKgv15wlcHqVlu/exec?tag=1";


let groupNameField;
let groupName;


//シートの最後の行番号
let lastRow = 1;

const soundName = ["テスト"];

let soundData = [];

let is_fetchButtonData_activated = false;


//音声ファイル事前読み込み
function preload() {
  //0~4はゆったり１
  soundData[0] = loadSound("assets/test.wav");
  /*soundData[1]  = loadSound("mp3s/TheEntertainer_classical_piano_100.mp3");*/
}

function setup() {
  createCanvas(400, 400);
  
  groupNameField = createInput("");
  groupNameField.position(110 + widthBuffer, 10 + heightBuffer);
  
  let toggleFetchButtonData = createButton("off");
  toggleFetchButtonData.position(0 + widthBuffer, 40 + heightBuffer);
  
  let button1 = createButton("test");

 // button1.mousePressed(sendClickTiming.button1);
//fetchData();
 
}

function draw() {
  background(220);
}

let sendClickTiming = {
  button1: function () {
    fetch(sheetUrl + "&lastRow=" + lastRow)
      .then((response) => response.json())
      .then((data) => playSound(data));
  },
};

function fetchButtonData(){
   fetch(sheetUrl + "&lastRow=" + lastRow)
    .then((response) => response.json())
    .then((data) => takeInterval(data));
} 

function takeInterval(data){
  console.log(data);
  if(data[0].status == "changed"){
    playSound(data);
  }
  if(is_fetchButtonData_activated){
  setTimeout(fetchButtonData, 500)
  }
}

function playSound(data) {  
  lastRow = data[data.length-1].lastRow;
  for (let i = 0; i < data.length - 1; i++) {
    soundData[data[i].buttonNumber].play();
  }
}

function toggleFetchButtonData(){
  is_fetchButtonData_activated = !is_fetchButtonData_activated
  if(is_fetchButtonData_activated){
    fetchButtonData()
  }
}




