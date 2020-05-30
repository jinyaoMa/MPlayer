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
  AUTO: 'auto',
  HLS: 'hls',
  NORMAL: 'normal'
});

export const D_LRC_TYPE = Object.freeze({
  AUTO: 'auto',
  HTML: 'html',
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
  NOTICE_SHOW: 'noticeshow',
  NOTICE_HIDE: 'noticehide',
  DESTROY: 'destroy',
  LRC_SHOW: 'lrcshow',
  LRC_HIDE: 'lrchide'
});