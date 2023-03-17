//const { optionsFromArguments } = require("tone");

const hightBuffer = 15;
const widthBuffer = 15;

//gasのURL
const sheetUrl =
  "https://script.google.com/macros/s/AKfycbwqZysJBhBTm52wspR66XBc0JgRKB2IV6Ma4jr-SNFN2buoLNeCrBXHdOrjTsZWWYk9CA/exec";

//let groupNameField;
let groupName; //groupNameには作成したgroupIDを入れる

//シートの最後の行番号
let lastRow = 1;

//スピーカーマークの画像の変数
let speakerImg = null;

const soundName = ["テスト"];

let soundData = [];
let BGM = [];
let BGMNumber = 0;
let hotalBGM;

let is_fetchButtonData_activated = false;

//音量
let BGMVolume = 1.0;
let SEVolume = 1.0;

//現在の時刻用変数
let dObj;

//p2p周りの変数
var peer,
  thisid = "",
  conn,
  text,
  send,
  ison = false,
  lasttext = "";
let id2;
let copyButton;

//文字数カウントあたりの変数
let sampleCheckButton;
var is_textCounter_activated = false;
var is_sampleCheck_activated = false;
var word;

let flag_fetch = false; //fetchしてるかしてないか判定するflag
let requestMode = 0;
let requestCounter = 0; //requestTextCountを呼んだ回数の保存用の変数

let eachTextCount = 0; //一定期間ごとの発話数
let totalCount = 0; //更新後のこれまでの総発話数
let preTotalCount = 0; //更新前のこれまでの総発話数

var sampleCount = 225; //各グループ毎で基準を補正するためのサンプル用変数(前回の実験から算出)
var sampleCount_Start = 0; //サンプルチェック開始時点の発話総数
let sampleCount_End = 0; //サンプルチェック終了時点の発話総数
let nowTextCount = 0;

let slowMode = false; //BGMのテンポのモード

let BGMPlayButton;
let is_BGMPlay_activated = false;
let BGMVolumeSlider;
let SEPlayButton;
let is_SEPlay_activated = false;
let SEVolumeSlider;
let BGMChangeButton;
let is_BGMChange_activated = false;
let BGMChangeIntervalSelectBox;
let BGMChangeBenchmarkSelectBox; //基準数と発話数を比較した時の差の範囲を設定するためのもの
let BGMChangeBenchmark_lowValue;
let BGMChangeBenchmark_highValue;

let requestTextCountIntervalID; //requestTextCountをsetIntervalするときのID
let hotalFlag = false; //蛍の光自動挿入機能をつけるかつけないか

//蛍の光タイマー周りの変数
let hotalTimerField_hour;
let hotalTimerValue_hour = 0;
let hotalTimerField_min;
let hotalTimerValue_min = 0;
//let hotalTimerField_sec;
//let hotalTimerValue_sec = 0;

let hotalTimerButton_OnOff;
let hotalTimer_isOn = false;

let hotalTimerID;
let is_hotalBGM_played = false;

//test用ボタン
let testButton;

//音声ファイル事前読み込み
function preload() {
  //0~4はゆったり１
  soundData[0] = loadSound("assets/ureshii_1.mp3");
  soundData[1] = loadSound("assets/kanashimi_1.mp3");
  soundData[2] = loadSound("assets/booing_1.mp3");
  soundData[3] = loadSound("assets/hakushu_1.mp3");
  soundData[4] = loadSound("assets/kanpai_1.mp3");
  soundData[5] = loadSound("assets/ureshii_2.mp3");
  soundData[6] = loadSound("assets/kanashimi_2.mp3");
  soundData[7] = loadSound("assets/booing_2.mp3");
  soundData[8] = loadSound("assets/hakushu_2.mp3");
  soundData[9] = loadSound("assets/kanpai_2.mp3");
  soundData[10] = loadSound("assets/ureshii_3.mp3");
  soundData[11] = loadSound("assets/kanashimi_3.mp3");
  soundData[12] = loadSound("assets/booing_3.mp3");
  soundData[13] = loadSound("assets/hakushu_3.mp3");
  soundData[14] = loadSound("assets/kanpai_3.mp3");

  //soundData[5] = loadSound("assets/hakushu_2.mp3");
  BGM[0] = loadSound("assets/Heart Break_108.mp3");
  BGM[1] = loadSound("assets/Heart Break_88.mp3");
  BGM[2] = loadSound("assets/Heart Break_128.mp3");
  hotalBGM = loadSound("assets/hotal.mp3");

  speakerImg = loadImage("image/speaker.png");
}

