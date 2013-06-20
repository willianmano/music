
var canvas = $("#cvPartiture")[0],
    canvasOffset = $("#cvPartiture").offset();

var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);

var ctx = renderer.getContext();

var staff, 
    formatter, 
    voice, 
    noteOffsetLeft, 
    tickIndex = 0, 
    noteIndex = 0, 
    numBeats = 4, 
    beatValue = 4, 
    cursorHeight = 150;

var notes = new Array();
var myNotes = new Array();

var processMeasures = function() {
  // sum ticks and add new measures when neccessary
  var sumTicks = 0;
  var totalTicksPerMeasure = 1024 * numBeats * beatValue;
  
  for ( var i = 0; i < notes.length; i++) {

    if (notes[i].duration == "b") {
      sumTicks = 0;
      continue;
    }
    if (sumTicks == totalTicksPerMeasure) {
      notes.splice(i,0,new Vex.Flow.BarNote());
      noteIndex++;
      sumTicks = 0;
    }
    sumTicks += notes[i].ticks;
  }
}
var processStave = function() {

  var staveSize;
  
  // set stave width
  if (notes.length < 6) {
    staveSize = 550;
  }
  else {
    // about 85 pixels per note
    staveSize = (notes.length+1) * 85;
  }
  
  stave = new Vex.Flow.Stave(10, 40, staveSize);

  stave.addClef("treble");
  
  // add time
  stave.addTimeSignature(numBeats + "/" + beatValue);
  
  // add key
  stave.addKeySignature("C");
  
  // calc offset for first note - accounts for pixels used by treble clef & time signature & key signature
  noteOffsetLeft = stave.start_x + stave.glyph_start_x;
};
var processNotes = function() {

  // add new measure if necessary
  processMeasures();
  
  // create a voice in 4/4
  voice = new Vex.Flow.Voice({
    num_beats: numBeats,
    beat_value: beatValue,
    resolution: Vex.Flow.RESOLUTION
  });
  
  // turn off tick counter
  voice.setStrict(false);
  
  // Add notes to voice
  voice.addTickables(notes);
      
  // Format and justify the notes
  var voiceSize = notes.length * 85 - 50;
  
  formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], voiceSize);
}
var highlightNote = function () {
    
  ctx.fillStyle = "rgba(200,0,0,0.4)";
  
  // if notes exist
  if (notes.length > 0) {

    // when adding a new note vs. editing an existing note draw the cursor for next new note 
    //(the tickIndex will be undefined in map object for a new note)
    if (formatter.tContexts.map[tickIndex] == undefined) {
      
      var tempIndex = tickIndex - notes[notes.length-1].ticks;
      
      ctx.fillRect(noteOffsetLeft + formatter.tContexts.map[tempIndex].x + 60, 10, 16.5, cursorHeight);
    }
    else {
      ctx.fillRect(noteOffsetLeft + formatter.tContexts.map[tickIndex].x, 10, formatter.tContexts.map[tickIndex].width 
        + formatter.tContexts.map[tickIndex].padding*2, cursorHeight);
    }
    
  }
  else {
    ctx.fillRect(noteOffsetLeft, 10, 16, cursorHeight);
  }
  
  ctx.fillStyle = "#000";
}
var drawStave = function() {
  stave.setContext(ctx).draw();
}
var drawNotes = function() {
  voice.draw(ctx, stave);
}
var redrawCanvas = function() {
  ctx.clear();
  processStave();
  processNotes();
  drawStave();
  drawNotes();
}

var i = 0;
var addNote = function() {
  if (i < myNotes.length) {
    notes.push(myNotes[i]);
    redrawCanvas();
    i++;
  }
};

var delNotes = function() {
  ctx.clear();
  processStave();
  drawStave();
  notes = new Array();
  i = 0;
};

$(document).ready(function(e){
  
  processStave();
  // highlightNote();
  drawStave();

  // Create the notes
  myNotes.push(new Vex.Flow.StaveNote({ keys: ["g/4"], duration: "q" }));
  myNotes.push(new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q" }));
  myNotes.push(new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "h" }));
  myNotes.push(new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr" }));
  myNotes.push(new Vex.Flow.StaveNote({ keys: ["c/3", "e/3", "g/3"], duration: "q" }));
  myNotes.push(new Vex.Flow.StaveNote({ keys: ["g/4"], duration: "h" }));

  $("#addNotes").click(function(e){
    addNote();
  });

  $("#delNotes").click(function(e){
    delNotes();
  });
});