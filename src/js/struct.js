import { D_COLOR, D_LOOP, D_ORDER, D_PRELOAD, D_AUDIO_TYPE, D_LRC_TYPE, D_ICON } from "./define";

export const S_SELECTOR = selector => {
  let result = document.querySelector(selector);
  if (result) {
    result = selector;
  } else {
    result = 'body';
  }
  return result;
};

export const S_AUTOPLAY = autoplay => {
  return !!autoplay;
};

export const S_THEME = theme => {
  let result = D_COLOR.MAIN;
  let regex0 = /^#[0-9a-f]{3,6}$/i;
  let regex1 = /^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)$/i;
  let regex2 = /^rgba\([0-9a-f]{3,6},[0-9]{1,3},[0-9]{1,3},[0-9\.]+\)$/i;
  let temp = theme && theme.trim && theme.trim();
  if (regex0.test(temp) || regex1.test(temp) || regex2.test(temp)) {
    result = temp.toLowerCase();
  }
  return result;
};

export const S_LOOP = loop => {
  let result = D_LOOP.ALL;
  if (Object.values(D_LOOP).includes(loop)) {
    result = loop;
  }
  return result;
};

export const S_ORDER = order => {
  let result = D_ORDER.LIST;
  if (Object.values(D_ORDER).includes(order)) {
    result = order;
  }
  return result;
};

export const S_PRELOAD = preload => {
  let result = D_PRELOAD.NONE;
  if (Object.values(D_PRELOAD).includes(preload)) {
    result = preload;
  }
  return result;
};

export const S_VOLUME = volume => {
  return volume <= 1 && volume >= 0 ? volume : 0.7;
};

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

export const S_LRC_TYPE = lrcType => {
  let result = D_LRC_TYPE.AUTO;
  if (Object.values(D_LRC_TYPE).includes(lrcType)) {
    result = lrcType;
  }
  return result;
};

export const S_LIST_FOLDED = listFolded => {
  return !!listFolded;
};

export const S_STORAGE_NAME = storageName => {
  let result = storageName && storageName.trim && storageName.trim();
  return result !== '' ? result : `${MPLAYER_ALIAS}-Settings`;
};

export const S_OPTIONS = option => {
  return {
    selector: S_SELECTOR(option.selector || `#${MPLAYER_ALIAS}`),
    autoplay: S_AUTOPLAY(option.autoplay || false),
    theme: S_THEME(option.theme || D_COLOR.MAIN),
    loop: S_LOOP(option.loop || D_LOOP.ALL),
    order: S_ORDER(option.order || D_ORDER.LIST),
    preload: S_PRELOAD(option.preload || D_PRELOAD.NONE),
    volume: S_VOLUME(option.volume || 0.7),
    audio: S_AUDIO(option.audio || []),
    lrcType: S_LRC_TYPE(option.lrcType || D_LRC_TYPE.AUTO),
    listFolded: S_LIST_FOLDED(option.listFolded || false),
    storageName: S_STORAGE_NAME(option.storageName || `${MPLAYER_ALIAS}-Settings`)
  };
};

export const S_PLAYER = option => {
  return Object.assign(option, {
    options: S_OPTIONS(option.options),
    cover: option.cover || null,
    D_ICON, D_ORDER, D_LOOP
  });
};

export const S_LIST_ITEM = option => {
  return {
    theme: S_THEME(option.theme),
    audio: S_AUDIO(option.audio)
  };
};

export default {
  S_SELECTOR, S_AUTOPLAY, S_THEME, S_LOOP, S_ORDER, S_PRELOAD,
  S_VOLUME, S_AUDIO, S_LRC_TYPE, S_LIST_FOLDED,
  S_STORAGE_NAME, S_OPTIONS, S_PLAYER, S_LIST_ITEM
};