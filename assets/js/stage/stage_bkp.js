Stage = {};
var s = Stage;

Stage.Score = function() {
  this.parts = [];
  this.connectors = [];
  this.partLinks = [];
  this.staffMarginLeft = 15;
  this.renderer = false;
  return this;
}
Stage.Score.prototype.setRendererCanvas = function(e) {
  this.renderer = new Vex.Flow.Renderer(e, Vex.Flow.Renderer.Backends.CANVAS);
  return this;
}
Stage.Score.prototype.addPart = function (e) {
    e.score = this;
    this.parts.push(e);
    return this;
}
Stage.Score.prototype.constructVexFlow = function () {
    for (var c = 0; c < this.parts.length; c++) {
        this.parts[c].constructVexFlow()
    }
    var b = new Vex.Flow.StaveConnector(this.parts.first().measures.first().stave, this.parts.last().measures.first().stave);
    b.setType(1);
    var a = new Vex.Flow.StaveConnector(this.parts.first().measures.first().stave, this.parts[1].measures.first().stave);
    a.setType(3);
    var d = new Vex.Flow.StaveConnector(this.parts[2].measures.first().stave, this.parts[3].measures.first().stave);
    d.setType(4);
    this.connectors = [b, a, d];
    return this
};
Stage.Score.prototype.reset = function () {
    stage.constructVexFlow().render();
    return this;
};

var StaveBuilder = function () {
    this.stave = false
};
StaveBuilder.prototype.buildTimeSignature = function (a) {
    if (a) {
        this.stave.addTimeSignature(a.toString())
    }
    return this
};
StaveBuilder.prototype.buildBegBarline = function (a) {
    if (a) {
        this.stave.setBegBarType(a)
    }
    return this
};
StaveBuilder.prototype.buildEndBarline = function (a) {
    if (a) {
        this.stave.setEndBarType(a)
    }
    return this
};
StaveBuilder.prototype.getStave = function () {
    return this.stave
};
var NotationStaveBuilder = function (a) {
    this.init(a)
};
NotationStaveBuilder.prototype = new StaveBuilder();
NotationStaveBuilder.prototype.constructor = NotationStaveBuilder;
NotationStaveBuilder.superclass = StaveBuilder.prototype;
NotationStaveBuilder.prototype.init = function (a) {
    this.stave = new Vex.Flow.Stave(0, 0, 500);
    this.stave.clef = a
};
NotationStaveBuilder.prototype.buildClef = function (a) {
    if (a) {
        this.stave.addClef(a)
    }
};
NotationStaveBuilder.prototype.buildKeySignature = function (a) {
    if (a) {
        this.stave.addKeySignature(a.toString())
    }
};

//
Link = function () {};
Link.prototype.init = function (e) {
    this.parts = e || [];
}
Link.prototype.trigger = function () {};
Link.prototype.addPart = function (e) {
    this.parts.push(e);
    return this;
}
RestLink = function (e) {
    this.init(e)
}
RestLink.prototype = new Link();
RestLink.prototype.constructor = RestLink;
RestLink.superclass = Link.prototype;
RestLink.prototype.init = function (e) {
    var b = RestLink.superclass;
    b.init.call(this, e)
};
RestLink.prototype.trigger = function (a, c, b) {};