function setup() {
  createCanvas(800, 400);

  //groupNameField = createInput("");
  //groupNameField.position(100 + widthBuffer, 2 + hightBuffer);

  //let FetchButtonDataOnOffButton = createButton("off");
  //FetchButtonDataOnOffButton.position(120 + widthBuffer, 65 + hightBuffer);
  //FetchButtonDataOnOffButton.mouseClicked(toggleFetchButtonData);

  // soundVolumeSlider = createSlider(0, 2, 1, 0.1);
  // soundVolumeSlider.position(130 + widthBuffer, 100 + hightBuffer);

  //let button1 = createButton("test");
  //button1.mousePressed(fetchButtonData);

  //p2pのためのID取得周りの処理
  copyButton = createButton("IDをコピー");
  copyButton.position(0 + widthBuffer, 30 + hightBuffer);
  copyButton.mouseClicked(function () {
    copyToClipboard(thisid);
  });

  //基準数チェック周りの処理
  sampleCheckButton = createButton("基準数を再計測");
  sampleCheckButton.position(320 + widthBuffer, 210 + hightBuffer);
  sampleCheckButton.mouseClicked(function () {
    SampleCheck();
    setTimeout(SampleCheck, 180000); //3分
  });

  //効果音（ON/OFF）ボタン周りの処理
  SEPlayButton = createButton("OFF");
  SEPlayButton.position(60 + widthBuffer, 62 + hightBuffer);
  SEPlayButton.style("background", "#808080");
  SEPlayButton.mouseClicked(toggleSEPlay);

  //効果音の音量調節用スライダー周りの処理
  SEVolumeSlider = createSlider(0, 2, 1, 0.1);
  SEVolumeSlider.position(150 + widthBuffer, 62 + hightBuffer);
  SEVolumeSlider.input(changedSESlider);

  //BGM（ON/OFF）ボタン周りの処理
  BGMPlayButton = createButton("OFF");
  BGMPlayButton.position(60 + widthBuffer, 92 + hightBuffer);
  BGMPlayButton.style("background", "#808080");
  BGMPlayButton.mouseClicked(toggleBGMPlay);

  //BGMの音量調節用スライダー周りの処理
  BGMVolumeSlider = createSlider(0, 2, 1, 0.1);
  BGMVolumeSlider.position(150 + widthBuffer, 92 + hightBuffer);
  BGMVolumeSlider.input(changedBGMSlider);

  //BGM自動変更機能周りの処理
  BGMChangeButton = createButton("OFF");
  BGMChangeButton.position(170 + widthBuffer, 122 + hightBuffer);
  BGMChangeButton.style("background", "#808080");
  BGMChangeButton.mouseClicked(toggleBGMChange);

  setBGMChangeIntervalSelectBox();
  setBGMChangeBenchmarkSelectBox();
  BGMChangeBenchmark_lowValue =
    1.0 - Number(BGMChangeBenchmarkSelectBox.value()) / 100;
  BGMChangeBenchmark_highValue =
    1.0 + Number(BGMChangeBenchmarkSelectBox.value()) / 100;

  //蛍の光タイマー周りの処理
  crateHotalTimerField();

  hotalTimerButton_OnOff = createButton("OFF");
  hotalTimerButton_OnOff.style("background", "#808080");
  hotalTimerButton_OnOff.mouseClicked(toggleHotalTimer_OnOff);
  hotalTimerButton_OnOff.style("width", "50px");
  hotalTimerButton_OnOff.position(640 + widthBuffer, 152 + hightBuffer);

  /*hotalTimerButton_stop = createButton("stop");
  hotalTimerButton_stop.mouseClicked(function () {
    if (hotalBGM.isPlaying()) {
      hotalBGM.stop();
    } else {
      return;
    }
  });
  hotalTimerButton_stop.style("width", "50px");
  hotalTimerButton_stop.position(650 + widthBuffer, 152 + hightBuffer);*/

  //p2p周りの処理
  generateId();
  listenReceiveEvent();

  /*testButton = createButton("test");
  testButton.mouseClicked(changeColor);
  testButton.style("background", "#cc0000");*/
}

