import DEFINE, {
  D_COLOR, D_LOOP, D_ORDER, D_PRELOAD, D_AUDIO_TYPE, D_LRC_TYPE,
  D_DATA_TYPE, D_ERROR_TYPE, D_PLAYER_EVENT, D_ICON
} from "./define";
import STRUCT, {
  S_SELECTOR, S_AUTOPLAY, S_THEME, S_LOOP, S_ORDER, S_PRELOAD,
  S_VOLUME, S_AUDIO, S_LRC_TYPE, S_LIST_FOLDED,
  S_STORAGE_NAME, S_OPTIONS, S_PLAYER, S_LIST_ITEM
} from "./struct";
import TEMPLATE, {
  T_LIST_ITEM, T_LRC, T_PLAYER
} from "./template";
import util from "./util";

class MPlayer {

  static get version() {
    return MPLAYER_VERSION;
  }

  constructor(options = {}) {
    this.options = S_OPTIONS(options);
    this.lrc = {
      show: this.showLrc,
      hide: this.hideLrc,
      toggle: this.toggleLrc
    };
    this.list = {
      show: this.showList,
      hide: this.hideList,
      toggle: this.toggleList,
      add: this.addToList,
      remove: this.removeFromList,
      switch: this.switchInList,
      clear: this.clearList
    };
    this.listener = {};
    for (const key in D_PLAYER_EVENT) {
      this.listener[D_PLAYER_EVENT[key]] = o => { };
    }
    this.init();
  }

  init() {
    this.audio = new Audio();
    this.audio.preload = this.options.preload;
    this.container = document.querySelector(this.options.selector);
    this.player = document.createElement('div');
    this.player.className = 'mplayer';
    this.player.innerHTML = T_PLAYER({
      options: this.options
    });
    this.container.appendChild(this.player);
    this.bindPlayer(this.player);
    this.bindAudio();
    // Template Ready

    let save = util.storage.get(this.options.storageName);
    if (save) {
      this.setVolume(save.volume);
      switch (save.order) {
        case D_ORDER.LIST:
          this._doms.order.innerHTML = D_ICON.ORDER_LIST;
          this.options.order = D_ORDER.LIST;
          break;
        case D_ORDER.RANDOM:
          this._doms.order.innerHTML = D_ICON.ORDER_RANDOM;
          this.options.order = D_ORDER.RANDOM;
          break;
      }
      switch (save.loop) {
        case D_LOOP.ALL:
          this._doms.loop.innerHTML = D_ICON.LOOP_ALL;
          this.options.loop = D_LOOP.ALL;
          break;
        case D_LOOP.ONE:
          this._doms.loop.innerHTML = D_ICON.LOOP_ONE;
          this.options.loop = D_LOOP.ONE;
          break;
        case D_LOOP.NONE:
          this._doms.loop.innerHTML = D_ICON.LOOP_NONE;
          this.options.loop = D_LOOP.NONE;
          break;
      }
    } else {
      this.setVolume(this.options.volume);
    }

    this._doms.list.style.height = this._doms.list.offsetHeight + 'px';
    this.currentIndex = 0;
    this.backwardStack = [];
    this.forwardStack = [];
    this.parsed = [];
    this.randCount = 0;
    this.randomIndexQueue = util.generateRandomIndexQueue(this.options.audio.length);
    switch (this.options.order) {
      case D_ORDER.LIST:
        this.switchInList(this.currentIndex);
        this._doms.order.innerHTML = D_ICON.ORDER_LIST;
        break;
      case D_ORDER.RANDOM:
        this.currentIndex = this.randomIndexQueue.shift();
        this.switchInList(this.currentIndex);
        this.randomIndexQueue.push(this.currentIndex);
        this._doms.order.innerHTML = D_ICON.ORDER_RANDOM;
        break;
    }
    if (this.options.autoplay) {
      this.play();
    }
  }

