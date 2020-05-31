import { D_DATA_TYPE } from "./define";

const checkArgument = (argument, type, errorType, hint) => {
  let flag = false;
  switch (type) {
    case D_DATA_TYPE.INTEGER:
      if (!Number.isInteger(argument)) flag = true;
      break;
    case D_DATA_TYPE.ARRAY:
      if (!(argument instanceof Array)) flag = true;
      break;
    case D_DATA_TYPE.ELEMENT:
      if (!(argument instanceof HTMLElement)) flag = true;
      break;
    default:
      if (typeof argument !== type) flag = true;
  }
  if (flag) throw new Error(`${errorType}, ${hint}`);
};

const checkArgumentMultiType = (argument, types, errorType, hint) => {
  if (types instanceof Array) {
    let flag = true;
    for (let i = 0; i < types.length; i++) {
      switch (types[i]) {
        case D_DATA_TYPE.INTEGER:
          if (Number.isInteger(argument)) flag = false;
          break;
        case D_DATA_TYPE.ARRAY:
          if (argument instanceof Array) flag = false;
          break;
        case D_DATA_TYPE.ELEMENT:
          if (argument instanceof HTMLElement) flag = false;
          break;
        default:
          if (typeof argument === types[i]) flag = false;
      }
    }
    if (flag) throw new Error(`${errorType}, ${hint}`);
  }
};

const storage = Object.freeze({
  get(key) {
    let value = window.localStorage.getItem(key);
    if (value) {
      try {
        value = JSON.parse(value);
      } catch (error) {
        if (!isNaN(value)) {
          value = parseFloat(value);
        }
      }
    }
    return value;
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      window.localStorage.setItem(key, value);
    }
  }
});

const getPlayerDom = player => {
  return {
    list: player.querySelector('.mplayer-list'),
    title: player.querySelector('.mplayer-title'),
    author: player.querySelector('.mplayer-author'),
    pic: player.querySelector('.mplayer-pic'),
    order: player.querySelector('.mplayer-icon-order'),
    loop: player.querySelector('.mplayer-icon-loop'),
    lrc: player.querySelector('.mplayer-lrc'),
    lrcContents: player.querySelector('.mplayer-lrc-contents'),
    iconLrc: player.querySelector('.mplayer-icon-lrc'),
    iconMenu: player.querySelector('.mplayer-icon-menu'),
    iconVolume: player.querySelector('.mplayer-icon-volume-down'),
    iconPlay: player.querySelector('.mplayer-icon-play'),
    button: player.querySelector('.mplayer-button'),
    iconBack: player.querySelector('.mplayer-icon-back'),
    iconForward: player.querySelector('.mplayer-icon-forward'),
    listItems: player.querySelectorAll('.mplayer-list-item'),
    ptime: player.querySelector('.mplayer-ptime'),
    dtime: player.querySelector('.mplayer-dtime'),
    played: player.querySelector('.mplayer-played'),
    loaded: player.querySelector('.mplayer-loaded'),
    thumb: player.querySelector('.mplayer-thumb'),
    bar: player.querySelector('.mplayer-bar'),
    loading: player.querySelector('.mplayer-loading-icon'),
    lrcScore: player.querySelector('.mplayer-lrc-score'),
    volumeBar: player.querySelector('.mplayer-volume-bar'),
    volume: player.querySelector('.mplayer-volume')
  }
};

const generateRandomIndexQueue = length => {
  let result = [];
  if (Number.isInteger(length)) {
    for (let i = 0; i < length; i++) {
      if (Math.floor(Math.random() * 2) === 0) {
        result.push(i);
      } else {
        result.unshift(i);
      }
    }
  }
  return result;
}

const parseLrc = lrc_s => {
  if (lrc_s) {
    lrc_s = lrc_s.replace(/([^\]^\n])\[/g, (match, p1) => p1 + '\n[');
    const lyric = lrc_s.split('\n');
    let lrc = [];
    const lyricLen = lyric.length;
    for (let i = 0; i < lyricLen; i++) {
      // match lrc time
      const lrcTimes = lyric[i].match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g);
      // match lrc text
      const lrcText = lyric[i]
        .replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g, '')
        .replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g, '')
        .replace(/^\s+|\s+$/g, '');

      if (lrcTimes) {
        // handle multiple time tag
        const timeLen = lrcTimes.length;
        for (let j = 0; j < timeLen; j++) {
          const oneTime = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(lrcTimes[j]);
          const min2sec = oneTime[1] * 60;
          const sec2sec = parseInt(oneTime[2]);
          const msec2sec = oneTime[4] ? parseInt(oneTime[4]) / ((oneTime[4] + '').length === 2 ? 100 : 1000) : 0;
          const lrcTime = min2sec + sec2sec + msec2sec;
          lrc.push([lrcTime, lrcText]);
        }
      }
    }
    // sort by time
    lrc = lrc.filter((item) => item[1]);
    lrc.sort((a, b) => a[0] - b[0]);
    return lrc;
  } else {
    return [];
  }
};

const fixDigit = num => {
  let result = num.toString();
  if (result.length === 1) {
    result = '0' + result;
  }
  return result;
};

const fixPrecentage = p => {
  let result = Math.max(p, 0);
  result = Math.min(result, 1);
  return (result * 100) + '%';
};

export default {
  checkArgument,
  checkArgumentMultiType,
  storage,
  getPlayerDom,
  generateRandomIndexQueue,
  parseLrc,
  fixDigit,
  fixPrecentage
};