function draw() {
  background(255);
  strokeWeight(5);
  stroke(22, 22, 102);
  rect(3, 3, 790, 260, 30);
  strokeWeight(1);

  dObj = new Date();

  stroke(0);
  textSize(18);
  text("グループID：" + thisid, 0 + widthBuffer, 20 + hightBuffer);
  //groupName = groupNameField.value();

  //soundVolume = soundVolumeSlider.value();
  //text("ボリューム:" + soundVolume, 0 + widthBuffer, 115 + hightBuffer);
  // soundData[0].setVolume(soundVolume);

  text("効果音", 0 + widthBuffer, 80 + hightBuffer);
  text("BGM", 0 + widthBuffer, 110 + hightBuffer);
  text("BGM自動変更機能", 0 + widthBuffer, 140 + hightBuffer);
  text("変更間隔(分)", 60 + widthBuffer, 170 + hightBuffer);
  text("基準数との差", 60 + widthBuffer, 200 + hightBuffer);
  text("で変更", 235 + widthBuffer, 200 + hightBuffer);
  text(
    "基準となる発話数：" + sampleCount + " 語/分",
    60 + widthBuffer,
    230 + hightBuffer
  );

  text("蛍の光タイマー", 500 + widthBuffer, 170 + hightBuffer);

  text(
    "現在の発話数：" + nowTextCount + "語",
    500 + widthBuffer,
    100 + hightBuffer
  );

  image(speakerImg, 120 + widthBuffer, 62 + hightBuffer, 20, 20);
  image(speakerImg, 120 + widthBuffer, 92 + hightBuffer, 20, 20);

  //蛍の光タイマーの表示
  drawHotalTimer();

  if (is_BGMPlay_activated == false) {
    //”bgmなし”だったら全部の再生をとめる
    if (checkPlaying()) {
      for (i = 0; i < BGM.length; i++) {
        BGM[i].stop();
      }
    }
  } else if (is_BGMPlay_activated == true) {
    if (!checkPlaying()) {
      BGM[BGMNumber].setVolume(BGMVolume);
      BGM[BGMNumber].play();
      /*if (slowMode == false) {
        BGM[0].setVolume(BGMVolume);
        BGM[0].play();
      } else {
        BGM[1].setVolume(BGMVolume);
        BGM[1].play();
      }*/
    }
  }

  // console.log(hotalTimerField_sec.value());
}

function getTimeStr(dObj) {
  hours = dObj.getHours();
  minutes = dObj.getMinutes();
  seconds = dObj.getSeconds();
  miliSeconds = dObj.getMilliseconds();

  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;
  if (miliSeconds < 10) {
    miliSeconds = "00" + miliSeconds;
  } else if (miliSeconds < 100) {
    miliSeconds = "0" + miliSeconds;
  }
  var str = hours + ":" + minutes + ":" + seconds + ":" + miliSeconds;
  return str;
}

function copyToClipboard(tagValue) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(tagValue);
  } else {
    tagText.select();
    document.execCommand("copy");
    messageActive();
  }
}

function generateId() {
  peer = new Peer();
  peer.on("open", () => {
    thisid = peer.id;
    console.log(thisid);
  });
}

function listenReceiveEvent() {
  if (!peer) return;

  let buttonNumber;
  peer.on("connection", function (connection) {
    connection.on("open", function () {
      // here you have conn.i
      connection.on("data", function (data) {
        if (is_SEPlay_activated) {
          if (!isNaN(data)) {
            buttonNumber = data;
            soundData[buttonNumber].play();
          }
          //console.log("Received", data);
        } else {
          return;
        }
      });
    });

    conn = connection;
  });
}

