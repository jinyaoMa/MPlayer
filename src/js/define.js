import LEFT from "../assets/left.svg";
import LOADING from "../assets/loading.svg";
import LOOP_ALL from "../assets/loop-all.svg";
import LOOP_NONE from "../assets/loop-none.svg";
import LOOP_ONE from "../assets/loop-one.svg";
import LRC from "../assets/lrc.svg";
import MENU from "../assets/menu.svg";
import ORDER_LIST from "../assets/order-list.svg";
import ORDER_RANDOM from "../assets/order-random.svg";
import PAUSE from "../assets/pause.svg";
import PLAY from "../assets/play.svg";
import RIGHT from "../assets/right.svg";
import SKIP_LEFT from "../assets/skip-left.svg";
import SKIP_RIGHT from "../assets/skip-right.svg";
import VOLUME_DOWN from "../assets/volume-down.svg";
import VOLUME_OFF from "../assets/volume-off.svg";
import VOLUME_UP from "../assets/volume-up.svg";

export const D_ICON = Object.freeze({
  LEFT, LOADING, LOOP_ALL, LOOP_NONE, LOOP_ONE, LRC,
  MENU, ORDER_LIST, ORDER_RANDOM, PAUSE, PLAY, RIGHT,
  SKIP_LEFT, SKIP_RIGHT, VOLUME_DOWN, VOLUME_OFF, VOLUME_UP
});

export const D_COLOR = Object.freeze({
  MAIN: '#ff3300'
});

export const D_LOOP = Object.freeze({
  ALL: 'all',
  ONE: 'one',
  NONE: 'none'
});

export const D_ORDER = Object.freeze({
  LIST: 'list',
  RANDOM: 'random'
});

export const D_PRELOAD = Object.freeze({
  NONE: 'none',
  METADATA: 'metadata',
  AUTO: 'auto'
});

export const D_AUDIO_TYPE = Object.freeze({
  AUTO: 'auto'
});

export const D_LRC_TYPE = Object.freeze({
  AUTO: 'auto',
  JS: 'js',
  FILE: 'file'
});

export const D_DATA_TYPE = Object.freeze({
  BOOLEAN: 'boolean',
  STRING: 'string',
  FUNCTION: 'function',
  OBJECT: 'object',
  NUMBER: 'number',
  INTEGER: 'integer',
  ARRAY: 'array',
  ELEMENT: 'element'
});

export const D_ERROR_TYPE = Object.freeze({
  INVALID_ARGUMENTS: 'invalid arguments',
  CONTAINER_NOT_FOUND: 'container not found'
});

export const D_PLAYER_EVENT = Object.freeze({
  LIST_SHOW: 'listshow',
  LIST_HIDE: 'listhide',
  LIST_ADD: 'listadd',
  LIST_REMOVE: 'listremove',
  LIST_SWITCH: 'listswitch',
  LIST_CLEAR: 'listclear',
  DESTROY: 'destroy',
  LRC_SHOW: 'lrcshow',
  LRC_HIDE: 'lrchide'
});

export default {
  D_COLOR, D_LOOP, D_ORDER, D_PRELOAD, D_AUDIO_TYPE,
  D_LRC_TYPE, D_DATA_TYPE, D_ERROR_TYPE, D_PLAYER_EVENT, D_ICON
};