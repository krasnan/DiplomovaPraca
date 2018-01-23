(function(global) {
    function rgb2hex(rgb){
        if(rgb[0]=='#') return rgb;
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }

  function hex2rgb(hex) {
      // long version
      r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
      if (r) {
          return r.slice(1,4).map(function(x) { return parseInt(x, 16); });
      }
      // short version
      r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
      if (r) {
          return r.slice(1,4).map(function(x) { return 0x11 * parseInt(x, 16); });
      }
      return null;
  }
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  global.capitalize = capitalize;
  global.hex2rgb = hex2rgb;
  global.rgb2hex = rgb2hex;
})(this);
