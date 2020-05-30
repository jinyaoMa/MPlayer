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

const storage = {
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
};

export default {
  checkArgument,
  checkArgumentMultiType,
  storage
};