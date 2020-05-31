import LIST_ITEM from "../template/list-item.ejs";
import LRC from "../template/lrc.ejs";
import PLAYER from "../template/player.ejs";
import { S_LIST_ITEM, S_PLAYER } from "./struct";

export const T_LIST_ITEM = opt => {
  return LIST_ITEM(S_LIST_ITEM(opt));
};

export const T_LRC = lyrics => {
  return LRC(lyrics);
};

export const T_PLAYER = opt => {
  return PLAYER(Object.assign(S_PLAYER(opt), {
    T_LIST_ITEM
  }));
};

export default {
  T_LIST_ITEM, T_LRC, T_PLAYER
};