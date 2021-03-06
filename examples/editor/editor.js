var Part = function (a) {
    this.init(a)
};
Part.prototype.init = function (a) {
    this.name = a || "Untitled Part";
    this.measures = [];
    this.score = false;
    this.aligned = false;
    this.locked = false;
    return this
};
Part.prototype.constructVexFlow = function () {
    this.setEndBar();
    for (var a = 0; a < this.measures.length; a++) {
        this.measures[a].constructVexFlowStave()
    }
};
Part.prototype.setEndBar = function () {
    var d = this.measures;
    var a = d.tail();
    var c = d.length;
    var b = d[c - 2];
    if (a.endBar == 1) {
        if (b && b.endBar == Vex.Flow.Barline.type.END) {
            b.setEndBarType(Vex.Flow.Barline.type.SINGLE)
        }
        a.setEndBarType(Vex.Flow.Barline.type.END)
    }
};
Part.prototype.render = function () {
    if (!this.aligned) {
        this.alignStaves()
    }
    for (var a = 0; a < this.measures.length; a++) {
        var b = this.measures[a];
        b.render()
    }
};
Part.prototype.alignStaves = function () {
    var a = new StaveAligner(this, this.score);
    a.format()
};
Part.prototype.unflagAligned = function () {
    this.aligned = false
};
Part.prototype.flagAligned = function () {
    this.aligned = true
};
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
var Clef = function (a) {
    this.type = a || "treble"
};
Clef.prototype.setType = function (a) {
    if (a != "treble" && a != "bass" && a != "alto" && a != "tenor" && a != "percussion") {
        throw new Vex.RERR("InvalidClefType", "Clef string is invalid")
    }
    this.type = a;
    return this
};
Clef.prototype.getType = function () {
    return this.type
};
Clef.prototype.getMidLine = function () {
    var a = 0;
    switch (this.type) {
    case "treble":
        a = Editor.music.getNoteValue("b") + (12 * 4);
        break;
    case "bass":
        a = Editor.music.getNoteValue("d") + (12 * 3);
        break;
    case "alto":
        a = Editor.music.getNoteValue("c") + (12 * 4);
        break;
    case "tenor":
        a = Editor.music.getNoteValue("a") + (12 * 3);
        break
    }
    return a
};
Helpers = {};
Helpers.getClickedMeasure = function (g, f) {
    var d;
    for (var b = 0; b < g.length; b++) {
        var c = g[b];
        var a = c.stave;
        if (a.containsPoint(f.x, f.y)) {
            return c
        }
    }
    return false
};
Helpers.getTicksSum = function (c) {
    var a = 0;
    if (!c instanceof Array) {
        throw new Vex.RERR("InavlidArray", "getTicksSum() needs input of type Array")
    }
    for (var b = 0; b < c.length; b++) {
        var d = c[b];
        a += this.getTicks(d)
    }
    return a
};
Helpers.getTicks = function (c) {
    var d = 0;
    var b = Vex.Flow.durationToTicks.durations[c.duration.split("r")[0]];
    for (var a = 0; a < c.dots; a++) {
        d += (b / 2);
        b = b / 2
    }
    d += Vex.Flow.durationToTicks.durations[c.duration.split("r")[0]];
    return d
};
Helpers.collectFrequencies = function (b) {
    var c = [];
    for (var g = 0; g < b.measures.length; g++) {
        var a = b.measures[g];
        for (var f = 0; f < a.notes.length; f++) {
            var h = [];
            var l = a.notes[f];
            for (var d = 0; d < l.keys.length; d++) {
                var m = l.keys[d];
                if (!a.notes[f].duration.match(/r/)) {
                    h.push(m.frequency())
                } else {
                    h.push(0)
                }
            }
            c.push(h)
        }
    }
    return c
};
Helpers.collectDurations = function (c) {
    var d = [];

    function l(i) {
        if (i.notes.contains(a.notes[g])) {
            b = b * (i.beatsOccupied / i.notes.length)
        }
    }
    for (var h = 0; h < c.measures.length; h++) {
        var a = c.measures[h];
        for (var g = 0; g < a.notes.length; g++) {
            var m = parseInt(a.notes[g].duration, 10);
            var o = a.notes[g].dots;
            var b = 1 / (m * (1 / 4));
            var n = b / 2;
            for (var f = 0; f < o; f++) {
                b += n;
                n = n / 2
            }
            a.tuplets.forEach(function (i) {
                l(i)
            });
            d.push(b)
        }
    }
    return d
};
Helpers.getNoteFromY = function (b, h) {
    var f = b.getKeySignature();
    if (!f) {
        f = "C"
    }
    var a = b.stave.getNumLines();
    var g = new Vex.Flow.KeyManager(f);
    var j;
    var c = 0;
    switch (b.getClef()) {
    case "bass":
        c = 6;
        break;
    case "alto":
        c = 3;
        break;
    case "tenor":
        c = 4;
        break
    }
    for (var d = 0; d < a + b.stave.options.space_below_staff_ln + b.stave.options.space_above_staff_ln; d++) {
        var k = b.stave.getYForLine(d - 4);
        if (h >= (k - 2) && h <= (k + 2)) {
            return g.scaleMap[Editor.trebleNotes[d + c].split("/")[0][0].toLowerCase()] + "/" + Editor.trebleNotes[d + c].split("/")[1]
        } else {
            if (j && h >= (j + 2) && h <= k - 2) {
                return g.scaleMap[Editor.trebleNotes[d - 0.5 + c].split("/")[0][0].toLowerCase()] + "/" + Editor.trebleNotes[d - 0.5 + c].split("/")[1]
            }
        }
        j = k
    }
    return "b/4"
};
Helpers.getLineFromY = function (d, g) {
    var b = d.stave.getNumLines();
    var f;
    for (var c = 0; c < b; c++) {
        var a = d.stave.getYForLine(c);
        if (g >= (a - 6) && g <= (a + 6)) {
            return c
        } else {
            if (f && g >= (f + 3) && g <= a - 3) {
                return c
            }
        }
        f = a
    }
    return -1
};
Helpers.findPositionWithString = function (d, b) {
    var a = /r/;
    if (a.test(d.duration)) {
        return 0
    }
    for (var c = 0; d && c < d.keys.length; c++) {
        if (d.keys[c].string == b) {
            return d.keys[c]
        }
    }
    return false
};
var Play = function (a, c) {
    var d = function (f, h, g) {
        AudioletGroup.apply(this, [f, 0, 1]);
        this.sine = new Saw(this.audiolet, h);
        this.modulator = new Saw(this.audiolet, h * 2);
        this.modulatorMulAdd = new MulAdd(this.audiolet, h / 2, h);
        this.gain = new Gain(this.audiolet, 0.1);
        this.envelope = new PercussiveEnvelope(this.audiolet, 0, 0.001, g * 1.1, function () {
            this.audiolet.scheduler.addRelative(0, this.remove.bind(this))
        }.bind(this));
        this.modulator.connect(this.modulatorMulAdd);
        this.modulatorMulAdd.connect(this.sine);
        this.envelope.connect(this.gain, 0, 1);
        this.sine.connect(this.gain);
        this.gain.connect(this.outputs[0])
    };
    extend(d, AudioletGroup);
    var b = function () {
        this.audiolet = a;
        this.audiolet.scheduler.setTempo(c);
        var m = new PSequence(e.helpers.collectFrequencies(score.parts[0]));
        var i = new PSequence(e.helpers.collectDurations(score.parts[0]));
        var j = new PSequence(e.helpers.collectDurations(score.parts[0]));
        var l = new PSequence(e.helpers.collectFrequencies(score.parts[1]));
        var h = new PSequence(e.helpers.collectDurations(score.parts[1]));
        var f = new PSequence(e.helpers.collectDurations(score.parts[1]));
        var k = new PSequence(e.helpers.collectFrequencies(score.parts[2]));
        var g = new PSequence(e.helpers.collectDurations(score.parts[2]));
        var n = new PSequence(e.helpers.collectDurations(score.parts[2]));
        if (m && j) {
            this.audiolet.scheduler.play([m, j], i, function (o, p) {
                this.playChord(o, p)
            }.bind(this))
        }
        if (l && f) {
            this.audiolet.scheduler.play([l, f], h, function (o, p) {
                this.playChord(o, p)
            }.bind(this))
        }
        if (k && n) {
            this.audiolet.scheduler.play([k, n], g, function (o, p) {
                this.playChord(o, p)
            }.bind(this))
        }
    };
    b.prototype.playChord = function (k, j) {
        for (var g = 0; g < k.length; g++) {
            var h = k[g];
            var f = new d(this.audiolet, h, (60 / (parseInt(this.audiolet.scheduler.bpm, 10)) * (j)));
            f.connect(this.audiolet.output)
        }
    };
    this.audioletApp = new b()
};
Vex.Flow.Stave.prototype.containsPoint = function (a, b) {
    if (a >= this.getX() && a <= this.getNoteEndX() && b >= this.y && b <= this.getBottomY() - 20) {
        return true
    }
    return false
};
Vex.Flow.Note.prototype.comparePoint = function (a, f) {
    var c = this;
    var b = c.getX() + c.stave.getNoteStartX() + 10;
    var d = b + c.getWidth() + 4;
    if (a >= b && a <= d && f >= c.getYs()[0] - 2 && f <= c.getYs()[0] + 2) {
        return "note"
    } else {
        if (a >= b && a <= d) {
            return "column"
        } else {
            if (a < b) {
                return "left"
            } else {
                if (a > d) {
                    return "right"
                }
            }
        }
    }
    return false
};
Vex.Flow.Tuning.prototype.toString = function () {
    return this.tuningString
};
StaveAligner = function (a, b) {
    this.part = a;
    this.score = b
};
StaveAligner.prototype.format = function () {
    var l = 0;
    var a = this.score;
    var c = _.pluck(this.part.measures, "stave");
    for (var f = 0; f < c.length; f++) {
        var d = c[f];
        var b = c[f + 1];
        var j = _.indexOf(this.score.parts, this.part);
        var h, g;
        if (f === 0) {
            g = d.glyph_start_x - d.x;
            h = d.start_x - d.x;
            d.x = a.staffMarginLeft;
            d.modifiers[0].x = a.staffMarginLeft;
            d.modifiers[1].x = a.staffMarginLeft + d.width;
            d.y = Math.round(100 * j);
            d.glyph_start_x = a.staffMarginLeft + g;
            d.start_x = a.staffMarginLeft + h
        }
        var k = d.getNoteEndX();
        if (b) {
            g = b.glyph_start_x - b.x;
            h = b.start_x - b.x;
            b.x = k;
            b.modifiers[0].x = k;
            b.modifiers[1].x = k + b.width;
            b.y = d.y;
            b.glyph_start_x = k + g;
            b.start_x = k + h
        }
    }
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
var TabStaveBuilder = function (a) {
    this.init(a)
};
TabStaveBuilder.prototype = new StaveBuilder();
TabStaveBuilder.prototype.constructor = TabStaveBuilder;
TabStaveBuilder.superclass = StaveBuilder.prototype;
TabStaveBuilder.prototype.init = function (a) {
    this.stave = new Vex.Flow.TabStave(0, 0, 500, {
        num_lines: a
    })
};
TabStaveBuilder.prototype.buildTabGlyph = function (a) {
    this.stave.addTabGlyph();
    return this
};
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
            if (Editor.music.getNoteParts(h.note).root == "b" && Editor.music.getNoteParts(d.key).root == "c") {
                a--
            } else {
                if (Editor.music.getNoteParts(h.note).root == "c" && Editor.music.getNoteParts(d.key).root == "b") {
                    a++
                }
            }
            c.keys[s].step = h.note[0];
            c.keys[s].accidental = h.accidental || "";
            c.keys[s].octave = a;
            var p = f + "/" + a;
            q.push(p)
        }
        var u = Editor.vfFactory.buildStaveNote(q, c.getClef(), c.getDuration(), c.isRest(), c.dots);
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
        case Editor.articulations.STACCATO:
            b = new Vex.Flow.Articulation("a.");
            break;
        case Editor.articulations.STACCATISSIMO:
            b = new Vex.Flow.Articulation("av");
            break;
        case Editor.articulations.ACCENT:
            b = new Vex.Flow.Articulation("a>");
            break;
        case Editor.articulations.TENUTO:
            b = new Vex.Flow.Articulation("a-");
            break;
        case Editor.articulations.MARCATO:
            b = new Vex.Flow.Articulation("a^");
            break;
        case Editor.articulations.LEFT_HAND_PIZZICATO:
            b = new Vex.Flow.Articulation("a+");
            break;
        case Editor.articulations.SNAP_PIZZICATO:
            b = new Vex.Flow.Articulation("ao");
            break;
        case Editor.articulations.UP_STROKE:
            b = new Vex.Flow.Articulation("a|");
            break;
        case Editor.articulations.DOWN_STROKE:
            b = new Vex.Flow.Articulation("am");
            break;
        case Editor.articulations.FERMATA_ABOVE:
            b = new Vex.Flow.Articulation("a@a");
            break;
        case Editor.articulations.FERMATA_BELOW:
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
                    case Editor.articulations.VIBRATO:
                        f.addModifier(h.getIndex(), new Vex.Flow.Vibrato());
                        break;
                    case Editor.articulations.BEND_HALF:
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
        key = f[e].keys[0].split("/"), pitch = key[0], octave = key[1], parts = Editor.music.getNoteParts(pitch);
        value = Editor.music.getNoteValue(parts.root.toLowerCase()), clefMidLine = new Clef(a).getMidLine();
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
Selection = function (a, c, b) {
    this.items = [];
    this.part = a || false;
    this.string = 0
};
Selection.prototype.add = function (a) {
    if (_.isNull(a) || _.isUndefined(a) || _.isNaN(a) || _.isNull(a)) {
        throw new Vex.RERR("InvalidSelectable", "The specifed input is not a valid object to select")
    }
    this.items.append(a);
    this.items = _.uniq(_.flatten(this.items))
};
Selection.prototype.remove = function (b) {
    var a = this.items.indexOf(b);
    if (a != -1) {
        this.items.removeAt(a)
    }
};
Selection.prototype.getM = function () {
    var a = this.getN().map(function (d) {
        return d.measure
    });
    var b = _.filter(this.items, function (d) {
        return d instanceof Measure
    });
    var c = _.compact(_.union(b, a));
    return _.sortBy(c, function (d) {
        return d.getIndex()
    })
};
Selection.prototype.getN = function () {
    var a = this.getK().map(function (d) {
        return d.note
    });
    var c = _.filter(this.items, function (d) {
        return d instanceof Editor.Note
    });
    var b = _.compact(_.union(c, a));
    return _.sortBy(b, function (d) {
        return d.getIndex()
    })
};
Selection.prototype.getK = function () {
    var a = _.groupBy(this.items, function (b) {
        return b instanceof Editor.NoteItem
    })[true];
    return _.sortBy(a, function (b) {
        return b.getIndex()
    })
};
Selection.prototype.swap = function (d, c) {
    this.remove(d);
    this.add(c)
};
Selection.prototype.reset = function () {
    this.items = [];
    return this
};
Selection.prototype.clearNotes = function () {
    var b = selection.getN();
    var c = b.length;
    for (var a = 0; a < c; a++) {
        selection.remove(b[a])
    }
    return this
};
Selection.prototype.clearKeys = function () {
    var c = selection.getK();
    var b = c.length;
    for (var a = 0; a < b; a++) {
        selection.remove(c[a])
    }
    return this
};
Selection.prototype.clearMeasures = function () {
    var c = selection.getM();
    var b = c.length;
    for (var a = 0; a < b; a++) {
        selection.remove(c[a])
    }
    return this
};
Selection.prototype.contains = function (a) {
    var b = _.union(this.getM(), this.getN(), this.getK());
    return b.contains(a)
};
Selection.prototype.increaseString = function () {
    this.string += 1
};
Selection.prototype.decreaseString = function () {
    this.string -= 1
};
Selection.prototype.getString = function () {
    return this.string
};
SelectionHandler = function (a) {
    this.selection = a
};
SelectionHandler.prototype.changeAccidentals = function (a) {
    selection.getK().forEach(function (b) {
        if (a == "n") {
            a = ""
        }
        b.accidental = a
    })
};
SelectionHandler.prototype.deleteNotes = function () {
    var c = this.selection.getK();
    if (c.length === 0) {
        return
    }
    var d = c.first().note;
    var b = d.getIndex();
    c.forEach(function (g, f) {
        this.selection.remove(g);
        if (g.note.keys.length == 1) {
            g.note.measure.removeNote(g.note)
        } else {
            g.note.keys.removeAt(g.getIndex())
        }
    });
    var a = null;
    if (d.measure.notes.length > 0) {
        a = d.measure.notes[b];
        if (!a) {
            a = d.measure.notes[b - 1].keys.first()
        } else {
            a = d.measure.notes[b].keys.first()
        }
    } else {
        a = d.measure
    }
    this.selection.add(a)
};
SelectionHandler.prototype.moveToNextNote = function () {
    var a = this.selection.getM(),
        d = selection.getK(),
        g, b;
    if (d.length > 0) {
        b = d.last().note
    }
    if (b) {
        g = b.getNextNote()
    }
    if (!g && b && b.measure.getStatus() != "complete" && b.measure.getStatus() != "overflown" && b.measure instanceof TabMeasure) {
        var f = parseInt($("button[name=noteDuration].active").val(), 10);
        var c = new Editor.Note().addKey(new Editor.Key("b/4")).setDuration(f).convertToRest();
        b.measure.addNote(c);
        score.partLinks[1].convertTabToNotation(selection.getM().last().getIndex());
        g = c
    }
    if (g) {
        selection.reset().add(g.keys.first())
    } else {
        this.moveToNextMeasure(true)
    }
};
SelectionHandler.prototype.moveToPrevNote = function () {
    var c = this.selection.getM().first(),
        d = selection.getK(),
        b, a;
    if (d.length > 0) {
        a = selection.getK().first().note
    }
    if (a) {
        b = a.getPrevNote()
    }
    if (b) {
        selection.reset().add(b.keys.first())
    } else {
        this.moveToPrevMeasure(true)
    }
};
SelectionHandler.prototype.moveToNextMeasure = function (d) {
    var b = this.selection;
    var a = this.selection.getM().last();
    var c = a.getNextMeasure();
    if (!c) {
        $("#addMeasure").trigger("click");
        c = a.getNextMeasure();
        d = false
    }
    b.reset().add(c);
    if (d && c && c.getStatus() != "empty") {
        b.add(c.notes.first())
    }
};
SelectionHandler.prototype.moveToPrevMeasure = function (d) {
    var b = this.selection;
    var a = b.getM().first();
    var c = a.getPrevMeasure();
    if (c) {
        b.reset().add(c)
    }
    if (d && c && c.getStatus() != "empty") {
        b.add(c.notes.last().keys.first())
    }
};
SelectionHandler.prototype.increaseSelection = function () {
    var b = this.selection;
    var a = b.getM().last().getNextMeasure();
    if (a) {
        b.add(a)
    }
};
SelectionHandler.prototype.decreaseSelection = function () {
    var b = this.selection;
    var a = b.getM().last();
    if (a) {
        b.remove(a)
    }
};
SelectionHandler.prototype.convertToRests = function () {
    this.selection.getN().forEach(function (a) {
        a.convertToRest()
    })
};
SelectionHandler.prototype.increaseDots = function () {
    this.selection.getN().forEach(function (a) {
        a.incrementDots()
    })
};
SelectionHandler.prototype.decreaseDots = function () {
    this.selection.getN().forEach(function (a) {
        a.decrementDots()
    })
};
SelectionHandler.prototype.toggleDot = function () {
    this.selection.getN().forEach(function (a) {
        if (a.dots > 0) {
            a.dots = 0
        } else {
            a.dots = 1
        }
    })
};
SelectionHandler.prototype.increaseDuration = function () {
    this.selection.getN().forEach(function (c) {
        var a = c.duration;
        var d = (a.indexOf("r") != -1 ? true : false);
        var f = parseInt(a.split("r")[0], 10);
        var b = (f == 1) ? f : f / 2;
        c.duration = (b).toString() + (d ? "r" : "")
    })
};
SelectionHandler.prototype.decreaseDuration = function () {
    this.selection.getN().forEach(function (c) {
        var a = c.duration;
        var d = (a.indexOf("r") != -1 ? true : false);
        var f = parseInt(a.split("r")[0], 10);
        var b = (f == 64) ? f : f * 2;
        c.duration = b.toString() + (d ? "r" : "")
    })
};
SelectionHandler.prototype.appendNextNote = function () {
    try {
        var b = selection.getK().last().note.getNextNote();
        if (b) {
            selection.add(b.keys.first())
        }
    } catch (a) {
        console.log("No note to append.")
    }
};
SelectionHandler.prototype.moveUpKey = function () {
    var a;
    if (keyMaster.shift) {
        a = true
    }
    this.selection.getK().forEach(function (c) {
        var b = c.getNext();
        if (b) {
            if (a) {
                this.selection.add(b)
            } else {
                this.selection.swap(c, b)
            }
        }
    })
};
SelectionHandler.prototype.moveDownKey = function () {
    var a;
    if (keyMaster.shift) {
        a = true
    }
    this.selection.getK().forEach(function (b) {
        var c = b.getPrev();
        if (c) {
            if (a) {
                this.selection.add(c)
            } else {
                this.selection.swap(b, c)
            }
        }
    })
};
SelectionHandler.prototype.moveDownString = function () {
    if (selection.getString() + 1 < selection.getM().first().stave.getNumLines()) {
        selection.increaseString()
    }
    var a;
    if (selection.getN().length > 0) {
        a = e.helpers.findPositionWithString(selection.getN()[0], selection.string + 1)
    }
    if (a) {
        selection.reset().add(a)
    }
};
SelectionHandler.prototype.moveUpString = function () {
    if (selection.getString() - 1 > -1) {
        selection.decreaseString()
    }
    var a;
    if (selection.getN().length > 0) {
        a = e.helpers.findPositionWithString(selection.getN()[0], selection.string + 1)
    }
    if (a) {
        selection.reset().add(a)
    }
};
SelectionHandler.prototype.shiftOctaveUp = function () {
    this.selection.getK().forEach(function (key) {
        var octave = parseInt(key.octave, 10);
        key.octave = ++octave;
    });
};

