function LoadImage(ref, name, src, main_callback) {
  function makeImage(datauri) {
    var image = {
      src: datauri,
      format: datauri.split(':')[1].split(';')[0].split('/')[1]
    }
    return image;
  }
  function CImage(src, callback) {
    var datauri;
    if (!!src.match(/^data:/i)) {
      datauri = src;
      callback(datauri);
    }
    else if (!ref.options.inBrowser && !!src.match(/^https?:\/\//i)) {
      require( src.match(/^(https?):\/\//i)[1] ).get(src,function(res){
        var data = '';
        var contentType = res.headers['content-type'];
        res.setEncoding('base64');
        res.on('data',function(chunk) {data += chunk;});
        res.on('end',function() {
          callback("data:"+contentType+";base64,"+data);
        });
      });
    }
    else if (ref.options.inBrowser) {
      var ext = src.split('.').pop();
      var image = document.createElement('img');
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      image.onload = function() {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image,0,0);
        datauri = canvas.toDataURL(ext);
        callback(datauri);
      }
      image.src = src;
    }
    else {
      datauri = require('urify')(src);
      callback(datauri);
    }
  }

  function loadImage(name, src) {
    var image = {
      src: src,
      steps: [{
        options: {
          id: ref.options.sequencerCounter++,
          name: "load-image",
          title: "Load Image"
        },
        UI: ref.UI({
          stepName: "load-image",
          stepID: ref.options.sequencerCounter++,
          imageName: name
        }),
        draw: function() {
          if(arguments.length==1){
            this.output = CImage(arguments[0]);
            return true;
          }
          else if(arguments.length==2) {
            this.output = CImage(arguments[0]);
            arguments[1]();
            return true;
          }
          return false;
        },
      }]
    };
    CImage(src, function(datauri) {
      var output = makeImage(datauri);
      image.steps[0].output = output;
      ref.images[name] = image;
      ref.images[name].steps[0].UI.onSetup();
      ref.images[name].steps[0].UI.onDraw();
      ref.images[name].steps[0].UI.onComplete(image.steps[0].output.src);
      main_callback();
      return true;
    });
  }

  return loadImage(name,src);
}

module.exports = LoadImage;