  bindPlayer(player) {
    util.checkArgument(player, D_DATA_TYPE.ELEMENT, D_ERROR_TYPE.INVALID_ARGUMENTS, 'bindPlayer(player)');

    this._doms = util.getPlayerDom(player);

    this._doms.order.onclick = e => {
      switch (this.options.order) {
        case D_ORDER.LIST:
          this._doms.order.innerHTML = D_ICON.ORDER_RANDOM;
          this.options.order = D_ORDER.RANDOM;
          break;
        case D_ORDER.RANDOM:
          this._doms.order.innerHTML = D_ICON.ORDER_LIST;
          this.options.order = D_ORDER.LIST;
          break;
      }
      this.settings = Object.assign(util.storage.get(this.options.storageName) || {}, {
        order: this.options.order
      });
      util.storage.set(this.options.storageName, this.settings);
      this.randCount = 0;
    };

    this._doms.loop.onclick = e => {
      switch (this.options.loop) {
        case D_LOOP.ALL:
          this._doms.loop.innerHTML = D_ICON.LOOP_ONE;
          this.options.loop = D_LOOP.ONE;
          break;
        case D_LOOP.ONE:
          this._doms.loop.innerHTML = D_ICON.LOOP_NONE;
          this.options.loop = D_LOOP.NONE;
          break;
        case D_LOOP.NONE:
          this._doms.loop.innerHTML = D_ICON.LOOP_ALL;
          this.options.loop = D_LOOP.ALL;
          break;
      }
      this.settings = Object.assign(util.storage.get(this.options.storageName) || {}, {
        loop: this.options.loop
      });
      util.storage.set(this.options.storageName, this.settings);
    };

    this._doms.iconLrc.onclick = e => {
      this.toggleLrc();
    };

    this._doms.iconMenu.onclick = e => {
      this.toggleList();
    };

    this._doms.iconVolume.onclick = e => {
      if (this.audio.volume === 0) {
        this.setVolume(this.volume || 0.7);
      } else {
        this.setVolume(0, true);
      }
    };

    this._doms.iconPlay.onclick = this._doms.pic.onclick = e => {
      this.toggle();
    };

    this._doms.iconBack.onclick = e => {
      this.backward();
      this._doms.iconPlay.innerHTML = this._doms.button.innerHTML = D_ICON.PAUSE;
      this._doms.button.classList.remove('mplayer-pause');
      this.play();
    };

    this._doms.iconForward.onclick = e => {
      this.forward();
      this._doms.iconPlay.innerHTML = this._doms.button.innerHTML = D_ICON.PAUSE;
      this._doms.button.classList.remove('mplayer-pause');
      this.play();
    };

    this._doms.listItems.forEach(li => {
      li.onclick = e => {
        let targetIndex = parseInt(li.getAttribute('data-index'));
        if (this.currentIndex !== targetIndex) {
          this.backwardStack.push(this.currentIndex);
          this.currentIndex = targetIndex;
          this.switchInList(this.currentIndex);
        }
        this._doms.iconPlay.innerHTML = this._doms.button.innerHTML = D_ICON.PAUSE;
        this._doms.button.classList.remove('mplayer-pause');
        this.play();
      };
    });

    this.mouse = {
      thumb_start: null,
      thumb_end: null,
      initial_played_width: null,
      volume_start: null,
      volume_end: null,
      initial_volume_width: null
    }
    this._doms.thumb.onmousedown = e => {
      this.mouse.thumb_start = e.pageX;
      this.mouse.initial_played_width = this._doms.played.offsetWidth;
    };
    this._doms.volumeBar.onmousedown = e => {
      this.mouse.volume_start = e.pageX;
      this.mouse.initial_volume_width = this._doms.volume.offsetWidth;
    };
    document.onmousemove = e => {
      if (this.mouse.thumb_start) {
        this.mouse.thumb_end = e.pageX - this.mouse.thumb_start;
        this._doms.played.style.width = this.mouse.initial_played_width + this.mouse.thumb_end + 'px';
      }
      if (this.mouse.volume_start) {
        this.mouse.volume_end = e.pageX - this.mouse.volume_start;
        this._doms.volume.style.width = this.mouse.initial_volume_width + this.mouse.volume_end + 'px';
      }
    };
    document.onmouseup = e => {
      if (this.mouse.thumb_start) {
        this.seek(this._doms.played.offsetWidth / this._doms.bar.offsetWidth * (this.audio.duration || 0));
        this.mouse.thumb_start = null;
        this.mouse.initial_played_width = null;
      }
      if (this.mouse.volume_start) {
        this.setVolume(this._doms.volume.offsetWidth / this._doms.volumeBar.offsetWidth);
        this.mouse.volume_start = null;
        this.mouse.initial_volume_width = null;
      }
    }
  }