SelectionHandler.prototype.shiftOctaveDown = function () {
    this.selection.getK().forEach(function (key) {
        var octave = parseInt(key.octave, 10);
        key.octave = --octave;
    });
};
SelectionHandler.prototype.parseTabInput = function (j, f) {
    var b = _.filter(this.selection.getN(), function (i) {
        return i.measure instanceof TabMeasure
    }).first();
    var k = this.selection.getString() + 1;
    var c;
    if (b) {
        var d = true;
        var l = /r/;
        if (l.test(b.duration)) {
            b.duration = b.duration.split("r")[0];
            b.keys = []
        }
        for (var g = 0; g < b.keys.length; g++) {
            var h = b.keys[g];
            if (h.string == k) {
                if (h.fret.toString().length > 1) {
                    h.fret = j
                } else {
                    if (h.fret.toString()[0] != "1" && h.fret.toString()[0] != "2") {
                        h.fret = j
                    } else {
                        h.fret = parseInt(h.fret.toString() + j.toString(), 10)
                    }
                }
                d = false;
                break
            }
        }
        if (d) {
            c = new Editor.Position(k, j);
            b.addKey(c);
            selection.reset().add(c)
        }
    } else {
        c = new Editor.Position(k, j);
        var a = new Editor.Note();
        a.addKey(c).setDuration(f);
        selection.getM().first().addNote(a);
        selection.reset().add(c)
    }
    score.partLinks[1].convertTabToNotation(selection.getM()[0].getIndex())
};
SelectionRenderer = function (a) {
    this.selection = a
};
SelectionRenderer.prototype.render = function () {
    var a = this.selection.getM(),
        f = this.selection.getN(),
        b = this.selection.getM().first(),
        l = this.selection.getK(),
        h;
    ctx.fillStyle = "rgba(0, 100, 255, 0.35)";
    for (var d = 0; d < l.length && l; d++) {
        var k = l[d];
        b = k.note.measure;
        var c = k.note.measure.vexflow.notes[k.note.getIndex()];
        if (!(k.note.measure instanceof TabMeasure)) {
            roundRect(ctx, c.getX() + b.stave.getNoteStartX() + 9, c.getYs()[k.getIndex()] - 9, 10 + 8, 18, 5, true, false)
        } else {
            h = b.stave.getYForLine(this.selection.getString());
            roundRect(ctx, c.getX() + b.stave.getNoteStartX() + 9, h - 9, 18, 18, 5, true, false)
        }
    }
    if ((!l || l.length === 0) && b instanceof TabMeasure) {
        var g, j;
        if (f.length > 0) {
            f.forEach(function (i) {
                j = i.measure.vexflow.notes[i.getIndex()];
                g = i.measure.stave;
                h = b.stave.getYForLine(this.selection.getString());
                roundRect(ctx, j.getX() + g.getNoteStartX() + 9, h - 9, 18, 18, 5, true, false)
            })
        } else {
            h = b.stave.getYForLine(this.selection.getString());
            roundRect(ctx, b.stave.getNoteStartX() + 9, h - 9, 18, 18, 5, true, false)
        }
    }
    ctx.fillStyle = "black"
};

