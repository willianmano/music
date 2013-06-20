Music = {};
var m = Music;

Music.Stage = function() {
	this.parts = [];
	this.connectors = [];
	this.partLinks = [];
	this.staffMarginLeft = 15;
	this.renderer = false;
	return this;
}
Music.Stage.prototype.setRendererCanvas = function(canvas) {
	this.renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
	return this;
}
Music.Stage.prototype.redrawCanvas = function() {
    this.renderer.getContext().clear();
    return this;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Music.Stave = function(staveLeft, staveTop, staveSize) {
    this.stave = null;

    this.staveLeft = typeof staveLeft !== 'undefined' ? staveLeft : 10;
    this.staveTop = typeof staveTop !== 'undefined' ? staveTop : 40;
    this.staveSize = typeof staveSize !== 'undefined' ? staveSize : 500;
    
    this.stave = new Vex.Flow.Stave(this.staveLeft, this.staveTop, this.staveSize);
    
    return this;
}
// Music.Stave.prototype.buildStave = function(c) {
//     var clef = typeof c !== 'undefined' ? c : 'treble';
//     this.stave = new Vex.Flow.Stave(this.staveLeft, this.staveTop, this.staveSize);
//     this.stave.addClef(clef);
    
//     // this.stave.addTimeSignature('4/4');
//     // this.stave.addKeySignature("C");

//     return this;
// }
// Music.Stave.prototype.setContext = function(context) {
//     this.stave.setContext(context);
//     return this;
// }
// Music.Stave.prototype.render = function() {
//     this.stave.draw();
//     return this;
// }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Music.Voice = function() {
    this.voice = null;
    return this;
}
Music.Voice.prototype.buildVoice = function(timeSignature, notes) {
    var time = typeof timeSignature !== 'undefined' ? timeSignature : '4/4';
    var ts = time.split("/");
    
    this.voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: Vex.Flow.RESOLUTION
    });

    var nt = typeof notes !== 'undefined' ? notes : '';

    this.voice.addTickables(notes);

    return this;
}
Music.Voice.prototype.format = function() {
    // Format and justify the notes to 500 pixels
  var formatter = new Vex.Flow.Formatter().joinVoices([this.voice]).format([this.voice], 500);
  return this;
}
Music.Voice.prototype.render = function(context, stave) {
    this.voice.draw(context, stave);
    return this;
}
HTMLCanvasElement.prototype.relMouseCoords = function (f) {
    var g = 0;
    var d = 0;
    var b = 0;
    var a = 0;
    var c = this;
    do {
        g += c.offsetLeft;
        d += c.offsetTop
    } while (c == c.offsetParent);
    b = f.pageX - g;
    a = f.pageY - d;
    return {
        x: b,
        y: a
    }
};














