function requestTextCount(requestMode) {
  flag_fetch = true;
  //requestCounter++;
  //textCount = 0;
  //document.getElementById("label_textCount").innerHTML = "counting...";
  let params = {
    groupName: thisid,
    requestMode: requestMode,
    BGMNumber: BGMNumber,
  };
  let query = new URLSearchParams(params).toString();
  fetch(sheetUrl + "?" + query)
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      switch (requestMode) {
        case 0:
          totalCount = 0;
          for (i = 0; i < data.length; i++) {
            totalCount += data[i].totalCount;
          }
          console.log("BGM自動変更開始(" + shapingDate(dObj) + ")");
          flag_fetch = false;
          break;
        case 1:
          preTotalCount = totalCount;
          totalCount = 0;
          for (i = 0; i < data.length; i++) {
            totalCount += data[i].totalCount;
          }
          eachTextCount = totalCount - preTotalCount;
          nowTextCount = eachTextCount;
          console.log(
            "この周期の発話数：" +
              eachTextCount +
              ", ここまでのBGM：" +
              BGMNumber
          );
          compEachTextCount();
          flag_fetch = false;
          break;
      }
    });
}

function SampleCheck() {
  //flag_fetch = true;
  //requestCounter++;
  //textCount = 0;
  //document.getElementById("label_textCount").innerHTML = "counting...";

  if (is_sampleCheck_activated == false) {
    sampleCount = "計測中";
  }

  let params = {
    groupName: thisid,
    requestMode: "sampleCheck",
  };
  let query = new URLSearchParams(params).toString();
  fetch(sheetUrl + "?" + query)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (is_sampleCheck_activated == false) {
        sampleCount_Start = 0;
        for (i = 0; i < data.length; i++) {
          sampleCount_Start += data[i].totalCount;
        }
        is_sampleCheck_activated = !is_sampleCheck_activated;
      } else {
        sampleCount_End = 0;
        for (i = 0; i < data.length; i++) {
          sampleCount_End += data[i].totalCount;
        }
        sampleCount = (sampleCount_End - sampleCount_Start) / 3; //3分測って1分の平均を出す
        is_sampleCheck_activated = !is_sampleCheck_activated;
      }
    });
}

function testReceiveTextCount() {
  requestTextCount();
}

function changeColor() {
  this.style("color", "#00ff00");
}

function toggleBGMPlay() {
  is_BGMPlay_activated = !is_BGMPlay_activated;
  if (is_BGMPlay_activated) {
    BGMPlayButton.style("background", "#00ff00");
    BGMPlayButton.html("ON");
  } else {
    BGMPlayButton.style("background", "#808080");
    BGMPlayButton.html("OFF");
    BGMNumber = 0;
  }
}

function toggleSEPlay() {
  is_SEPlay_activated = !is_SEPlay_activated;
  if (is_SEPlay_activated) {
    SEPlayButton.style("background", "#00ff00");
    SEPlayButton.html("ON");
  } else {
    SEPlayButton.style("background", "#808080");
    SEPlayButton.html("OFF");
  }
}

function toggleBGMChange() {
  is_BGMChange_activated = !is_BGMChange_activated;

  if (is_BGMChange_activated) {
    requestMode = 0;
    requestTextCount(requestMode);
    requestMode = 1;
    requestTextCountIntervalID = setInterval(function () {
      requestTextCount(requestMode);
    }, Number(BGMChangeIntervalSelectBox.value()) * 60000);
    BGMChangeButton.style("background", "#00ff00");
    BGMChangeButton.html("ON");
  } else {
    clearInterval(requestTextCountIntervalID);
    requestMode = 0;
    BGMNumber = 0;
    BGMChangeButton.style("background", "#808080");
    BGMChangeButton.html("OFF");
  }
}

//bgmがその時かかっているかチェックする関数（かかっていればtrue）
function checkPlaying() {
  //let count = 0;
  let state;
  if (
    BGM[0].isPlaying() == true ||
    BGM[1].isPlaying() == true ||
    BGM[2].isPlaying() == true
  ) {
    state = true;
  } else {
    state = false;
  }
  return state;
}

