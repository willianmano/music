var Part = function (e) {
    this.init(e)
}
Part.prototype.init = function (e) {
    this.name = e || "Untitled Part";
    this.measures = [];
    this.score = false;
    this.aligned = false;
    this.locked = false;
    return this;
}
Part.prototype.constructVexFlow = function () {
    this.setEndBar();
    for (var i = 0; i < this.measures.length; i++) {
        this.measures[i].constructVexFlowStave();
    }
}
Part.prototype.setEndBar = function () {
    var d = this.measures;
    var a = d.tail();
    var c = d.length;
    var b = d[c - 2];
    if (a.endBar == 1) {
        if (b && b.endBar == Vex.Flow.Barline.type.END) {
            b.setEndBarType(Vex.Flow.Barline.type.SINGLE);
        }
        a.setEndBarType(Vex.Flow.Barline.type.END);
    }
}
Part.prototype.render = function () {
    if (!this.aligned) {
        this.alignStaves()
    }
    for (var a = 0; a < this.measures.length; a++) {
        var b = this.measures[a];
        b.render()
    }
}
Part.prototype.alignStaves = function () {
    var a = new StaveAligner(this, this.score);
    a.format()
}
Part.prototype.unflagAligned = function () {
    this.aligned = false
}
Part.prototype.flagAligned = function () {
    this.aligned = true
}
Part.prototype.addMeasure = function (b, a) {
    var c = this.measures;
    if (typeof a != "number") {
        a = c.length
    }
    c.insertAt(b, a);
    b.part = this
};
Part.prototype.removeMeasure = function (b) {
    var c = -1;
    if (typeof b == "number") {
        if (b > -1 || b < this.measures.length - 1) {
            c = b;
            b = this.measures[b]
        } else {
            throw new Vex.RERR("IndexOutOfBounds", "The number provided was no within the bounds of the part's measures")
        }
    } else {
        if (b instanceof Measure) {
            if (this.measures.contains(b)) {
                c = b.getIndex()
            }
        }
    }
    var a = b.getNextMeasure();
    this.measures.removeAt(c);
    if (a) {
        a.flagChange()
    }
    if (this.measures.length === 0) {
        this.addMeasure(b.clone())
    }
};
Part.prototype.lock = function () {
    this.locked = true;
    return this
};
Part.prototype.unlock = function () {
    this.locked = false;
    return this
};