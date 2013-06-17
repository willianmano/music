var cvPartiture = $("#cvPartiture")[0];
cvPartiture.width = $("#cvPartiture").width();

var cvPlaceholder = $("#cvPlaceholder");
cvPlaceholder[0].width = cvPartiture.width;

var stage = new Stage.Score().setRendererCanvas(cvPartiture);
var context = stage.renderer.getContext();

stage.addPart(new Part("Piano RH"));
stage.partLinks.push(new RestLink(stage.parts.first(2)));

var newMeasure = new NotationMeasure({
    clef: "treble",
    keySignature: "G",
    timeSignature: "4/4"
});

stage.parts[0].addMeasure(newMeasure);
stage.reset();