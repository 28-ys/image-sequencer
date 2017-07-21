if (typeof window !== 'undefined') {window.$ = window.jQuery = require('jquery'); isBrowser = true}
else {var isBrowser = false}

ImageSequencer = function ImageSequencer(options) {

  options = options || {};
  options.inBrowser = options.inBrowser || isBrowser;
  // if (options.inBrowser) options.ui = options.ui || require('./UserInterface');
  options.sequencerCounter = 0;

  function objTypeOf(object){
    return Object.prototype.toString.call(object).split(" ")[1].slice(0,-1)
  }

  function log(color,msg) {
    if(options.ui!="none") {
      if(arguments.length==1) console.log(arguments[0]);
      else if(arguments.length==2) console.log(color,msg);
    }
  }

  function copy(a) {
    if (!typeof(a) == "object") return a;
    if (objTypeOf(a) == "Array") return a.slice();
    if (objTypeOf(a) == "Object") {
      var b = {};
      for (var v in a) {
        b[v] = copy(a[v]);
      }
      return b;
    }
    return a;
  }

  function makeArray(input) {
    return (objTypeOf(input)=="Array")?input:[input];
  }

  var image,
      steps = [],
      modules = require('./Modules'),
      formatInput = require('./FormatInput'),
      images = {},
      inputlog = [],
      UI;

  setUI();

  // if in browser, prompt for an image
  // if (options.imageSelect || options.inBrowser) addStep('image-select');
  // else if (options.imageUrl) loadImage(imageUrl);

  function addSteps(){
    const this_ = (this.name == "ImageSequencer")?this:this.sequencer;
    var args = (this.name == "ImageSequencer")?[]:[this.images];
    var json_q = {};
    for(var arg in arguments){args.push(copy(arguments[arg]));}
    json_q = formatInput.call(this_,args,"+");

    inputlog.push({method:"addSteps", json_q:copy(json_q)});

    for (var i in json_q)
      for (var j in json_q[i])
        require("./AddStep")(this_,i,json_q[i][j].name,json_q[i][j].o);

    return this;
  }

  function removeStep(image,index) {
    //remove the step from images[image].steps and redraw remaining images
    if(index>0) {
      images[image].steps[index].UI.remove();
      images[image].steps.splice(index,1);
    }
    //tell the UI a step has been removed
  }

  function removeSteps(image,index) {
    var run = {}, indices;
    const this_ = (this.name == "ImageSequencer")?this:this.sequencer;
    var args = (this.name == "ImageSequencer")?[]:[this.images];
    for(var arg in arguments) args.push(copy(arguments[arg]));

    var json_q = formatInput.call(this_,args,"-");
    inputlog.push({method:"removeSteps", json_q:copy(json_q)});

    for (var img in json_q) {
      indices = json_q[img].sort(function(a,b){return b-a});
      run[img] = indices[indices.length-1];
      for (var i in indices)
        removeStep(img,indices[i]);
    }
    // this.run(run); // This is creating problems
    return this;
  }

  function insertSteps(image, index, name, o) {
    var run = {};
    const this_ = (this.name == "ImageSequencer")?this:this.sequencer;
    var args = (this.name == "ImageSequencer")?[]:[this.images];
    for (var arg in arguments) args.push(arguments[arg]);

    var json_q = formatInput.call(this_,args,"^");
    inputlog.push({method:"insertSteps", json_q:copy(json_q)});

    for (var img in json_q) {
      var details = json_q[img];
      details = details.sort(function(a,b){return b.index-a.index});
      for (var i in details)
        require("./InsertStep")(this_,img,details[i].index,details[i].name,details[i].o);
      run[img] = details[details.length-1].index;
    }
    // this.run(run); // This is Creating issues
    return this;
  }

  function run(t_image,t_from) {
    const this_ = (this.name == "ImageSequencer")?this:this.sequencer;
    var args = (this.name == "ImageSequencer")?[]:[this.images];
    for (var arg in arguments) args.push(copy(arguments[arg]));

    var callback = function() {};
    for (var arg in args)
      if(objTypeOf(args[arg]) == "Function")
        callback = args.splice(arg,1)[0];

    var json_q = formatInput.call(this_,args,"r");

    require('./Run')(this_, json_q, callback);

    return true;
  }

  function loadImages() {
    var args = [];
    for (var arg in arguments) args.push(copy(arguments[arg]));
    var json_q = formatInput.call(this,args,"l");

    inputlog.push({method:"loadImages", json_q:copy(json_q)});
    var loadedimages = this.copy(json_q.loadedimages);

    for (var i in json_q.images)
      require('./LoadImage')(this,i,json_q.images[i])

    json_q.callback();
    return {
      name: "ImageSequencer Wrapper",
      sequencer: this,
      addSteps: this.addSteps,
      removeSteps: this.removeSteps,
      insertSteps: this.insertSteps,
      run: this.run,
      UI: this.UI,
      setUI: this.setUI,
      images: loadedimages
    };
  }

  function replaceImage(selector,steps,options) {
    options = options || {};
    return require('./ReplaceImage')(this,selector,steps);
  }

  function setUI(_UI) {
    UI = require('./UserInterface')(_UI,options);
    return UI;
  }

  return {
    //literals and objects
    name: "ImageSequencer",
    options: options,
    inputlog: inputlog,
    modules: modules,
    images: images,
    UI: UI,

    //user functions
    loadImages: loadImages,
    loadImage: loadImages,
    addSteps: addSteps,
    removeSteps: removeSteps,
    insertSteps: insertSteps,
    replaceImage: replaceImage,
    run: run,
    setUI: setUI,

    //other functions
    log: log,
    objTypeOf: objTypeOf,
    copy: copy
  }

}
module.exports = ImageSequencer;