function roundRect(d, c, i, f, b, a, h, g) {
    if (typeof g == "undefined") {
        g = true
    }
    if (typeof a === "undefined") {
        a = 5
    }
    d.beginPath();
    d.moveTo(c + a, i);
    d.lineTo(c + f - a, i);
    d.quadraticCurveTo(c + f, i, c + f, i + a);
    d.lineTo(c + f, i + b - a);
    d.quadraticCurveTo(c + f, i + b, c + f - a, i + b);
    d.lineTo(c + a, i + b);
    d.quadraticCurveTo(c, i + b, c, i + b - a);
    d.lineTo(c, i + a);
    d.quadraticCurveTo(c, i, c + a, i);
    d.closePath();
    if (g) {
        d.stroke()
    }
    if (h) {
        d.fill()
    }
};
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
    this.vexflow.tuplets = Editor.vfFactory.buildTuplets(this.tuplets, this.vexflow.notes)
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
        if (a instanceof Editor.Note) {
            if (this.notes.contains(a)) {
                b = a.getIndex()
            }
        }
    }
    this.notes.removeAt(b)
};
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
    var a = Editor.vfFactory.buildNotes(this.notes, this.getKeySignature());
    this.vexflow.notes = a;
    if (a.length > 0) {
        this.constructTuplets(a);
        this.vexflow.beams = Editor.vfFactory.buildBeams(this);
        this.notes.forEach(function (c, b) {
            Editor.vfFactory.buildArticulations(a[b], c.articulations)
        });
        this.vexflow.voice = Editor.vfFactory.buildVoice(a, this.timeSignature.toString())
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
var TabMeasure = function (a) {
    this.init(a)
};
TabMeasure.prototype = new Measure();
TabMeasure.prototype.constructor = TabMeasure;
TabMeasure.superclass = Measure.prototype;
TabMeasure.prototype.init = function (a) {
    var b = TabMeasure.superclass;
    this.numStrings = 6;
    this.tuning = new Vex.Flow.Tuning();
    b.init.call(this, a);
    if (a) {
        if ("strings" in a) {
            this.numStrings = parseInt(a.strings, 10)
        }
        if ("tuning" in a) {
            this.tuning = new Vex.Flow.Tuning(a.tuning)
        }
    }
};
TabMeasure.prototype.constructVexFlowStave = function () {
    if (this.hasChanged()) {
        var a;
        var f = this.getTimeSignature();
        var d = this.begBar;
        var g = this.endBar;
        var c = new TabStaveBuilder(this.numStrings);
        var b = !this.getPrevMeasure() || false;
        if (this.part.measures.first() == this) {
            c.buildTabGlyph()
        }
        if ((b || this.getPrevMeasure().getTimeSignature().toString() != f.toString())) {
            c.buildTimeSignature(f)
        }
        if (d > 0) {
            c.buildBegBarline(d)
        }
        if (g > 0) {
            c.buildEndBarline(g)
        }
        a = c.getStave();
        this.setStave(a);
        this.unflagChange()
    }
    this.constructVexFlowNotes()
};
TabMeasure.prototype.constructVexFlowNotes = function () {
    var a = Editor.vfFactory.buildTabNotes(this.notes);
    this.vexflow.notes = a;
    if (a.length > 0) {
        this.notes.forEach(function (c, b) {
            Editor.vfFactory.buildArticulations(a[b], c.articulations)
        });
        this.vexflow.voice = Editor.vfFactory.buildVoice(a, this.getTimeSignature().toString())
    }
};
TabMeasure.prototype.clone = function () {
    var a = this.getTimeSignature().toString();
    return new TabMeasure({
        strings: this.numStrings,
        timeSignature: a,
        tuning: this.tuning.toString()
    })
};
TabMeasure.prototype.setStrings = function (a) {
    this.part.measures.forEach(function (b) {
        b.numStrings = parseInt(a, 10);
        b.flagChange()
    })
};
TabMeasure.prototype.convertToNotation = function () {
    var a = [];
    this.notes.forEach(function (c) {
        var d = [];
        if (c.isRest()) {
            d = [new Editor.Key("b/4")]
        } else {
            c.keys.forEach(function (f) {
                d.push(f.toKey())
            })
        }
        var b = new Editor.Note().addKeys(d).setDuration(c.duration).setDots(c.dots);
        if (c.isRest()) {
            b.convertToRest()
        }
        a.push(b)
    });
    return a
};
Editor = {};
var e = Editor;
Editor.articulations = {
    STACCATO: 1,
    STACCATISSIMO: 2,
    ACCENT: 3,
    TENUTO: 4,
    MARCATO: 5,
    LEFT_HAND_PIZZICATO: 6,
    SNAP_PIZZICATO: 7,
    NATURAL_HARMONIC: 8,
    FERMATA_ABOVE: 9,
    FERMATA_BELOW: 10,
    UP_STROKE: 11,
    DOWN_STROKE: 12,
    VIBRATO: 13,
    BEND_HALF: 14
};
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
Editor.defaultPercTable = {
    "b/5": "b/5/x3",
    "a/5": "a/5/x2",
    "g/5": "g/5/x2",
    "f/5": "f/5/x2",
    "e/5": "e/5",
    "d/5": "d/5",
    "c/5": "c/5",
    "b/4": "b/4",
    "a/4": "a/4",
    "g/4": "g/4",
    "f/4": "f/4",
    "e/4": "e/4",
    "d/4": "d/4/x2"
};
Editor.trebleNotes = {
    0: "G/6",
    0.5: "F/6",
    1: "E/6",
    1.5: "D/6",
    2: "C/6",
    2.5: "B/5",
    3: "A/5",
    3.5: "G/5",
    4: "F/5",
    4.5: "E/5",
    5: "D/5",
    5.5: "C/5",
    6: "B/4",
    6.5: "A/4",
    7: "G/4",
    7.5: "F/4",
    8: "E/4",
    8.5: "D/4",
    9: "C/4",
    9.5: "B/3",
    10: "A/3",
    10.5: "G/3",
    11: "F/3",
    11.5: "E/3",
    12: "D/3",
    12.5: "C/3",
    13: "B/2",
    13.5: "A/2",
    14: "G/2",
    14.5: "F/2",
    15: "E/2",
    15.5: "D/2",
    16: "C/2",
    16.5: "B/1",
    17: "A/1",
    17.5: "G/1",
    18: "F/1",
    18.5: "E/1"
};
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
Editor.Tuplet = function (a, c) {
    this.notes = a;
    this.ratioed = false;
    this.beatsOccupied = c || 2;
    var b = this;
    this.notes.forEach(function (d) {
        d.tuplet = b
    })
};
Editor.Tuplet.prototype.removeNote = function (a) {
    if (this.notes.contains(a)) {
        this.notes.removeAt(this.notes.indexOf(a));
        a.tuplet = false
    } else {
        throw new Vex.RERR("NoNote", "The note is not in this tuplet")
    }
};
Editor.Tuplet.prototype.destroy = function () {
    this.notes[0].measure.tuplets.removeAt(this.notes[0].measure.tuplets.indexOf(this));
    this.notes.forEach(function (a) {
        a.removeTuplet()
    })
};
Editor.Score = function () {
    this.parts = [];
    this.connectors = [];
    this.partLinks = [];
    this.staffMarginLeft = 15;
    this.renderer = false;
    return this
};
Editor.Score.prototype.setRendererCanvas = function (a) {
    this.renderer = new Vex.Flow.Renderer(a, Vex.Flow.Renderer.Backends.CANVAS);
    return this
};
Editor.Score.prototype.addPart = function (a) {
    a.score = this;
    this.parts.push(a);
    return this
};
Editor.Score.prototype.constructVexFlow = function () {
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
Editor.Score.prototype.formatSystemSlice = function (g) {
    var f = new Vex.Flow.Formatter();
    var c = [];
    var h;
    for (var d = 0; d < this.parts.length; d++) {
        var a = _.sortBy(this.parts, function (i) {
            if (!i.measures[g]) {
                return false
            }
            return -(e.helpers.getTicksSum(i.measures[g].notes))
        })[d];
        if (a.measures[g]) {
            h = a.measures[g].vexflow.voice
        }
        if (d > 0) {
            this.parts[d].measures[0].stave.setNoteStartX(this.parts[d - 1].measures[0].stave.getNoteStartX())
        }
        if (h) {
            c.push(h)
        }
    }
    if (c.length > 0) {
        var b = _.sortBy(this.parts, function (i) {
            return -(i.measures.length)
        })[0];
        f.joinVoices([c.first()]).formatToStave(c, b.measures[g].stave)
    }
};
Editor.Score.prototype.format = function () {
    var b = _.sortBy(this.parts, function (c) {
        return -(c.measures.length)
    });
    for (var a = 0; a < b[0].measures.length; a++) {
        this.formatSystemSlice(a)
    }
};
Editor.Score.prototype.render = function () {
    ctx.clear();
    this.format();
    this.parts.forEach(function (b) {
        b.render()
    });
    this.connectors.forEach(function (b) {
        b.setContext(ctx).draw()
    });
    var a = new SelectionRenderer(selection);
    a.render()
};
Editor.Score.prototype.reset = function () {
    score.constructVexFlow().render();
    score.resetInterface(selection);
    return this
};
Editor.Score.prototype.resetInterface = function (a) {
    var c = a.getM().first();
    var b = a.getN().first();
    if (c) {
        $("#measureProps").show();
        if (c instanceof NotationMeasure) {
            $("#stringsCell").hide();
            $("#keyCell").show();
            $("#keySig").removeAttr("disabled");
            $("#clefCell").show();
            $("#clef").removeAttr("disabled");
            $("#keySig").val(c.getKeySignature());
            $("#clef").val(c.getClef())
        } else {
            $("#clefCell").hide();
            $("#keyCell").hide();
            $("#stringsCell").show();
            $("#strings").removeAttr("disabled").val(c.numStrings);
            $("#keySig").attr("disabled", "disabled");
            $("#clef").attr("disabled", "disabled")
        }
        $("#beatsPerMeasure").val(c.getTimeSignature().getTotalBeats());
        $("#beatsValue").val(c.getTimeSignature().getBeatValue());
        if (c.begBar == 1) {
            $("#repStart").attr("checked", false)
        } else {
            if (c.begBar == Vex.Flow.Barline.type.REPEAT_BEGIN) {
                $("#repStart").attr("checked", true)
            }
        } if (c.endBar == 1 || c.endBar == 3) {
            $("#repEnd").attr("checked", false)
        } else {
            if (c.endBar == Vex.Flow.Barline.type.REPEAT_END) {
                $("#repEnd").attr("checked", true)
            }
        }
    } else {
        $("#measureProps").hide()
    }
    $("#rest").removeClass("active");
    $("#dot").removeClass("active");
    if (b) {
        $("button[name=noteDuration].active").removeClass("active");
        $("button[value=" + b.getDuration() + "]").addClass("active");
        if (b.isRest()) {
            $("#rest").addClass("active")
        }
        if (b.dots > 0) {
            $("#dot").addClass("active")
        }
    }
};
Editor.Note = function () {
    this.keys = [];
    this.duration = 4;
    this.dots = 0;
    this.articulations = [];
    this.measure = false
};
Editor.Note.prototype.addKey = function (a) {
    this.keys.append(a);
    this.keys = _.sortBy(this.keys, function (b) {
        if (b instanceof Editor.Key) {
            return (b.toInt())
        } else {
            if (b instanceof Editor.Position) {
                return b.string
            }
        }
    });
    a.note = this;
    return this
};
Editor.Note.prototype.addKeys = function (a) {
    var b = this;
    a.forEach(function (c) {
        b.addKey(c)
    });
    return this
};
Editor.Note.prototype.setKeys = function (a) {
    if (!(a instanceof Array)) {
        throw new Vex.RERR("InvalidKeysArray", "Input is not of Array type")
    }
    this.keys = a;
    return this
};
Editor.Note.prototype.getKeys = function () {
    return this.keys
};
Editor.Note.prototype.getKeyStringArray = function () {
    var a = [];
    this.keys.forEach(function (b) {
        a.push(b.toString())
    });
    return a
};
Editor.Note.prototype.convertToRest = function () {
    if (!this.isRest()) {
        this.duration = this.duration + "r"
    }
    return this
};
Editor.Note.prototype.setMeasure = function (a) {
    if (!(a instanceof Measure)) {
        throw new Vex.RERR("InvalidMeasure", "Object not of Measure type")
    }
    this.measure = a;
    return this
};
Editor.Note.prototype.isRest = function () {
    var a = this.duration + "";
    return a.match(/r/)
};
Editor.Note.prototype.getDuration = function () {
    var a = this.duration + "";
    return a.split("r")[0]
};
Editor.Note.prototype.setDuration = function (a) {
    this.duration = a;
    return this
};
Editor.Note.prototype.getClef = function (a) {
    if (this.isRest() || !this.measure) {
        return "treble"
    }
    return this.measure.getClef()
};
Editor.Note.prototype.setDots = function (a) {
    this.dots = a;
    return this
};
Editor.Note.prototype.incrementDots = function () {
    this.dots += 1;
    return this
};
Editor.Note.prototype.decrementDots = function () {
    if (this.dots - 1 > -1) {
        this.dots -= 1
    }
    return this
};
Editor.Note.prototype.getIndex = function () {
    if (!this.measure) {
        throw new Vex.RERR("NoMeasure", "Note has no associated measure")
    }
    return this.measure.notes.indexOf(this)
};
Editor.Note.prototype.getNextNote = function () {
    if (!this.measure) {
        throw new Vex.RERR("NoMeasure", "This note does not have an associated measure")
    }
    var a = this.getIndex() + 1;
    if (a >= 0 && a < this.measure.notes.length) {
        return this.measure.notes[a]
    }
    return false
};
Editor.Note.prototype.getPrevNote = function () {
    if (!this.measure) {
        throw new Vex.RERR("NoMeasure", "This note does not have an associated measure")
    }
    var a = this.getIndex() - 1;
    if (a >= 0 && a < this.measure.notes.length) {
        return this.measure.notes[a]
    }
    return false
};
Editor.Note.prototype.addArticulation = function (a) {
    this.articulations.push(a)
};
Editor.Note.prototype.removeTuplet = function () {
    if ("tuplet" in this && this.tuplet) {
        this.tuplet.removeNote(this)
    }
};
Editor.Note.prototype.getKeyFromY = function (d) {
    var a = e.Helpers.getNoteFromY(clickedMeasure, d, clickedMeasure.getKeySignature()),
        b = new Editor.Key(a);
    var c = _.filter(this.keys, function (f) {
        return (f.toString()[f.toString().length - 1] == b.toString()[b.toString().length - 1] && f.toString()[0] == b.toString()[0])
    });
    c = c.first();
    return c
};
Editor.Note.prototype.getVexFlow = function () {
    return this.measure.vexflow.notes[this.getIndex()]
};
Editor.NoteItem = function () {
    this.init()
};
Editor.NoteItem.prototype.init = function () {
    this.note = false;
    this.articulations = []
};
Editor.NoteItem.prototype.getIndex = function () {
    if (!this.note) {
        throw new Vex.RERR("NoPart", "Measure has no associated part")
    }
    return this.note.keys.indexOf(this)
};
Editor.NoteItem.prototype.getNext = function () {
    if (!this.note) {
        throw new Vex.RERR("NoNoteAssociated", "This noteitem does not have an associated parent note")
    }
    var a = this.getIndex() + 1;
    if (a >= 0 && a < this.note.keys.length) {
        return this.note.keys[a]
    } else {
        return false
    }
};
Editor.NoteItem.prototype.getPrev = function () {
    if (!this.note) {
        throw new Vex.RERR("NoNoteAssociated", "This noteitem does not have an associated parent note")
    }
    var a = this.getIndex() - 1;
    if (a >= 0 && a < this.note.keys.length) {
        return this.note.keys[a]
    } else {
        return false
    }
};
Editor.NoteItem.prototype.addArticulation = function (a) {
    this.articulations.append(a);
    return this
};
Editor.Key = function (a) {
    this.init(a)
};
Editor.Key.prototype = new Editor.NoteItem();
Editor.Key.prototype.constructor = Editor.Key;
Editor.Key.superclass = Editor.NoteItem.prototype;
Editor.Key.prototype.init = function (a) {
    var b = e.music.getNoteParts(a.split("/")[0]);
    this.step = b.root;
    this.accidental = b.accidental || "";
    this.octave = parseInt(a.split("/")[1], 10);
    Editor.Key.superclass.init.call(this)
};
Editor.Key.prototype.frequency = function () {
    var a = Note.fromLatin(this.step.toUpperCase() + this.accidental + this.octave);
    return a.frequency()
};
Editor.Key.prototype.toInt = function () {
    return Editor.music.getNoteValue(this.step + this.accidental) + (12 * this.octave)
};
Editor.Key.prototype.toString = function () {
    return this.step + this.accidental + "/" + this.octave
};
Editor.Key.prototype.incrementOctave = function () {
    this.octave += 1;
    return this
};
Editor.Key.prototype.decrementOctave = function () {
    this.octave += 1;
    return this
};
Editor.Key.prototype.setAccidental = function (a) {
    if (a != "b" && a != "bb" && a != "#" && a != "#" && a != "n") {
        throw new Vex.RERR("InavlidAccidental", "The supplied accidental was not recognized.")
    }
    this.accidental = a
};
Editor.Position = function (a, b) {
    this.init(a, b)
};
Editor.Position.prototype = new Editor.NoteItem();
Editor.Position.prototype.constructor = Editor.Position;
Editor.Position.superclass = Editor.NoteItem.prototype;
Editor.Position.prototype.init = function (a, b) {
    this.string = parseInt(a, 10);
    this.fret = parseInt(b, 10);
    Editor.Position.superclass.init.call(this)
};
Editor.Position.prototype.toObject = function () {
    return {
        str: this.string,
        fret: this.fret
    }
};
Editor.Position.prototype.toKey = function () {
    return new Editor.Key(this.note.measure.tuning.getNoteForFret(this.fret, this.string))
};
Link = function (a) {};
Link.prototype.init = function (a) {
    this.parts = a || []
};
Link.prototype.trigger = function () {};
Link.prototype.addPart = function (a) {
    this.parts.push(a);
    return this
};
TabNoteLink = function (a) {
    this.init(a)
};
TabNoteLink.prototype = new Link();
TabNoteLink.prototype.constructor = TabNoteLink;
TabNoteLink.superclass = Link.prototype;
TabNoteLink.prototype.init = function (a) {
    var b = TabNoteLink.superclass;
    b.init.call(this, a)
};
TabNoteLink.prototype.convertTabToNotation = function () {
    var b = _.filter(this.parts, function (c) {
        return c.measures.first() instanceof TabMeasure
    }).first();
    var a = _.filter(this.parts, function (c) {
        return c.measures.first() instanceof NotationMeasure
    }).first();
    b.measures.forEach(function (d, c) {
        a.measures[c].notes = [];
        a.measures[c].addNotes(d.convertToNotation())
    })
};
RestLink = function (a) {
    this.init(a)
};
RestLink.prototype = new Link();
RestLink.prototype.constructor = RestLink;
RestLink.superclass = Link.prototype;
RestLink.prototype.init = function (a) {
    var b = RestLink.superclass;
    b.init.call(this, a)
};
RestLink.prototype.trigger = function (a, c, b) {};
Editor.Helpers = Helpers;
Editor.helpers = Helpers;
Editor.vfFactory = new VexFlowFactory();
Editor.music = new Vex.Flow.Music();
var canvas = $("#canvas")[0];
canvas.width = $("#canvasWrapper").width();
var placeholderCanvas = $("#placeholder");
placeholderCanvas[0].width = canvas.width;
var canvasWidth = canvas.width - 1;
var score = new Editor.Score().setRendererCanvas(canvas);
var audiolet = new Audiolet();
var ctx = score.renderer.getContext();
ctx.font = "11pt Calibri";
var ctx2 = placeholderCanvas[0].getContext("2d");
score.addPart(new Part("Piano RH")).addPart(new Part("Piano LH")).addPart(new Part("Guitar Notation").lock()).addPart(new Part("Guitar Tab"));
score.partLinks.push(new RestLink(score.parts.first(2)));
score.partLinks.push(new TabNoteLink(score.parts.last(2)));
score.partLinks.push(new RestLink(score.parts.last(2)));
var newMeasure = new NotationMeasure({
    clef: "treble",
    keySignature: "G",
    timeSignature: "4/4"
});
var newMeasure2 = new NotationMeasure({
    clef: "bass",
    keySignature: "G",
    timeSignature: "4/4"
});
var newMeasure3 = new NotationMeasure({
    clef: "treble",
    keySignature: "G",
    timeSignature: "4/4"
});
var newMeasure4 = new TabMeasure({
    timeSignature: "4/4",
    strings: 7,
    tuning: "fstandard"
});
score.parts[0].addMeasure(newMeasure);
score.parts[1].addMeasure(newMeasure2);
score.parts[2].addMeasure(newMeasure3);
score.parts[3].addMeasure(newMeasure4);
var selection = new Selection();
var handler = new SelectionHandler(selection);
var mode = "notation-edit";
score.reset();

//neo_willian
//////////////////////////////
// CRIA AS ACOES DA
//////////////////////////////
$(document).ready(function () {
    keyMaster = key;
    
    $("#canvasWrapper").on("contextmenu", function () {
        return false
    });
    $("canvas").on("mousedown", function (d) {
        if (d.which != 3) {
            return
        }
        $("#acc").css({
            top: d.pageY + 25,
            left: d.pageX - 60
        });
        var c = this.relMouseCoords(d);
        for (var b = 0; score.parts.length; b++) {
            var a = score.parts[b];
            clickedMeasure = e.helpers.getClickedMeasure(a.measures, c);
            if (clickedMeasure) {
                measureFound = true;
                break
            }
        }
        if (measureFound && selection.getM().contains(clickedMeasure) && clickedMeasure instanceof NotationMeasure) {
            clickedMeasure.notes.forEach(function (g) {
                var h = g.getVexFlow().comparePoint(c.x, c.y);
                if (h == "left" || h == "right") {
                    return
                }
                var j = g.getKeyFromY(c.y);
                if (j) {
                    var f;
                    selection.reset().add(j);
                    if (j.accidental == "#") {
                        f = "#"
                    } else {
                        if (j.accidental == "b") {
                            f = "b"
                        } else {
                            if (j.accidental == "n" || j.accidental === "") {
                                f = "n"
                            }
                        }
                    }
                    $("#acc button.active").removeClass("active");
                    $("#acc button[value=" + f + "]").addClass("active");
                    $("#acc").fadeIn(50)
                }
            })
        }
    });
    $("canvas").on("mouseup", function (a) {
        if (a.which != 3) {
            return
        }
        $("#acc").fadeOut(50)
    });
    $("#acc button").on("mouseup", function (a) {
        $(this).click();
        $("#acc").fadeOut(50);
        return
    });
    $("#canvasWrapper").on("mouseleave", function () {
        $("#acc").fadeOut(50)
    });
    $("#acc button").on("click", function (a) {
        handler.changeAccidentals($(this).val());
        score.reset()
    });
    $("canvas").click(function (E) {
        var y = this.relMouseCoords(E),
            d = selection.getM(),
            c;
        for (var G = 0; score.parts.length; G++) {
            var z = score.parts[G];
            c = e.helpers.getClickedMeasure(z.measures, y);
            if (c) {
                measureFound = true;
                if (c instanceof TabMeasure) {
                    mode = "tab-edit"
                } else {
                    mode = "notation-edit"
                }
                break
            }
        }
        if (measureFound === false) {
            selection.part = false;
            selection.measures = [];
            selection.notes = [];
            selection.reset()
        }
        if (measureFound && mode == "notation-edit" && selection.contains(c) && !c.part.locked) {
            var H = c.getStatus();
            var D = (H != "complete" && H != "overflown");
            var b = $(".active").val();
            var v = $("#rest.active").val();
            var a = e.Helpers.getNoteFromY(c, y.y, c.getKeySignature());
            if (c.getClef() == "percussion") {
                a = Editor.defaultPercTable[J]
            }
            var J = new Editor.Key(a);
            var p = $("#dot.active").val() == "true" ? 1 : 0;
            var u = true;
            var n = c.notes.length;
            var x = -1;
            if (n !== 0) {
                var I = "none";
                var F;
                var t;
                for (var C = 0; C < n; C++) {
                    var h = c.notes[C];
                    var g = c.vexflow.notes[C];
                    var f = g.getX() + c.stave.getNoteStartX() + 10;
                    var k = f + g.getWidth() + 4;
                    Vex.drawDot(ctx, f, g.getYs()[0] - 5, "blue");
                    Vex.drawDot(ctx, k, g.getYs()[0] - 5, "blue");
                    F = g.comparePoint(y.x, y.y);
                    switch (F) {
                    case "note":
                    case "column":
                        var q;
                        var m = _.filter(h.keys, function (j) {
                            return (j.toString()[j.toString().length - 1] == J.toString()[J.toString().length - 1] && j.toString()[0] == J.toString()[0])
                        });
                        m = m.first();
                        if (!m) {
                            h.addKey(J);
                            selection.clearKeys().add(J)
                        } else {
                            if (selection.contains(m)) {
                                if (keyMaster.control) {
                                    selection.remove(m)
                                } else {
                                    selection.clearKeys();
                                    if (m.note.keys.length > 1) {
                                        m.note.keys.removeAt(m.getIndex())
                                    } else {
                                        var r = m.note.measure;
                                        m.note.measure.removeNote(m.note);
                                        selection.clearNotes().add(r)
                                    }
                                }
                            } else {
                                if (!keyMaster.control) {
                                    selection.clearKeys()
                                }
                                selection.add(m)
                            }
                        }
                        t = true;
                        break;
                    case "left":
                        x = _.indexOf(c.vexflow.notes, g);
                        if (I == "right" || I == "none") {
                            t = true
                        }
                        break
                    }
                    if (g == c.vexflow.notes.last() && F == "right") {
                        x = n
                    }
                    I = F;
                    if (t) {
                        break
                    }
                }
            } else {
                x = 0
            } if (x > -1 && D) {
                var o = new Editor.Note().addKey(J).setDuration(b + (v ? "r" : "")).setDots(p);
                c.addNote(o, x);
                selection.clearKeys().add(J)
            }
        } else {
            if (measureFound && c instanceof TabMeasure) {
                if (!keyMaster.control) {
                    selection.reset()
                }
                selection.add(c);
                var s = e.Helpers.getLineFromY(c, y.y);
                if (s == -1) {
                    selection.string = 0
                } else {
                    selection.string = s
                }
                var w, B;
                for (var A = 0; A < c.notes.length; A++) {
                    var g = c.vexflow.notes[A];
                    var f = g.getX() + c.stave.getNoteStartX() + 10;
                    var k = f + g.getWidth() + 4;
                    if (f <= y.x) {
                        B = c.notes[A];
                        w = e.helpers.findPositionWithString(B, selection.string + 1)
                    }
                }
                if (w) {
                    selection.reset().add(w)
                } else {
                    if (B) {
                        selection.reset().add(B)
                    }
                }
            } else {
                if (measureFound && !selection.contains(c) && !c.part.locked) {
                    if (!keyMaster.control) {
                        selection.reset()
                    }
                    selection.add(c);
                    for (var A = 0; A < c.notes.length; A++) {
                        var g = c.vexflow.notes[A];
                        var f = g.getX() + c.stave.getNoteStartX() + 10;
                        var k = f + g.getWidth() + 4;
                        if (f <= y.x) {
                            selection.reset().add(c.notes[A].keys.first())
                        }
                    }
                }
            }
        }
        score.constructVexFlow();
        score.reset();
        return false
    })
});
//neo_willian
//////////////////////////////
// MONTA O HOVER NA TELA
//////////////////////////////
$(document).ready(function () {
    var b = new Vex.Flow.Renderer(placeholderCanvas[0], Vex.Flow.Renderer.Backends.CANVAS);
    ctx2.clear = function () {
        ctx2.clearRect(-5000, 0, 10000, 5000)
    };
    var a = new Vex.Flow.Formatter();
    placeholderCanvas.mousemove(function (f) {
        var c = this.relMouseCoords(f);
        var g = selection.getM()[0];
        var d = false;
        ctx2.clear();
        selection.getM().forEach(function (n) {
            if (n && n.stave.containsPoint(c.x, c.y) && !n.part.locked) {
                for (var l = 0; l < n.notes.length; l++) {
                    var m = n.notes[l];
                    var j = n.vexflow.notes[l];
                    ctx2.fillStyle = "rgba(0, 100, 255, 0.2)";
                    if (j.comparePoint(c.x, c.y) == "column" || j.comparePoint(c.x, c.y) == "note") {
                        var k, o = [];
                        if (n instanceof NotationMeasure) {
                            o = _.filter(m.keys, function (q) {
                                var r = e.Helpers.getNoteFromY(n, c.y);
                                return (q.toString()[q.toString().length - 1] == r[r.length - 1] && q.toString()[0] == r[0])
                            })
                        } else {} if (o.length > 0) {
                            k = o.first().getIndex();
                            roundRect(ctx2, j.getX() + n.stave.getNoteStartX() + 9, j.getYs()[k] - 9, 10 + 10, 18, 5, true, false);
                            d = true
                        }
                    }
                }
                if (d === false && n instanceof NotationMeasure) {
                    var m = new Vex.Flow.StaveNote({
                        clef: n.getClef(),
                        keys: [e.helpers.getNoteFromY(n, c.y)],
                        duration: $("button[name='noteDuration'].active").val() + ($("#rest").hasClass("active") ? "r" : "")
                    });
                    if ($("#dot").hasClass("active")) {
                        m.addDotToAll()
                    }
                    m.extraLeftPx = c.x - n.stave.getNoteStartX() - 17;
                    var p = new Vex.Flow.Voice({
                        num_beats: 4,
                        beat_value: 4,
                        resolution: Vex.Flow.RESOLUTION
                    });
                    Editor.vfFactory.processStems([m], m.clef);
                    p.setStrict(false);
                    p.addTickables([m]);
                    a.formatToStave([p], n.stave);
                    p.draw(ctx2, n.stave, "rgba(0, 100, 255, .4)")
                } else {
                    if (d === false && n instanceof TabMeasure) {
                        var h = e.Helpers.getLineFromY(n, c.y);
                        if (h > -1) {
                            ctx2.fillStyle = "rgba(0, 100, 255, 0.1)";
                            roundRect(ctx2, n.stave.x - 5, n.stave.getYForLine(h) - 4, n.stave.width + 10, 9, 5, true, false)
                        }
                    }
                }
            } else {
                score.parts.forEach(function (q) {
                    q.measures.forEach(function (u) {
                        if (u.stave.containsPoint(c.x, c.y) && !u.part.locked && !selection.contains(u)) {
                            ctx2.clear();
                            ctx2.fillStyle = "rgba(0, 100, 255, 0.05)";
                            roundRect(ctx2, u.stave.x - 10, u.stave.y + 15, u.stave.width + 20, u.stave.getHeight(), 15, true, false);
                            for (var t = 0; t < u.notes.length; t++) {
                                var s = u.vexflow.notes[t];
                                ctx2.fillStyle = "rgba(0, 100, 255, 0.2)";
                                var r = s.comparePoint(c.x, c.y);
                                if (r == "column" || r == "note") {
                                    roundRect(ctx2, s.getX() + u.stave.getNoteStartX() + 9, s.getYs()[0] - 9, 18, 18, 5, true, false);
                                    d = true
                                }
                            }
                        }
                    })
                })
            }
        });
        if (selection.getM().length == 0) {
            score.parts.forEach(function (h) {
                h.measures.forEach(function (m) {
                    if (m.stave.containsPoint(c.x, c.y) && !m.part.locked && !selection.contains(m)) {
                        ctx2.clear();
                        ctx2.fillStyle = "rgba(0, 100, 255, 0.05)";
                        roundRect(ctx2, m.stave.x - 10, m.stave.y + 15, m.stave.width + 20, m.stave.getHeight(), 15, true, false);
                        for (var l = 0; l < m.notes.length; l++) {
                            var k = m.vexflow.notes[l];
                            ctx2.fillStyle = "rgba(0, 100, 255, 0.2)";
                            var j = k.comparePoint(c.x, c.y);
                            if (j == "column" || j == "note") {
                                roundRect(ctx2, k.getX() + m.stave.getNoteStartX() + 9, k.getYs()[0] - 9, 18, 18, 5, true, false);
                                d = true
                            }
                        }
                    }
                })
            })
        }
    });
    placeholderCanvas.mouseleave(function () {
        ctx2.clear()
    })
});