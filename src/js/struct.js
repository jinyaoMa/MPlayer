import { D_COLOR, D_LOOP, D_ORDER, D_PRELOAD, D_AUDIO_TYPE, D_LRC_TYPE } from "./define";

export const S_AUDIO = audios => {
  let result = [];
  if (audios instanceof Array) {
    audios.forEach(a => {
      result.push(Object.assign({
        name: MPLAYER_ALIAS,
        artist: MPLAYER_AUTHOR,
        url: '',
        cover: '',
        lrc: '',
        theme: D_COLOR.MAIN,
        type: D_AUDIO_TYPE.AUTO
      }, a));
    });
  } else if (audios instanceof Object) {
    result.push(Object.assign({
      name: MPLAYER_ALIAS,
      artist: MPLAYER_AUTHOR,
      url: '',
      cover: '',
      lrc: '',
      theme: D_COLOR.MAIN,
      type: D_AUDIO_TYPE.AUTO
    }, audios));
  }
  return result;
};

export const S_VOLUME = volume => {
  return volume <= 1 && volume >= 0 ? volume : 0.7;
};

export const S_OPTION = option => {
  return Object.assign({
    container: `#${MPLAYER_ALIAS}`,
    autoplay: false,
    theme: D_COLOR.MAIN,
    loop: D_LOOP.ALL,
    order: D_ORDER.LIST,
    preload: D_PRELOAD.NONE,
    volume: S_VOLUME(),
    audio: S_AUDIO(),
    mutex: true,
    lrcType: D_LRC_TYPE.AUTO,
    listFolded: false,
    listMaxHeight: 0,
    storageName: `${MPLAYER_ALIAS}-Settings`
  }, option);
};