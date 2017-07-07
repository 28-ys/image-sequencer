function ReplaceImage(ref,selector,steps) {
  if(!ref.options.inBrowser) return; // This isn't for Node.js
  this_ = ref;
  var input = document.querySelectorAll(selector);
  var images = [];
  for (i = 0; i < input.length; i++)
    if (input[i] instanceof HTMLImageElement) images.push(input[i]);
  for (i in images) {
    the_image = images[i];
    var url = images[i].src;
    var ext = url.split('.').pop();

    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open('GET', url, true);
    xmlHTTP.responseType = 'arraybuffer';
    xmlHTTP.onload = function(e) {
      var arr = new Uint8Array(this.response);
      var raw = String.fromCharCode.apply(null,arr);
      var base64 = btoa(raw);
      var dataURL="data:image/"+ext+";base64," + base64;
      make(dataURL);
    };

    if(url.substr(0,11).toLowerCase()!="data:image/") xmlHTTP.send();
    else make(url);

    function make(url) {
      this_.loadImage(url).addSteps('default',steps).run(function(out){
        the_image.src = out;
      });
    }
  }
}

module.exports = ReplaceImage;
