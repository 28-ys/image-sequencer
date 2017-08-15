function AddStep(ref, image, name, o) {

  function addStep(image, name, o_) {
    var o = ref.copy(o_);
    o.number = ref.options.sequencerCounter++; //Gives a Unique ID to each step
    o.name = o_.name || name;
    o.selector = o_.selector || 'ismod-' + name;
    o.container = o_.container || ref.options.selector;
    o.image = image;
    o.inBrowser = ref.options.inBrowser;

    o.step = {
      name: o.name,
      ID: o.number,
      imageName: o.image,
      inBrowser: ref.options.inBrowser,
      ui: ref.options.ui
    };
    var UI = ref.events;
    var module = ref.modules[name][0](o,UI);
    ref.images[image].steps.push(module);

    return true;
  }

  addStep(image, name, o);
}
module.exports = AddStep;