  bindAudio() {
    this.audio.onerror = e => {
      window.setTimeout(this.audio.onended, 2048);
    };

    this.audio.onplay = e => {
      if (!this.audio.paused) {
        this._doms.iconPlay.innerHTML = this._doms.button.innerHTML = D_ICON.PAUSE;
        this._doms.button.classList.remove('mplayer-pause');
      }
    };

    this.audio.onpause = e => {
      if (this.audio.paused) {
        this._doms.iconPlay.innerHTML = this._doms.button.innerHTML = D_ICON.PLAY;
        this._doms.button.classList.add('mplayer-pause');
      }
    };

    this.audio.onseeking = e => {
      this._doms.loading.classList.add('mplayer-loading-show');
    };

    this.audio.onloadstart = e => {
      this._doms.loading.classList.add('mplayer-loading-show');
      this.switchLrc(this.currentIndex);
    };

    this.audio.onseeked = this.audio.onloadeddata = e => {
      this._doms.loading.classList.remove('mplayer-loading-show');
    };

    this.audio.oncanplay = e => {
      let percent = this.audio.buffered.length ? this.audio.buffered.end(this.audio.buffered.length - 1) / this.audio.duration : 0;
      this._doms.loaded.style.width = util.fixPrecentage(percent);
    };

    this.audio.onprogress = e => {
      let percent = this.audio.buffered.length ? this.audio.buffered.end(this.audio.buffered.length - 1) / this.audio.duration : 0;
      this._doms.loaded.style.width = util.fixPrecentage(percent);
    };

    this.audio.onended = e => {
      switch (this.options.loop) {
        case D_LOOP.ALL:
          this.forward();
          this.play();
          break;
        case D_LOOP.ONE:
          this.switchInList(this.currentIndex);
          this.play();
          break;
        case D_LOOP.NONE:
          this.backwardStack.push(this.currentIndex);
          switch (this.options.order) {
            case D_ORDER.LIST:
              this.currentIndex += 1;
              this.switchInList(this.currentIndex % this.options.audio.length);
              if (this.currentIndex < this.options.audio.length - 1) {
                this.play();
              } else {
                this.pause();
              }
              break;
            case D_ORDER.RANDOM:
              if (this.randCount < this.options.audio.length - 1) {
                this.currentIndex = this.randomIndexQueue.shift();
                this.randomIndexQueue.push(this.currentIndex);
                this.switchInList(this.currentIndex);
                this.play();
              } else {
                this.randomIndexQueue = util.generateRandomIndexQueue(this.options.audio.length);
                this.currentIndex = this.randomIndexQueue.shift();
                this.randomIndexQueue.push(this.currentIndex);
                this.switchInList(this.currentIndex);
                this.pause();
              }
              break;
          }
          break;
      }
    };

    this.audio.ontimeupdate = e => {
      let lrc = this.parsed[this.currentIndex];
      if (lrc) {
        for (let i = 0; i < lrc.length; i++) {
          if (this.audio.currentTime + 0.5 < lrc[i][0]) {
            let current = this._doms.lrcContents.querySelector('.mplayer-lrc-current');
            let target = this._doms.lrcContents.querySelector(`p:nth-child(${i})`);
            if (current !== target) {
              current && current.classList.remove('mplayer-lrc-current');
              target && target.classList.add('mplayer-lrc-current');
              this._doms.lrcContents.style.transform = `translateY(${target.offsetTop * -1 + 20}px)`;
            }
            break;
          }
        }
      }

      let rCurrentTime = Math.round(this.audio.currentTime);
      if (this.audio.currentTime) {
        this._doms.ptime.innerText = `${util.fixDigit(Math.floor(rCurrentTime / 60))}:${util.fixDigit(rCurrentTime % 60)}`;
        if (this.audio.duration) {
          let rDuration = Math.round(this.audio.duration);
          let left = rDuration - rCurrentTime;
          this._doms.dtime.innerText = `${util.fixDigit(Math.floor(left / 60))}:${util.fixDigit(left % 60)}`;
        }
      }

      if (!this.mouse.thumb_start) {
        this._doms.played.style.width = (this.audio.currentTime / this.audio.duration * 100).toFixed(3) + '%';
      }

    };
  }