/*function toggleHotalTimer_set() {
  hotalTimerButton_set_isOn = !hotalTimerButton_set_isOn;
  if (hotalTimerButton_set_isOn) {
    this.html("reset");

    hotalTimerValue_hour = hotalTimerField_hour.value();
    hotalTimerValue_min = hotalTimerField_min.value();
    //hotalTimerValue_sec = hotalTimerField_sec.value();
    hotalTimerField_hour.remove();
    hotalTimerField_min.remove();
    //hotalTimerField_sec.remove();
  } else {
    this.html("set");
    crateHotalTimerField();
  }
}*/

function toggleHotalTimer_OnOff() {
  hotalTimer_isOn = !hotalTimer_isOn;

  if (hotalTimer_isOn) {
    let setTime = new Date();
    setTime.setSeconds(0);
    setTime.setMilliseconds(0);

    hotalTimerButton_OnOff.html("ON");
    hotalTimerButton_OnOff.style("background", "#00ff00");
    hotalTimerValue_hour = hotalTimerField_hour.value();
    hotalTimerValue_min = hotalTimerField_min.value();
    hotalTimerField_hour.remove();
    hotalTimerField_min.remove();

    if (hotalTimerValue_hour < setTime.getHours()) {
      setTime.setDate(setTime.getDate() + 1);
    }
    setTime.setHours(hotalTimerValue_hour);
    setTime.setMinutes(hotalTimerValue_min);

    hotalTimerID = setInterval(function () {
      let nowTime = new Date();
      if (!is_hotalBGM_played) {
        //console.log(setTime.getTime() <= nowTime.getTime());
        if (setTime.getTime() <= nowTime.getTime()) {
          is_hotalBGM_played = true;
          if (checkPlaying()) {
            stopBGM();
          }
          setTimeout(hotalBGM.play(), 5000);
        }
      } else {
        return;
      }
    }, 1000);
  } else {
    hotalTimerButton_OnOff.style("background", "#808080");
    hotalTimerButton_OnOff.html("OFF");
    is_hotalBGM_played = false;
    if (hotalTimerID != null) {
      clearInterval(hotalTimerID);
    }
    if (hotalBGM.isPlaying()) {
      hotalBGM.stop();
    }
    crateHotalTimerField();
  }
}

function drawHotalTimer() {
  let width = 640 + widthBuffer;
  let hight = 210 + hightBuffer;

  let timeValue = [
    hotalTimerValue_hour,
    hotalTimerValue_min,
    //hotalTimerValue_sec,
  ];

  textSize(30);
  for (i = 0; i < timeValue.length; i++) {
    if (timeValue[i] < 10) {
      timeValue[i] = "0" + timeValue[i];
    }
    text(timeValue[i], width + 60 * i, hight);
  }
  text(":", width + 47, hight);
  // text(":", width + 105, hight);
  //text(":", width + 90, hight);

  textSize(18);
}

function crateHotalTimerField() {
  hotalTimerField_hour = createInput(hotalTimerValue_hour);
  hotalTimerField_hour.position(640 + widthBuffer, 180 + hightBuffer);
  hotalTimerField_hour.style("width", "32px");
  hotalTimerField_hour.style("font-size", "30px");

  hotalTimerField_min = createInput(hotalTimerValue_min);
  hotalTimerField_min.position(700 + widthBuffer, 180 + hightBuffer);
  hotalTimerField_min.style("width", "32px");
  hotalTimerField_min.style("font-size", "30px");

  /*hotalTimerField_sec = createInput(hotalTimerValue_sec);
  hotalTimerField_sec.position(660 + widthBuffer, 180 + hightBuffer);
  hotalTimerField_sec.style("width", "32px");
  hotalTimerField_sec.style("font-size", "30px");*/
}