//
Measure = function (a) {
    this.init(a)
};
Measure.prototype.init = function (a) {
    this.notes = [];
    this.timeSignature = false;
    this.begBar = Vex.Flow.Barline.type.SINGLE;
    this.endBar = Vex.Flow.Barline.type.SINGLE;
    this._changed = true;
    this.tuplets = [];
    this.stave = false;
    this.vexflow = {
        notes: [],
        voice: null,
        beams: [],
        tuplets: []
    };
    this.part = false;
    if (a) {
        if ("timeSignature" in a) {
            this.setTimeSignature(new TimeSignature(a.timeSignature))
        }
    }
};
Measure.prototype.setStave = function (a) {
    this.stave = a;
    return this
};
Measure.prototype.getIndex = function () {
    if (!this.hasPart()) {
        throw new Vex.RERR("NoPart", "Measure has no associated part")
    }
    return this.part.measures.indexOf(this)
};
Measure.prototype.getWidth = function () {
    return this.stave.getWidth()
};
Measure.prototype.getNextMeasure = function () {
    if (!this.part) {
        throw new Vex.RERR("NoPartAssociated", "This measure does not have an associated parent Part")
    }
    var a = this.getIndex() + 1;
    if (a >= 0 && a < this.part.measures.length) {
        return this.part.measures[a]
    } else {
        return false
    }
};
Measure.prototype.getPrevMeasure = function () {
    if (!this.part) {
        throw new Vex.RERR("NoPartAssociated", "This measure does not have an associated parent Part")
    }
    var a = this.getIndex() - 1;
    if (a >= 0 && a < this.part.measures.length) {
        return this.part.measures[a]
    } else {
        return false
    }
};
Measure.prototype.isFirst = function () {
    return this.part.measures.first() === this
};
Measure.prototype.isLast = function () {
    return this.part.measures.last() === this
};
Measure.prototype.getEndX = function () {
    return this.stave.x + this.stave.width
};
Measure.prototype.getTimeSignature = function () {
    return this.timeSignature
};
Measure.prototype.hasPart = function () {
    return this.part
};
Measure.prototype.setTimeSignature = function (c) {
    var b = this.timeSignature;
    this.timeSignature = c;
    if (this.hasPart()) {
        var a = this.getNextMeasure();
        if (a && a.getTimeSignature() == b) {
            a.setTimeSignature(c)
        } else {
            if (a) {
                a.flagChange()
            }
        }
    }
    this.flagChange();
    return this
};
Measure.prototype.setEndBarType = function (a) {
    this.endBar = a;
    this.flagChange()
};
Measure.prototype.setBegBarType = function (a) {
    this.begBar = a;
    this.flagChange()
};
Measure.prototype.destroy = function () {
    this.part.removeMeasure(this);
    return this
};
Measure.prototype.getStatus = function () {
    var f = this.getTimeSignature();
    if (f !== false) {
        var d = f.getTotalBeats();
        var b = f.getBeatValue();
        var c = 1024 * d * (16 / b);
        var a = e.helpers.getTicksSum(this.notes);
        if (a === 0) {
            return "empty"
        } else {
            if (a === c) {
                return "complete"
            } else {
                if (a > c) {
                    return "overflown"
                } else {
                    if (a < c) {
                        return "incomplete"
                    }
                }
            }
        }
    } else {
        return "empty"
    }
};
Measure.prototype.isExtending = function (a) {
    if (this.getEndX() > a) {
        return true
    } else {
        return false
    }
};
Measure.prototype.hasChanged = function () {
    return this._changed
};
Measure.prototype.flagChange = function () {
    if (!this._changed) {
        this._changed = true
    }
};
Measure.prototype.unflagChange = function () {
    if (this._changed) {
        this._changed = false
    }
};
Measure.prototype.renderStave = function () {
    var a = this.getStatus();
    if (this.isSelected(selection)) {
        if (a == "complete") {
            this.stave.setContext(ctx).draw(ctx, "rgba(50,150,50,.4)")
        } else {
            if (a == "overflown") {
                this.stave.setContext(ctx).draw(ctx, "rgba(200,0,0,.3)")
            } else {
                this.stave.setContext(ctx).draw(ctx, "rgba(0,0,255,.3)")
            }
        }
    } else {
        if (a == "incomplete" || a == "overflown") {
            this.stave.setContext(ctx).draw(ctx, "rgba(200,0,0,.3)")
        } else {
            this.stave.setContext(ctx).draw()
        }
    }
};
Measure.prototype.renderNotes = function () {
    if (this.vexflow.notes.length > 0) {
        this.vexflow.voice.draw(ctx, this.stave, "black");
        for (var a = 0; a < this.vexflow.beams.length; a++) {
            this.vexflow.beams[a].setContext(ctx).draw()
        }
    }
};
Measure.prototype.renderTuplets = function () {
    this.vexflow.tuplets.forEach(function (a) {
        a.setContext(ctx).draw()
    })
};
Measure.prototype.render = function () {
    this.renderStave();
    this.renderNotes();
    this.renderTuplets()
};
Measure.prototype.isSelected = function (a) {
    if (a.contains(this)) {
        return true
    }
    return false
};
Measure.prototype.constructTuplets = function () {
    this.vexflow.tuplets = Stage.vfFactory.buildTuplets(this.tuplets, this.vexflow.notes)
};
Measure.prototype.clone = function () {};
Measure.prototype.addNote = function (c, a) {
    var b = this.notes;
    if (typeof a != "number") {
        a = b.length
    }
    b.insertAt(c, a);
    c.measure = this
};
Measure.prototype.addNotes = function (b, a) {
    var c = this;
    b.forEach(function (d) {
        c.addNote(d)
    })
};
Measure.prototype.removeNote = function (a) {
    var b = -1;
    if (typeof a == "number") {
        if (a > -1 || a < this.notes.length - 1) {
            b = a;
            a = this.notes[a]
        } else {
            throw new Vex.RERR("IndexOutOfBounds", "The number provided was no within the bounds of the part's measures")
        }
    } else {
        if (a instanceof Stage.Note) {
            if (this.notes.contains(a)) {
                b = a.getIndex()
            }
        }
    }
    this.notes.removeAt(b)
};

