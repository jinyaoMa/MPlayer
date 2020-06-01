# MPlayer

A HTML5 player (Audio)

## Usage

``` js
new MPlayer({
  selector: '#MPlayer', // css selector
  autoplay: true | false, // autoplay - true/false
  theme: '#ff3300', // color - e.g. #000000, rgb(0,0,0), rgba(0,0,0,1.0)
  loop: MPlayer.D_LOOP.ALL, // loop mode - MPlayer.D_LOOP.ALL or MPlayer.D_LOOP.ONE or MPlayer.D_LOOP.NONE
  order: MPlayer.D_ORDER.LIST, // play order - MPlayer.D_ORDER.LIST or MPlayer.D_ORDER.RANDOM
  preload: MPlayer.D_PRELOAD.NONE, // audio preload - MPlayer.D_PRELOAD.NONE or MPlayer.D_PRELOAD.METADATA or MPlayer.D_PRELOAD.AUTO
  volume: 0.7, // number between 0 - 1
  audio: [
    ...
    {
      name: 'MPlayer', // audio title
      artist: 'jinyaoMa', // audio author
      url: 'http://example.com/audio.mp3', // audio url - the best to use .mp3 ext
      cover: 'http://example.com/image.jpg', // audio image
      lrc: 'http://example.com/lrc.lrc' // audio lyric
    }
    ...
  ]
});
```

## Example

``` html
<div id="MPlayer"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="MPlayer.min.js"></script>
<script>
  $.get('https://api.i-meto.com/meting/api?server=netease&type=playlist&id=5042972369', data => {
    window.mplayer = new MPlayer({
      audio: data.map(a => {
        return {
          name: a.title,
          artist: a.author,
          url: a.url,
          cover: a.pic,
          lrc: a.lrc
        };
      })
    })
  }, 'json');
</script>
```