function compEachTextCount() {
  let base = sampleCount * Number(BGMChangeIntervalSelectBox.value());
  let result = eachTextCount / base;
  let preBGMNumber = BGMNumber;
  console.log("result=" + result);
  if (hotalFlag == false) {
    if (result < BGMChangeBenchmark_lowValue) {
      BGMNumber = 1; //遅い
    } else if (
      BGMChangeBenchmark_lowValue <= result &&
      result <= BGMChangeBenchmark_highValue
    ) {
      BGMNumber = 0; //普通
    } else if (BGMChangeBenchmark_highValue < result) {
      BGMNumber = 2; //速い
    }
  } else {
    if (0.1 < result && result < BGMChangeBenchmark_lowValue) {
      slowMode = true;
      BGMNumber = 1;
    } else if (result <= 0.1) {
      for (i = 0; i < BGM.length; i++) {
        BGM[i].setVolume(0, 5);
      }
      setTimeout(function () {
        if (checkPlaying()) {
          for (i = 0; i < BGM.length; i++) {
            BGM[i].stop();
          }
        }
        hotalBGM.play();
        toggleBGMPlay();
        toggleBGMChange();
      }, 5000);
    } else {
      BGMNumber = 0;
    }
  }

  if (BGMNumber != preBGMNumber) {
    for (i = 0; i < BGM.length; i++) {
      BGM[i].setVolume(0, 5);
    }

    setTimeout(function () {
      if (checkPlaying()) {
        for (i = 0; i < BGM.length; i++) {
          BGM[i].stop();
        }
      }
    }, 5000);
  }
}

function stopBGM() {
  for (i = 0; i < BGM.length; i++) {
    BGM[i].setVolume(0, 5);
  }
  setTimeout(function () {
    if (is_BGMPlay_activated) {
      toggleBGMPlay();
    }
    if (is_BGMChange_activated) {
      toggleBGMChange();
    }
  }, 5000);
}

function changedBGMSlider() {
  BGMVolume = 1.0 * BGMVolumeSlider.value();

  for (i = 0; i < BGM.length; i++) {
    BGM[i].setVolume(BGMVolume);
  }
  hotalBGM.setVolume(BGMVolume);
}

function changedSESlider() {
  SEVolume = 1.0 * SEVolumeSlider.value();
  for (i = 0; i < soundData.length; i++) {
    soundData[i].setVolume(SEVolume);
  }
}

function setBGMChangeIntervalSelectBox() {
  BGMChangeIntervalSelectBox = createSelect();
  BGMChangeIntervalSelectBox.position(180 + widthBuffer, 155 + hightBuffer);
  BGMChangeIntervalSelectBox.changed(function () {
    if (is_BGMChange_activated) {
      clearInterval(requestTextCountIntervalID);
      requestMode = 0;
      requestTextCount(requestMode);
      requestMode = 1;
      requestTextCountIntervalID = setInterval(function () {
        requestTextCount(requestMode);
      }, Number(BGMChangeIntervalSelectBox.value()) * 60000);
    } else {
      return;
    }
  });
  for (i = 1; i <= 60; i++) {
    BGMChangeIntervalSelectBox.option(i);
  }
}

function setBGMChangeBenchmarkSelectBox() {
  BGMChangeBenchmarkSelectBox = createSelect();
  BGMChangeBenchmarkSelectBox.position(180 + widthBuffer, 185 + hightBuffer);
  BGMChangeBenchmarkSelectBox.changed(function () {
    BGMChangeBenchmark_lowValue =
      1.0 - Number(BGMChangeBenchmarkSelectBox.value()) / 100;
    BGMChangeBenchmark_highValue =
      1.0 + Number(BGMChangeBenchmarkSelectBox.value()) / 100;
  });
  for (i = 0; i <= 5; i++) {
    let value = i * 10;
    BGMChangeBenchmarkSelectBox.option(value + "%", value);
  }
}

function shapingDate(dObj) {
  let str =
    dObj.getFullYear() +
    "/" +
    ("0" + (dObj.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + dObj.getDate()).slice(-2) +
    " " +
    ("0" + dObj.getHours()).slice(-2) +
    ":" +
    ("0" + dObj.getMinutes()).slice(-2) +
    ":" +
    ("0" + dObj.getSeconds()).slice(-2) +
    "(JST)";

  return str;
}