  play() {
    if (this.audio.paused) {
      this.audio.play().catch(e => {
        if (e.name === 'NotAllowedError') {
          this._doms.iconPlay.innerHTML = this._doms.button.innerHTML = D_ICON.PLAY;
          this._doms.button.classList.add('mplayer-pause');
        }
      });
    }
  }

  pause() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  seek(time) {
    util.checkArgument(time, D_DATA_TYPE.NUMBER, D_ERROR_TYPE.INVALID_ARGUMENTS, 'seek(time)');
    this.audio.currentTime = time;
  }

  toggle() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  on(event, handler) {
    util.checkArgument(event, D_DATA_TYPE.STRING, D_ERROR_TYPE.INVALID_ARGUMENTS, 'on(event..)');
    util.checkArgument(handler, D_DATA_TYPE.FUNCTION, D_ERROR_TYPE.INVALID_ARGUMENTS, 'on(..handler)');

    if (Object.values(D_PLAYER_EVENT).includes(event)) {
      this.listener[event] = handler;
    } else {
      this.audio.addEventListener(event, e => {
        handler(this.audio, e);
      });
    }

    return this;
  }

  setVolume(percentage, nostorage = false) {
    util.checkArgument(percentage, D_DATA_TYPE.NUMBER, D_ERROR_TYPE.INVALID_ARGUMENTS, 'setVolume(percentage..)');
    util.checkArgument(nostorage, D_DATA_TYPE.BOOLEAN, D_ERROR_TYPE.INVALID_ARGUMENTS, 'setVolume(..nostorage)');

    this.audio.volume = S_VOLUME(percentage);
    this._doms.volume.style.width = this.audio.volume * 100 + '%';
    if (this.audio.volume === 0) {
      this._doms.iconVolume.innerHTML = D_ICON.VOLUME_OFF;
    } else if (this.audio.volume > 0.7) {
      this._doms.iconVolume.innerHTML = D_ICON.VOLUME_UP;
    } else {
      this._doms.iconVolume.innerHTML = D_ICON.VOLUME_DOWN;
    }

    if (!nostorage) {
      this.volume = this.audio.volume;
      this.settings = Object.assign(util.storage.get(this.options.storageName) || {}, {
        volume: this.audio.volume
      });
      util.storage.set(this.options.storageName, this.settings);
    }
  }

  setTheme(color, index) {
    util.checkArgument(color, D_DATA_TYPE.STRING, D_ERROR_TYPE.INVALID_ARGUMENTS, 'setTheme(color..)');
    util.checkArgument(index, D_DATA_TYPE.INTEGER, D_ERROR_TYPE.INVALID_ARGUMENTS, 'setTheme(..index)');

    if (index >= 0 && index < this.options.audio.length) {
      this.options.audio[index].theme = color;

      let target = this._doms.list.querySelector(`.mplayer-list-item[data-index="${index}"] .mplayer-list-cur`);
      target && (target.style.backgroundColor = color);
    }
  }

  backward() {
    if (this.backwardStack.length > 0) {
      let targetIndex = this.backwardStack.pop();
      this.forwardStack.push(this.currentIndex);
      this.currentIndex = targetIndex;
    } else {
      switch (this.options.order) {
        case D_ORDER.LIST:
          this.currentIndex -= 1;
          if (this.currentIndex < 0) {
            this.currentIndex = this.options.audio.length - 1;
          }
          break;
        case D_ORDER.RANDOM:
          this.currentIndex = this.randomIndexQueue.pop();
          this.randomIndexQueue.unshift(this.currentIndex);
          break;
      }
    }
    this.switchInList(this.currentIndex);
  }