//
var NotationMeasure = function (a) {
    this.init(a)
};
NotationMeasure.prototype = new Measure();
NotationMeasure.prototype.constructor = NotationMeasure;
NotationMeasure.superclass = Measure.prototype;
NotationMeasure.prototype.init = function (a) {
    var b = NotationMeasure.superclass;
    this.clef = false;
    this.keySignature = false;
    b.init.call(this, a);
    if (a) {
        if ("clef" in a) {
            this.setClef(a.clef)
        }
        if ("keySignature" in a) {
            this.setKeySignature(a.keySignature)
        }
    }
};
NotationMeasure.prototype.getClef = function () {
    return this.clef
};
NotationMeasure.prototype.setClef = function (c, b) {
    var d = this.clef;
    this.clef = c;
    if (this.hasPart()) {
        var a = this.getNextMeasure();
        if (a && a.getClef() == d) {
            a.setClef(c)
        } else {
            if (a) {
                a.flagChange()
            }
        }
    }
    this.flagChange();
    return this
};
NotationMeasure.prototype.getKeySignature = function () {
    return this.keySignature
};
NotationMeasure.prototype.setKeySignature = function (a, c) {
    c = false;
    var f = this.keySignature;
    this.keySignature = a;
    if (this.hasPart()) {
        var b = this.getNextMeasure();
        if (b && b.getKeySignature() == f) {
            b.setKeySignature(a)
        } else {
            if (b) {
                b.flagChange()
            }
        }
        var d = this.getPrevMeasure();
        if (d && d.getKeySignature() != a) {
            d.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
            d.flagChange()
        } else {
            if (d) {
                d.setEndBarType(Vex.Flow.Barline.type.SINGLE);
                d.flagChange()
            }
        }
    }
    this.flagChange();
    return this
};
NotationMeasure.prototype.constructVexFlowStave = function () {
    if (this.hasChanged()) {
        var b;
        var g = this.getClef();
        var a = this.getKeySignature();
        var h = this.getTimeSignature();
        var f = this.begBar;
        var i = this.endBar;
        var d = new NotationStaveBuilder(g);
        var c = !this.getPrevMeasure() ? true : false;
        if (c || this.getPrevMeasure().getClef() != g) {
            d.buildClef(g)
        }
        if (c || this.getPrevMeasure().getKeySignature() != a) {
            d.buildKeySignature(a)
        }
        if (c || this.getPrevMeasure().getTimeSignature().toString() != h.toString()) {
            d.buildTimeSignature(h)
        }
        if (f > 0) {
            d.buildBegBarline(f)
        }
        if (i > 0) {
            d.buildEndBarline(i)
        }
        b = d.getStave();
        this.setStave(b);
        this.unflagChange()
    }
    this.constructVexFlowNotes()
};
NotationMeasure.prototype.constructVexFlowNotes = function () {
    var a = Stage.vfFactory.buildNotes(this.notes, this.getKeySignature());
    this.vexflow.notes = a;
    if (a.length > 0) {
        this.constructTuplets(a);
        this.vexflow.beams = Stage.vfFactory.buildBeams(this);
        this.notes.forEach(function (c, b) {
            Stage.vfFactory.buildArticulations(a[b], c.articulations)
        });
        this.vexflow.voice = Stage.vfFactory.buildVoice(a, this.timeSignature.toString())
    }
};
NotationMeasure.prototype.clone = function () {
    var b = this.getClef();
    var a = this.getKeySignature();
    var c = this.getTimeSignature();
    return new NotationMeasure({
        clef: b,
        keySignature: a,
        timeSignature: c.toString()
    })
};