  forward() {
    if (this.forwardStack.length > 0) {
      let targetIndex = this.forwardStack.pop();
      this.backwardStack.push(this.currentIndex);
      this.currentIndex = targetIndex;
    } else {
      switch (this.options.order) {
        case D_ORDER.LIST:
          this.currentIndex += 1;
          if (this.currentIndex > this.options.audio.length - 1) {
            this.currentIndex = 0;
          }
          break;
        case D_ORDER.RANDOM:
          this.currentIndex = this.randomIndexQueue.shift();
          this.randomIndexQueue.push(this.currentIndex);
          break;
      }
    }
    this.switchInList(this.currentIndex);
  }

  destroy() {
    this.pause();
    this.container.innerHTML = '';
    this.audio.src = '';
    this.listener[D_PLAYER_EVENT.DESTROY](this);
  }

  showLrc() {
    this._doms.lrc.classList.remove('mplayer-lrc-hide');
    this._doms.iconLrc.classList.remove('mplayer-icon-transparent');
    this.listener[D_PLAYER_EVENT.LRC_SHOW](this);
  }

  hideLrc() {
    this._doms.lrc.classList.add('mplayer-lrc-hide');
    this._doms.iconLrc.classList.add('mplayer-icon-transparent');
    this.listener[D_PLAYER_EVENT.LRC_HIDE](this);
  }

  toggleLrc() {
    if (this._doms.lrc.classList.contains('mplayer-lrc-hide')) {
      this.showLrc();
    } else {
      this.hideLrc();
    }
  }