VexFlowFactory = function () {};
VexFlowFactory.prototype.buildNotes = function (o, v) {
    if (!v) {
        v = "c"
    }
    var m = new Vex.Flow.KeyManager(v);
    var b = [];
    for (var t = 0; t < o.length; ++t) {
        var c = o[t];
        var q = [];
        var g = [];
        var n = c.articulations;
        for (var s = 0; s < c.keys.length; ++s) {
            var l = c.keys[s].toString();
            var d = Vex.Flow.keyProperties(l);
            var h = m.selectNote(d.key);
            if (h.change) {
                if (h.accidental === null) {
                    g.push("n")
                } else {
                    g.push(h.accidental)
                }
            } else {
                g.push(null)
            }
            var f = h.note;
            var a = d.octave;
            if (Stage.music.getNoteParts(h.note).root == "b" && Stage.music.getNoteParts(d.key).root == "c") {
                a--
            } else {
                if (Stage.music.getNoteParts(h.note).root == "c" && Stage.music.getNoteParts(d.key).root == "b") {
                    a++
                }
            }
            c.keys[s].step = h.note[0];
            c.keys[s].accidental = h.accidental || "";
            c.keys[s].octave = a;
            var p = f + "/" + a;
            q.push(p)
        }
        var u = Stage.vfFactory.buildStaveNote(q, c.getClef(), c.getDuration(), c.isRest(), c.dots);
        for (var r = 0; r < g.length; ++r) {
            var e = g[r];
            if (e && u.noteType != "r") {
                u.addAccidental(r, new Vex.Flow.Accidental(g[r]))
            }
        }
        b.push(u)
    }
    return b
};
VexFlowFactory.prototype.buildArticulations = function (c, d) {
    var e = 0;
    for (var a = 0; a < d.length; a++) {
        var b;
        switch (d[a]) {
        case Stage.articulations.STACCATO:
            b = new Vex.Flow.Articulation("a.");
            break;
        case Stage.articulations.STACCATISSIMO:
            b = new Vex.Flow.Articulation("av");
            break;
        case Stage.articulations.ACCENT:
            b = new Vex.Flow.Articulation("a>");
            break;
        case Stage.articulations.TENUTO:
            b = new Vex.Flow.Articulation("a-");
            break;
        case Stage.articulations.MARCATO:
            b = new Vex.Flow.Articulation("a^");
            break;
        case Stage.articulations.LEFT_HAND_PIZZICATO:
            b = new Vex.Flow.Articulation("a+");
            break;
        case Stage.articulations.SNAP_PIZZICATO:
            b = new Vex.Flow.Articulation("ao");
            break;
        case Stage.articulations.UP_STROKE:
            b = new Vex.Flow.Articulation("a|");
            break;
        case Stage.articulations.DOWN_STROKE:
            b = new Vex.Flow.Articulation("am");
            break;
        case Stage.articulations.FERMATA_ABOVE:
            b = new Vex.Flow.Articulation("a@a");
            break;
        case Stage.articulations.FERMATA_BELOW:
            b = new Vex.Flow.Articulation("a@u");
            break
        }
        if (c instanceof Vex.Flow.StaveNote && c.getStemDirection() === -1) {
            b.setPosition(Vex.Flow.Modifier.Position.ABOVE)
        }
        b.y_shift = e;
        e += 10;
        c.addModifier(0, b)
    }
};
VexFlowFactory.prototype.buildTabNotes = function (e) {
    var b = [];
    for (var d = 0; d < e.length; d++) {
        var a = e[d];
        var f;
        var c = /r/;
        if (c.test(a.duration)) {
            f = new Vex.Flow.StaveNote({
                keys: ["b/4"],
                duration: a.duration
            })
        } else {
            var g = _.map(a.keys, function (h) {
                return h.toObject()
            });
            f = new Vex.Flow.TabNote({
                positions: g,
                duration: a.duration
            })
        }
        a.keys.forEach(function (h) {
            if (h.articulations > 0) {
                h.articulations.forEach(function (i) {
                    switch (i) {
                    case Stage.articulations.VIBRATO:
                        f.addModifier(h.getIndex(), new Vex.Flow.Vibrato());
                        break;
                    case Stage.articulations.BEND_HALF:
                        f.addModifier(h.getIndex(), new Vex.Flow.Bend("1/2"));
                        break
                    }
                })
            }
        });
        b.push(f)
    }
    return b
};
VexFlowFactory.prototype.buildVoice = function (a, c) {
    var b = c.split("/");
    var d = new Vex.Flow.Voice({
        num_beats: b[0],
        beat_value: b[1],
        resolution: Vex.Flow.RESOLUTION
    });
    d.setStrict(false);
    d.addTickables(a);
    return d
};
VexFlowFactory.prototype.buildBeams = function (d, e) {
    var a = this.processStems(d.vexflow.notes, d.getClef());
    var f = [];
    for (var c = 0; c < a.length && a.length > 0; c++) {
        var b = new Vex.Flow.Beam(a[c]);
        f.push(b)
    }
    return f
};
VexFlowFactory.prototype.buildStaveNote = function (d, f, e, c, h) {
    if (!d) {
        throw new Vex.RERR("NoKeys", "Must specify keys to use for the new note")
    }
    if (!f) {
        f = "treble"
    }
    if (!e) {
        e = 4
    }
    var g = e + (c ? "r" : "");
    var a = new Vex.Flow.StaveNote({
        clef: f,
        keys: d,
        duration: g
    });
    for (var b = 0; b < h; b++) {
        a.addDotToAll()
    }
    return a
};
VexFlowFactory.prototype.processStems = function (f, a) {
    var b = 4096;
    var m = 0;
    var k = [];
    var h = [];
    var c = 0;
    for (var e = 0; e < f.length; e++) {
        var l = f[e].getTicks();
        key = f[e].keys[0].split("/"), pitch = key[0], octave = key[1], parts = Stage.music.getNoteParts(pitch);
        value = Stage.music.getNoteValue(parts.root.toLowerCase()), clefMidLine = new Clef(a).getMidLine();
        pitchInt = value + (parseInt(octave, 10) * 12);
        if (l <= 2048 && m <= b && f[e].noteType != "r") {
            var g = f[e];
            k.push(g);
            m += g.getTicks();
            c += (clefMidLine - pitchInt)
        }
        if (k.length > 1) {
            for (var d = 0; d < k.length && k.length > 0; d++) {
                if (c < 0) {
                    k[d].setStemDirection(Vex.Flow.StaveNote.STEM_DOWN)
                } else {
                    k[d].setStemDirection(Vex.Flow.StaveNote.STEM_UP)
                }
            }
        } else {
            if (pitchInt > clefMidLine) {
                f[e].setStemDirection(Vex.Flow.StaveNote.STEM_DOWN)
            } else {
                f[e].setStemDirection(Vex.Flow.StaveNote.STEM_UP)
            }
        } if (l >= 4096 || m == b || (f[e].noteType == "r")) {
            if (k.length > 1) {
                h.push(k)
            }
            k = [];
            m = 0;
            c = 0
        }
    }
    if (k.length > 1) {
        h.push(k)
    }
    return h
};
VexFlowFactory.prototype.buildTuplets = function (f, b) {
    var a = [];
    for (var e = 0; e < f.length; e++) {
        var d = f[e];
        var c = [];
        d.notes.forEach(function (g) {
            c.push(b[g.getIndex()])
        });
        a.push(new Vex.Flow.Tuplet(c))
    }
    return a
};

//
var TimeSignature = function (a) {
    this.totalBeats = 4;
    this.beatValue = 4;
    if (a) {
        this.setFromStr(a)
    }
};
TimeSignature.prototype.getTotalBeats = function () {
    return this.totalBeats
};
TimeSignature.prototype.getBeatValue = function () {
    return this.beatValue
};
TimeSignature.prototype.setFromStr = function (b) {
    if (typeof b != "string") {
        throw new Vex.RERR("InvalidString", "Input is not of type 'String'")
    }
    var a = b.split("/");
    if (a.length != 2) {
        throw new Vex.RERR("InvalidTimeSignatureString", "When parsed, the time signature string had an invalid number of parts")
    }
    this.setTotalBeats(parseInt(a[0], 10));
    this.setBeatValue(parseInt(a[1], 10));
    return this
};
TimeSignature.prototype.setTotalBeats = function (a) {
    if (typeof a != "number") {
        throw new Vex.RERR("InvalidNumber", 'totalBeats is not of type "number"')
    }
    if (a > 0) {
        this.totalBeats = a
    }
    return this
};
TimeSignature.prototype.setBeatValue = function (a) {
    if (typeof a != "number") {
        throw new Vex.RERR("InvalidNumber", 'beatValue is not of type "number"')
    }
    if (a != 1 && a != 2 && a != 4 && a != 8 && a != 16 && a != 32 && a != 64) {
        throw new Vex.RERR("InvalidBeatValue", "Beat value is not a valid note duration")
    }
    this.beatValue = a;
    return this
};
TimeSignature.prototype.toArray = function () {
    return [this.totalBeats, this.beatValue]
};
TimeSignature.prototype.toString = function () {
    return this.totalBeats + "/" + this.beatValue
};

//
Array.prototype.append = function (a) {
    this.push(a);
    return this
};
Array.prototype.head = function () {
    return _.first(this)
};
Array.prototype.first = function (a) {
    return _.first(this, a)
};
Array.prototype.tail = function () {
    return _.last(this)
};
Array.prototype.last = function (a) {
    return _.last(this, a)
};
Array.prototype.contains = function (a) {
    return _.contains(this, a)
};
Array.prototype.initial = function (a) {
    return _.initial(this, a)
};
Array.prototype.rest = function (a) {
    return _.rest(this, a)
};
Array.prototype.insertAt = function (b, a) {
    this.splice(a, 0, b)
};
Array.prototype.removeAt = function (a) {
    this.splice(a, 1)
};