  switchLrc(index) {
    util.checkArgument(index, D_DATA_TYPE.INTEGER, D_ERROR_TYPE.INVALID_ARGUMENTS, 'switchLrc(index)');

    this._doms.lrcScore.classList.remove('mplayer-lrc-score-show');
    if (!this.parsed[index]) {
      let type = D_LRC_TYPE.FILE;
      if (this.options.lrcType === D_LRC_TYPE.AUTO) {
        if (/(\[[0-9]{2,3}:[0-9]{2,3}(\.[0-9]{2,3})?\].+)+/i.test(this.options.audio[index].lrc)) {
          type = D_LRC_TYPE.JS;
        }
      } else {
        type = this.options.lrcType;
      }
      if (type === D_LRC_TYPE.JS) {
        if (this.options.audio[index].lrc) {
          this.parsed[index] = util.parseLrc(this.options.audio[index].lrc);
        } else {
          this.parsed[index] = [['0', 'Not available']];
        }
      } else if (type === D_LRC_TYPE.FILE) {
        this.parsed[index] = [['0', 'Loading']];
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (index === this.currentIndex && xhr.readyState === 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
              this.parsed[index] = util.parseLrc(xhr.responseText);
            } else {
              this.parsed[index] = [['0', 'Not available']];
              console.info(`LRC file request fails: status ${xhr.status}`);
            }
            this._doms.lrcContents.innerHTML = T_LRC({
              lyrics: this.parsed[index]
            });
            this._doms.lrcScore.classList.add('mplayer-lrc-score-show');
          }
        };
        const apiurl = this.options.audio[index].lrc;
        xhr.open('get', apiurl, true);
        xhr.send(null);
      }
    } else {
      this._doms.lrcContents.innerHTML = T_LRC({
        lyrics: this.parsed[index]
      });
      this._doms.lrcScore.classList.add('mplayer-lrc-score-show');
    }
  }

  showList() {
    this._doms.list.classList.remove('mplayer-list-hide');
    this._doms.iconMenu.classList.remove('mplayer-icon-transparent');
    this.listener[D_PLAYER_EVENT.LIST_SHOW](this);
  }

  hideList() {
    this._doms.list.classList.add('mplayer-list-hide');
    this._doms.iconMenu.classList.add('mplayer-icon-transparent');
    this.listener[D_PLAYER_EVENT.LIST_HIDE](this);
  }

  toggleList() {
    if (this._doms.list.classList.contains('mplayer-list-hide')) {
      this.showList();
    } else {
      this.hideList();
    }
  }

  addToList(audios) {
    util.checkArgumentMultiType(audios, [D_DATA_TYPE.ARRAY, D_DATA_TYPE.OBJECT], D_ERROR_TYPE.INVALID_ARGUMENTS, 'addToList(audios)');

    this.options.audio = this.options.audio.concat(S_AUDIO(audios));
    this._doms.list.style.height = 'auto';
    this._doms.list.innerHTML = T_LIST_ITEM({
      theme: this.options.theme,
      audio: this.options.audio
    });
    this._doms.list.style.height = this._doms.list.offsetHeight + 'px';

    let target = this._doms.list.querySelector(`.mplayer-list-item[data-index="${this.currentIndex}"]`);
    target && target.classList.add('mplayer-list-current');

    this._doms = util.getPlayerDom(this.player);
    this.randomIndexQueue = util.generateRandomIndexQueue(this.options.audio.length);
    this.listener[D_PLAYER_EVENT.LIST_ADD](this);
  }

  removeFromList(index) {
    util.checkArgument(index, D_DATA_TYPE.INTEGER, D_ERROR_TYPE.INVALID_ARGUMENTS, 'removeFromList(index)');

    if (index >= 0 && index < this.options.audio.length) {
      this.options.audio.splice(index, 1);
      this._doms.list.style.height = 'auto';
      this._doms.list.innerHTML = T_LIST_ITEM({
        theme: this.options.theme,
        audio: this.options.audio
      });
      this._doms.list.style.height = this._doms.list.offsetHeight + 'px';
      this.parsed[index] = null;
      this.randCount -= 1;

      let i = this.backwardStack.indexOf(index);
      while (i >= 0) {
        this.backwardStack.splice(i, 1);
        i = this.backwardStack.indexOf(index);
      }

      let j = this.forwardStack.indexOf(index);
      while (j >= 0) {
        this.forwardStack.splice(j, 1);
        j = this.forwardStack.indexOf(index);
      }

      if (this.currentIndex === index) {
        if (index < this.options.audio.length) {
          this.switchInList(index);
        } else {
          this.switchInList(0);
          this.currentIndex = 0;
        }
        this.pause();
      } else {
        let target = this._doms.list.querySelector(`.mplayer-list-item[data-index="${this.currentIndex}"]`);
        target && target.classList.add('mplayer-list-current');
      }

      this._doms = util.getPlayerDom(this.player);
      this.randomIndexQueue = util.generateRandomIndexQueue(this.options.audio.length);
      this.listener[D_PLAYER_EVENT.LIST_REMOVE](this);
    }
  }

  switchInList(index) {
    util.checkArgument(index, D_DATA_TYPE.INTEGER, D_ERROR_TYPE.INVALID_ARGUMENTS, 'switchInList(index)');

    if (index >= 0 && index < this.options.audio.length) {
      this.audio.src = this.options.audio[index].url;
      this._doms.title.innerText = this.options.audio[index].name;
      this._doms.author.innerText = '- ' + this.options.audio[index].artist;
      this._doms.pic.style.backgroundImage = `url('${this.options.audio[index].cover}')`;

      let currentItem = this._doms.list.querySelector('.mplayer-list-current');
      if (currentItem) {
        currentItem.classList.remove('mplayer-list-current');
      }

      currentItem = this._doms.list.querySelector(`.mplayer-list-item[data-index="${index}"]`);
      if (currentItem) {
        currentItem.classList.add('mplayer-list-current');
      }

      this.randCount += 1;

      this.listener[D_PLAYER_EVENT.LIST_SWITCH](this);
    }
  }

  clearList() {
    this.options.audio = [];
    this.randomIndexQueue = [];
    this.backwardStack = [];
    this.forwardStack = [];
    this.currentIndex = 0;
    this.randCount = 0;
    this.parsed = [];

    this._doms.list.style.height = 'auto';
    this._doms.list.innerHTML = T_LIST_ITEM({
      theme: this.options.theme,
      audio: this.options.audio
    });
    this._doms.list.style.height = this._doms.list.offsetHeight + 'px';

    this.pause();

    this._doms = util.getPlayerDom(this.player);
    this.listener[D_PLAYER_EVENT.LIST_CLEAR](this);
  }

}

Object.assign(MPlayer, DEFINE, STRUCT, TEMPLATE);

export default MPlayer;