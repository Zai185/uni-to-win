export class TlsMyanmarConverter {

    constructor(data) {
        this.data = data;
        this.useZwsp = false;
        this.sourceEncoding = "";
        this.unicodeSequence = new Array("kinzi", null, "lig", null, "cons", "stack", "asat", "yapin", "yayit",
            "wasway", "hatoh", "eVowel", "uVowel", "lVowel", "anusvara", "aVowel", "lDot", "asat", "lDot", "visarga");
        this.legacySequence = new Array("eVowel", "yayit", null, "lig", null, "cons", "stack", "kinzi",
            "uVowel", "anusvara", "asat", "stack", "yapin", "wasway", "hatoh", "wasway", "yapin", "kinzi",
            "uVowel", "lDot", "lVowel", "lDot", "anusvara", "uVowel", "lVowel", "aVowel", "stack",
            "lDot", "visarga", "asat", "lDot", "visarga", "lDot");
        this.unicodePattern = this.buildRegExp(this.unicodeSequence, true);
        this.legacyPattern = this.buildRegExp(this.legacySequence, false);
        this.fontFamily = "";
        for (var i = 0; i < this.data.fonts.length; i++) {
            if (i > 0) this.fontFamily += ",";
            this.fontFamily += "'" + this.data.fonts[i] + "'";
            tlsMyanmarConverters[this.data.fonts[i].toLowerCase()] = this;
        }
        return this;
    }

    buildRegExp(sequence, isUnicode) {
        var pattern = "";
        var escapeRe = new RegExp("([\\^\\$\\\\\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|])", "g");
        if (!this.reverse) this.reverse = new Object();
        if (!this.minCodePoint) {
            this.minCodePoint = this.data["cons"]["က"].charCodeAt(0);
            this.maxCodePoint = this.minCodePoint;
        }
        for (var i = 0; i < sequence.length; i++) {
            var alternates = new Array();
            if (sequence[i] == null) continue;
            if (this.reverse[sequence[i]] == null)
                this.reverse[sequence[i]] = new Object();
            for (var j in this.data[sequence[i]]) {
                if (this.data[sequence[i]][j] && this.data[sequence[i]][j].length > 0) {
                    for (var k = 0; k < this.data[sequence[i]][j].length; k++) {
                        var codePoint = this.data[sequence[i]][j].charCodeAt(k);
                        if (codePoint != 0x20) {
                            if (codePoint > this.maxCodePoint) this.maxCodePoint = codePoint;
                            if (codePoint < this.minCodePoint) this.minCodePoint = codePoint;
                        }
                    }
                    if (isUnicode) {
                        // items with an underscore suffix are not put into the regexp
                        // but they are used to build the legacy to unicode map
                        var underscore = j.indexOf('_');
                        if (underscore == -1) {
                            this.reverse[sequence[i]][this.data[sequence[i]][j]] = j;
                            alternates.push(j.replace(escapeRe, "\\$1"));
                        }
                        else {
                            this.reverse[sequence[i]][this.data[sequence[i]][j]] = j.substring(0, underscore);
                        }
                    }
                    else {
                        var escapedAlternate = this.data[sequence[i]][j].replace(escapeRe, "\\$1");
                        alternates.push(escapedAlternate);
                    }
                }
            }
            alternates = alternates.sort(this.sortLongestFirst);
            if (sequence[i] == "cons") pattern += "(";
            else if (sequence[i] == "lig") pattern += "(";
            pattern += "(";
            var subPattern = "";
            for (var k = 0; k < alternates.length; k++) {
                if (k == 0) subPattern += alternates[k];
                else subPattern += "|" + alternates[k];
            }
            if (sequence[i] == "stack") {
                this.legacyStackPattern = new RegExp(subPattern);
            }
            if (sequence[i] == "kinzi") {
                this.legacyKinziPattern = new RegExp(subPattern);
            }
            if (sequence[i] == "lig") {
                this.legacyLigPattern = new RegExp(subPattern);
            }
            pattern += subPattern + ")";
            if (sequence[i] == "cons") { }
            else if (sequence[i] == "lig") { pattern += "|" }
            else if (sequence[i] == "stack" && sequence[i - 1] == "cons") { pattern += "?))"; }
            else if (sequence[i] == "wasway" || sequence[i] == "hatoh" ||
                sequence[i] == "uVowel" || sequence[i] == "lVowel" || sequence[i] == "aVowel" ||
                sequence[i] == "lDot" || sequence[i] == "visarga") {
                if (isUnicode)
                    pattern += "?";
                else
                    pattern += "*"; // these are frequently multi-typed
            }
            else { pattern += "?"; }
        }
        return new RegExp(pattern, "g");
    }

    /**
    * @internal
    */
    sortLongestFirst(a, b) {
        if (a.length > b.length) return -1;
        else if (a.length < b.length) return 1;
        else if (a < b) return -1;
        else if (a > b) return 1;
        return 0;
    }

    /**
    * Convert text to Unicode
    * @param inputText in legacy encoding
    * @return converted text in Unicode 5.1
    */
    convertToUnicode(inputText) {
        return this.convertToUnicodeSyllables(inputText).outputText;
    }


    /**
    * Convert text to Unicode
    * @param inputText in legacy encoding
    * @return converted text in Unicode 5.1
    */
    convertToUnicodeSyllables(inputText) {
        var outputText = new String();
        var syllables = new Array();
        var pos = 0;
        this.legacyPattern.lastIndex = 0;
        var prevSyllable = null;
        var match = this.legacyPattern.exec(inputText);
        while (match) {
            if (match.index != pos) {
                prevSyllable = null;
                var nonMatched = inputText.substring(pos, match.index);
                outputText += nonMatched;
                syllables.push(nonMatched);
            }
            pos = this.legacyPattern.lastIndex;
            prevSyllable = this.toUnicodeMapper(inputText, match, prevSyllable);
            syllables.push(prevSyllable);
            outputText += prevSyllable;
            match = this.legacyPattern.exec(inputText);
        }
        if (pos < inputText.length) {
            var nonMatched = inputText.substring(pos, inputText.length);
            outputText += nonMatched;
            syllables.push(nonMatched);
        }
        var ret = new Object();
        ret.outputText = outputText;
        ret.syllables = syllables;
        return ret;
    }

    /**
    * @internal
    */
    toUnicodeMapper(inputText, matchData, prevSyllable) {
        var syllable = new Object();
        for (var g = 1; g < matchData.length; g++) {
            var component = this.legacySequence[g - 1];
            if (component == null || matchData[g] == null) continue;
            // TODO handle repeated components
            if (syllable[component])
                syllable[component] = this.reverse[component][matchData[g]];
            if (!syllable[component])
                // check a few sequences putting ligature components in right place
                if (syllable[component].length > 1) {
                    if (component == "yapin") {
                        if (syllable[component].charAt(1) == "ွ") {
                            syllable["wasway"] = "ွ";
                            if (syllable[component].length > 2) {
                                if (syllable[component].charAt(2) == "ှ")
                                    syllable["hatoh"] = "ှ";
                                else {
                                }
                            }
                            syllable[component] = syllable[component].substring(0, 1);
                        }
                        else if (syllable[component].charAt(1) == "ှ" || syllable[component].length > 2) {
                            syllable["hatoh"] = "ှ";
                            syllable[component] = syllable[component].substring(0, 1);
                        }
                    }
                    else if (component == "yayit") {
                        if (syllable[component].charAt(1) == "ွ")
                            syllable["wasway"] = "ွ";
                        else if (syllable[component].charAt(1) == "ု")
                            syllable["lVowel"] = "ု";
                        else if (syllable[component].charAt(1) == "ိ" &&
                            syllable[component].charAt(2) == "ု") {
                            syllable["uVowel"] = "ိ";
                            syllable["lVowel"] = "ု";
                        }
                        syllable[component] = syllable[component].substring(0, 1);
                    }
                    else if (component == "wasway") {
                        syllable["hatoh"] = syllable[component].substring(1, 2);
                        syllable[component] = syllable[component].substring(0, 1);
                    }
                    else if (component == "hatoh") {
                        syllable["lVowel"] = syllable[component].substring(1, 2);
                        syllable[component] = syllable[component].substring(0, 1);
                    }
                    else if (component == "uVowel") {
                        syllable["anusvara"] = syllable[component].substring(1, 2);
                        syllable[component] = syllable[component].substring(0, 1);
                    }
                    else if (component == "aVowel") {
                        syllable["asat"] = syllable[component].substring(1, 2);
                        syllable[component] = syllable[component].substring(0, 1);
                    }
                    else if (component == "kinzi") {   // kinzi is length 3 to start with
                        if (syllable[component].charAt(3) == "ံ" || syllable[component].length > 4 &&
                            syllable[component].charAt(4) == "ံ")
                            syllable["anusvara"] = "ံ";
                        if (syllable[component].charAt(3) == "ိ" || syllable[component].charAt(3) == "ီ")
                            syllable["uVowel"] = syllable[component].charAt(3);
                        syllable[component] = syllable[component].substring(0, 3);
                    }
                    else if (component == "cons") {
                        if (syllable[component].charAt(1) == "ာ") {
                            syllable["aVowel"] = syllable[component].charAt(1);
                            syllable[component] = syllable[component].substring(0, 1);
                        }
                    }
                    else if (component == "stack" || component == "lig") {
                        // should be safe to ignore, since the relative order is correct
                    }
                }
        }
        // now some post processing
        if (syllable["asat"]) {
            if (!syllable["eVowel"] && (syllable["yayit"] || syllable["yapin"] || syllable["wasway"] ||
                syllable["lVowel"])) {
                syllable["contraction"] = syllable["asat"];
                delete syllable["asat"];
            }
            if (syllable["cons"] == "ဥ") {
                syllable["cons"] = "ဉ";
            }
        }
        if (syllable["cons"] == "ဥ" && syllable["uVowel"] == "ီ") {
            syllable["cons"] = "ဦ";
            delete syllable["uVowel"];
        }
        else if (syllable["cons"] == "စ" && syllable["yapin"]) {
            syllable["cons"] = "ဈ";
            delete syllable["yapin"];
        }
        else if (syllable["cons"] == "သ" && syllable["yayit"]) {
            if (syllable["eVowel"] && syllable["aVowel"] && syllable["asat"]) {
                syllable["cons"] = "ဪ";
                delete syllable["yayit"];
                delete syllable["eVowel"]; delete syllable["aVowel"]; delete syllable["asat"]
            }
            else {
                syllable["cons"] = "ဩ";
                delete syllable["yayit"];
            }
        }
        else if (syllable["cons"] == "၀") {
            // convert zero to wa except in numbers
            if ((matchData[0].length == 1 && matchData.index > 0 &&
                inputText.charAt(matchData.index - 1) == this.data["cons"]["အ"]) ||
                (matchData[0].length > 1 && (matchData.index == 0 ||
                    inputText.charCodeAt(matchData.index - 1) < 0x1040 ||
                    inputText.charCodeAt(matchData.index - 1) > 0x1049)) ||
                (inputText.length > matchData.index + matchData[0].length &&
                    (inputText.charAt(matchData.index + matchData[0].length).match(this.legacyLigPattern) ||
                        (inputText.charCodeAt(matchData.index + matchData[0].length) >= 0x1000 &&
                            inputText.charCodeAt(matchData.index + matchData[0].length) <= 0x1021) ||
                        inputText.charAt(matchData.index + matchData[0].length) == this.data["cons"]["ဿ"])) ||
                (inputText.length > matchData.index + matchData[0].length + 1 &&
                    (inputText.charAt(matchData.index + matchData[0].length + 1) == this.data["asat"]["်"] ||
                        inputText.charAt(matchData.index + matchData[0].length + 1).match(this.legacyStackPattern) ||
                        inputText.charAt(matchData.index + matchData[0].length + 1).match(this.legacyKinziPattern))) ||
                (inputText.length > matchData.index + matchData[0].length + 2 &&
                    inputText.charAt(matchData.index + matchData[0].length + 2) == this.data["asat"]["်"] &&
                    inputText.charAt(matchData.index + matchData[0].length + 1) == this.data["asat"]["့"])) {
                syllable["cons"] = "ဝ";
            }
        }
        else if (syllable["cons"] == "၄" && inputText.length >= matchData.index + matchData[0].length + 3) {
            // check for lagaun
            if (inputText.substr(matchData.index + matchData[0].length, 3) ==
                this.data["cons"]["င"] + this.data["asat"]["်"] + this.data["visarga"]["း"]) {
                syllable["cons"] = "၎";
            }
        }
        else if (syllable["cons"] == "၇" && (syllable["eVowel"] || syllable["uVowel"] || syllable["lVowel"] || syllable["anusvara"] ||
            syllable["aVowel"] || syllable["lDot"] || syllable["asat"] || syllable["wasway"] || syllable["hatoh"])) {
            // check for lagaun
            // if (inputText.substr(matchData.index + matchData[0].length, 3) ==
            // this.data["cons"]["င"] + this.data["asat"]["်"] + this.data["visarga"]["း"])
            syllable["cons"] = "ရ";
        }
        var outputOrder = new Array("kinzi", "lig", "cons", "numbers", "stack", "contraction", "yapin", "yayit",
            "wasway", "hatoh", "eVowel", "uVowel", "lVowel", "anusvara", "aVowel", "lDot", "asat", "visarga");
        var outputText = "";
        if (this.useZwsp && !syllable["kinzi"] && !syllable["lig"] &&
            !syllable["stack"] && !syllable["contraction"] && !syllable["asat"] &&
            (prevSyllable != "​အ") && (prevSyllable != null)) {
            outputText += "\u200B";
        }
        for (var i = 0; i < outputOrder.length; i++) {
            if (syllable[outputOrder[i]])
                outputText += syllable[outputOrder[i]];
        }
        return outputText;
    }

    /**
    * Convert text from Unicode into a legacy encoding.
    * @param inputText in Unicode 5.1
    * @return text in legacy encoding
    */
    convertFromUnicode(inputText) {
        inputText = inputText.replace(/[\u200B\u2060]/g, '');
        var outputText = "";
        var pos = 0;
        this.unicodePattern.lastIndex = 0;
        var match = this.unicodePattern.exec(inputText);
        while (match) {
            outputText += inputText.substring(pos, match.index);
            pos = this.unicodePattern.lastIndex;
            outputText += this.fromUnicodeMapper(inputText, match);
            match = this.unicodePattern.exec(inputText);
        }
        if (pos < inputText.length) outputText += inputText.substring(pos, inputText.length);
        return outputText;
    }

    /**
    * @internal
    */
    fromUnicodeMapper(inputText, matchData) {
        var unicodeSyllable = new Object();
        var syllable = new Object();
        for (var g = 1; g < matchData.length; g++) {
            var component = this.unicodeSequence[g - 1];
            if (component == null || matchData[g] == null) continue;
            // TODO handle repeated components
            unicodeSyllable[component] = matchData[g];
            syllable[component] = this.data[component][matchData[g]];
        }
        if (unicodeSyllable["kinzi"]) {
            if (unicodeSyllable["uVowel"]) {
                if (unicodeSyllable["anusvara"]) {
                    var key = unicodeSyllable["kinzi"] + unicodeSyllable["uVowel"] + unicodeSyllable["anusvara"] + "_lig";
                    if (this.data["kinzi"][key] && this.data["kinzi"][key].length) {
                        syllable["kinzi"] = this.data["kinzi"][key];
                        delete syllable["anusvara"];
                    }
                }
                else {
                    var key = unicodeSyllable["kinzi"] + unicodeSyllable["uVowel"] + "_lig";
                    if (this.data["kinzi"][key] && this.data["kinzi"][key].length) {
                        syllable["kinzi"] = this.data["kinzi"][key];
                        delete syllable["uVowel"];
                    }
                }
            }
            if (unicodeSyllable["anusvara"]) {
                var key = unicodeSyllable["kinzi"] + unicodeSyllable["anusvara"] + "_lig";
                if (this.data["kinzi"][key] && this.data["kinzi"][key].length) {
                    syllable["kinzi"] = this.data["kinzi"][key];
                    delete syllable["anusvara"];
                }
            }
        }
        // check for code points which may not have a direct mapping
        if (unicodeSyllable["cons"] == "ဉ") {
            if (unicodeSyllable["asat"]) {
                syllable["cons"] = this.data["cons"]["ဥ"];
            }
            else if (unicodeSyllable["stack"]) {
                syllable["cons"] = this.data["cons"]["ဉ_alt"];
            }
            else if (unicodeSyllable["aVowel"] && this.data["cons"]["ဉာ_lig"]) {
                syllable["cons"] = this.data["cons"]["ဉာ_lig"];
                delete syllable["aVowel"];
            }
            // this hatoh can occur with aVowel, so no else
            if (unicodeSyllable["hatoh"]) {
                syllable["hatoh"] = this.data["hatoh"]["ှ_small"];
            }


        }
        else if (unicodeSyllable["cons"] == "ဠ") {
            if (unicodeSyllable["hatoh"]) {
                syllable["hatoh"] = this.data["hatoh"]["ှ_small"];
            }
        }
        else if (unicodeSyllable["cons"] == "ဈ" && this.data["cons"]["ဈ"].length == 0) {
            syllable["cons"] = this.data["cons"]["စ"];
            syllable["yapin"] = this.data["yapin"]["ျ"];
        }
        else if (unicodeSyllable["cons"] == "ဩ" && this.data["cons"]["ဩ"].length == 0) {
            syllable["cons"] = this.data["cons"]["သ"];
            syllable["yayit"] = this.data["yayit"]["ြ_wide"];
        }
        else if (unicodeSyllable["cons"] == "ဪ" && this.data["cons"]["ဪ"].length == 0) {
            syllable["cons"] = this.data["သ"];
            syllable["yayit"] = this.data["ြ_wide"];
            syllable["eVowel"] = this.data["ေ"];
            syllable["aVowel"] = this.data["ာ"];
            syllable["asat"] = this.data["်"];
        }
        else if (unicodeSyllable["cons"] == "၎င်း" && this.data["cons"]["၎င်း"].length == 0) {
            if (this.data["၎"].length)
                syllable["cons"] = this.data["cons"]["၎"] + this.data["cons"]["င"] +
                    this.data["asat"]["်"] + this.data["visarga"]["း"];
            else
                syllable["cons"] = this.data["number"]["၄"] + this.data["cons"]["င"] +
                    this.data["asat"]["်"] + this.data["visarga"]["း"];
        }
        else if (unicodeSyllable["cons"] == "န" || unicodeSyllable["cons"] == "ည") {
            if (unicodeSyllable["stack"] || unicodeSyllable["yapin"] || unicodeSyllable["wasway"] ||
                unicodeSyllable["hatoh"] || unicodeSyllable["lVowel"]) {
                syllable["cons"] = this.data["cons"][unicodeSyllable["cons"] + "_alt"];
            }

        }
        else if (unicodeSyllable["cons"] == "ရ") {
            if (unicodeSyllable["yapin"] || unicodeSyllable["wasway"] || unicodeSyllable["lVowel"]) {
                syllable["cons"] = this.data["cons"][unicodeSyllable["cons"] + "_alt"];
            }
            else if (unicodeSyllable["hatoh"] && this.data["cons"][unicodeSyllable["cons"] + "_tall"].length) {
                syllable["cons"] = this.data["cons"][unicodeSyllable["cons"] + "_tall"];
            }
        }
        else if (unicodeSyllable["cons"] == "ဦ") {
            if (this.data["cons"]["ဦ"].length == 0) {
                syllable["cons"] = this.data["cons"]["ဥ"];
                syllable["uVowel"] = this.data["uVowel"]["ီ"];
            }
        }
        // stack with narrow upper cons
        if ((unicodeSyllable["cons"] == "ခ" || unicodeSyllable["cons"] == "ဂ" ||
            unicodeSyllable["cons"] == "င" || unicodeSyllable["cons"] == "စ" ||
            unicodeSyllable["cons"] == "ဎ" || unicodeSyllable["cons"] == "ဒ" ||
            unicodeSyllable["cons"] == "ဓ" || unicodeSyllable["cons"] == "န" ||
            unicodeSyllable["cons"] == "ပ" || unicodeSyllable["cons"] == "ဖ" ||
            unicodeSyllable["cons"] == "ဗ" || unicodeSyllable["cons"] == "မ" ||
            unicodeSyllable["cons"] == "ဝ") &&
            unicodeSyllable["stack"] && this.data["stack"][unicodeSyllable["stack"] + "_narrow"] &&
            this.data["stack"][unicodeSyllable["stack"] + "_narrow"].length > 0) {
            syllable["stack"] = this.data["stack"][unicodeSyllable["stack"] + "_narrow"];
        }
        // yapin variants
        if (unicodeSyllable["yapin"] && (unicodeSyllable["wasway"] || unicodeSyllable["hatoh"])) {
            if (this.data["yapin"]["ျ_alt"].length) {
                syllable["yapin"] = this.data["yapin"]["ျ_alt"];
            }
            else // assume we have the ligatures
            {
                var key = "ျ" + (unicodeSyllable["wasway"] ? "ွ" : "") +
                    (unicodeSyllable["hatoh"] ? "ှ" : "") + "_lig";
                if (this.data["yapin"][key]) {
                    syllable["yapin"] = this.data["yapin"][key];
                    if (unicodeSyllable["wasway"]) delete syllable["wasway"];
                    if (unicodeSyllable["hatoh"]) delete syllable["hatoh"];
                }
            }
        }
        if (unicodeSyllable["yayit"]) {
            var widthVariant = "_wide";
            var upperVariant = "";
            if (unicodeSyllable["cons"] == "ခ" || unicodeSyllable["cons"] == "ဂ" ||
                unicodeSyllable["cons"] == "င" || unicodeSyllable["cons"] == "စ" ||
                unicodeSyllable["cons"] == "ဎ" || unicodeSyllable["cons"] == "ဒ" ||
                unicodeSyllable["cons"] == "ဓ" || unicodeSyllable["cons"] == "န" ||
                unicodeSyllable["cons"] == "ပ" || unicodeSyllable["cons"] == "ဖ" ||
                unicodeSyllable["cons"] == "ဗ" || unicodeSyllable["cons"] == "မ" ||
                unicodeSyllable["cons"] == "ဝ")
                widthVariant = "_narrow";
            if (unicodeSyllable["uVowel"] || unicodeSyllable["kinzi"] || unicodeSyllable["anusvara"])
                upperVariant = "_upper";
            if (unicodeSyllable["wasway"]) {
                if (unicodeSyllable["hatoh"]) {
                    if (this.data["wasway"]["ွှ_small"].length) {
                        if (this.data["yayit"]["ြ" + upperVariant + widthVariant].length) {
                            syllable["yayit"] = this.data["yayit"]["ြ" + upperVariant + widthVariant];
                        }
                        else {
                            if (widthVariant == "_narrow")
                                widthVariant = "";
                            syllable["yayit"] = this.data["yayit"]["ြ" + widthVariant];
                        }
                        syllable["wasway"] = this.data["wasway"]["ွှ_small"];
                        delete syllable["hatoh"];
                    }
                    else if (this.data["yayit"]["ြ_lower" + widthVariant].length) {
                        if (this.data["yayit"]["ြ_lower" + upperVariant + widthVariant].length)
                            syllable["yayit"] = this.data["yayit"]["ြ_lower" + upperVariant + widthVariant];
                        else
                            syllable["yayit"] = this.data["yayit"]["ြ_lower" + widthVariant];
                    }
                }
                else if (this.data["yayit"]["ြွ" + upperVariant + widthVariant].length) {
                    syllable["yayit"] = this.data["yayit"]["ြွ" + upperVariant + widthVariant];
                    delete syllable["wasway"];
                }
                else if (this.data["yayit"]["ြွ" + widthVariant].length) {
                    syllable["yayit"] = this.data["yayit"]["ြွ" + widthVariant];
                    delete syllable["wasway"];
                }
                else if (this.data["yayit"]["ြ_lower_wide"].length) {
                    if (this.data["yayit"]["ြ" + "_lower" + upperVariant + widthVariant].length)
                        syllable["yayit"] = this.data["yayit"]["ြ" + "_lower" + upperVariant + widthVariant];
                    else
                        syllable["yayit"] = this.data["yayit"]["ြ" + "_lower" + widthVariant];
                }
            }
            else if (unicodeSyllable["hatoh"]) {
                if (upperVariant.length == 0 && widthVariant == "_narrow") widthVariant = "";
                if (this.data["yayit"]["ြ" + upperVariant + widthVariant].length) {
                    syllable["yayit"] = this.data["yayit"]["ြ" + upperVariant + widthVariant];
                }
                else if (this.data["yayit"]["ြ" + widthVariant].length) {
                    syllable["yayit"] = this.data["yayit"]["ြ" + widthVariant];
                }
                else {
                    syllable["yayit"] = this.data["yayit"]["ြ"];
                }
                syllable["hatoh"] = this.data["hatoh"]["ှ_small"];
            }
            else if (unicodeSyllable["lVowel"] == "ု" && this.data["yayit"]["ြု_wide"]) {
                if (syllable["uVowel"] == this.data["uVowel"]["ိ"] && this.data["yayit"]["ြို" + widthVariant]) {
                    syllable["yayit"] = this.data["yayit"]["ြို" + widthVariant];
                    delete syllable["uVowel"];
                }
                else {
                    if (this.data["yayit"]["ြု" + upperVariant + widthVariant].length)
                        syllable["yayit"] = this.data["yayit"]["ြု" + upperVariant + widthVariant];
                    else
                        syllable["yayit"] = this.data["yayit"]["ြု" + widthVariant];
                }
                delete syllable["lVowel"];
            }
            else {
                if (upperVariant.length == 0 && widthVariant == "_narrow") widthVariant = "";
                syllable["yayit"] = this.data["yayit"]["ြ" + upperVariant + widthVariant];
            }
        }
        if (syllable["wasway"] && syllable["hatoh"]) {
            delete syllable["hatoh"];
            syllable["wasway"] = this.data["wasway"]["ွှ_lig"];
        }
        if (syllable["hatoh"] && syllable["lVowel"] && !syllable["yapin"] && !syllable["yayit"]) {
            syllable["hatoh"] = this.data["hatoh"]["ှ" + unicodeSyllable["lVowel"] + "_lig"];
            delete syllable["lVowel"];
        }
        if (syllable["uVowel"] && unicodeSyllable["uVowel"] == "ိ" &&
            syllable["anusvara"] && unicodeSyllable["anusvara"] == "ံ") {
            syllable["uVowel"] = this.data["uVowel"]["ိံ_lig"];
            delete syllable["anusvara"];
        }
        if (syllable["lVowel"] && (unicodeSyllable["yayit"] || unicodeSyllable["yapin"] ||
            unicodeSyllable["wasway"] || unicodeSyllable["hatoh"] || unicodeSyllable["lig"] ||
            unicodeSyllable["stack"] || unicodeSyllable["cons"] == "ဍ" || unicodeSyllable["cons"] == "ဋ" ||
            unicodeSyllable["cons"] == "ဌ" || unicodeSyllable["cons"] == "ဈ" ||
            unicodeSyllable["cons"] == "ဥ" || unicodeSyllable["cons"] == "ဠ")) {
            syllable["lVowel"] = this.data["lVowel"][unicodeSyllable["lVowel"] + "_tall"];
        }
        if (unicodeSyllable["aVowel"] && unicodeSyllable["asat"] && unicodeSyllable["aVowel"] == "ါ") {
            syllable["aVowel"] = this.data["aVowel"]["ါ်_lig"];
            delete syllable["asat"];
        }
        if (unicodeSyllable["lDot"] && (unicodeSyllable["aVowel"] ||
            !(unicodeSyllable["yayit"] || unicodeSyllable["lig"] ||
                unicodeSyllable["stack"] || unicodeSyllable["yapin"] || unicodeSyllable["wasway"] ||
                unicodeSyllable["hatoh"] || unicodeSyllable["lVowel"] || unicodeSyllable["cons"] == "ဍ" ||
                unicodeSyllable["cons"] == "ဋ" || unicodeSyllable["cons"] == "ဌ" ||
                unicodeSyllable["cons"] == "ဈ" || unicodeSyllable["cons"] == "ရ"))) {
            if (unicodeSyllable["cons"] == "န")
                syllable["lDot"] = this.data["lDot"]["့_alt"];
            else
                syllable["lDot"] = this.data["lDot"]["့_left"];
        }
        if (unicodeSyllable["lDot"] && !syllable["yayit"] && !(unicodeSyllable["cons"] == "ရ") &&
            ((syllable["hatoh"] && syllable["hatoh"].length == 1 && !syllable["lVowel"]) ||
                (syllable["lVowel"] && syllable["lVowel"] == this.data["lVowel"]["ု"]))) {
            syllable["lDot"] = this.data["lDot"]["့_alt"];
        }
        if (syllable["asat"]) {
            if (!syllable["eVowel"] && (syllable["yayit"] || syllable["yapin"] || syllable["wasway"] ||
                syllable["lVowel"])) {
                syllable["contraction"] = syllable["asat"];
                delete syllable["asat"];
            }
        }
        var outputOrder = new Array("eVowel", "yayit", "lig", "cons", "stack", "contraction", "yapin", "kinzi",
            "wasway", "hatoh", "uVowel", "lVowel", "anusvara", "aVowel", "asat", "lDot", "visarga");
        var outputText = "";
        for (var i = 0; i < outputOrder.length; i++) {
            if (syllable[outputOrder[i]])
                outputText += syllable[outputOrder[i]];
        }
        return outputText;
    }

    /**
    * Compute the frequency of characters matching a Myanmar syllable
    * compared to the number of characters in the code point range of the converter.
    * @param inputText to match against
    * @param isUnicode true to match with genuine Unicode pattern, false to match legacy
    */
    matchFrequency(inputText, isUnicode) {
        var re = this.legacyPattern;
        var retValue = new Object();
        retValue.syllables = new Array();
        if (isUnicode) {
            var utn11 = new TlsMyanmarUtn11();
            re = utn11.pattern;
        }
        var legacyRange = "[" + String.fromCharCode(this.minCodePoint) + "-" +
            String.fromCharCode(this.maxCodePoint) + "]+";
        var codeRange = isUnicode ? new RegExp("[က-႟ꩠ-ꩻ]+", "g") : new RegExp(legacyRange, "g");
        re.lastIndex = 0;
        var pos = 0;
        var matchCharCount = 0;
        var nonMyanmarCount = 0;
        var nonMyanmarSubstrings;
        var match = re.exec(inputText);
        while (match) {
            var nonMatched = inputText.substring(pos, match.index);
            if (nonMatched.length)
                retValue.syllables.push(nonMatched);
            var strippedNonMatched = nonMatched.replace(codeRange, "");
            nonMyanmarCount += strippedNonMatched.length;
            pos = re.lastIndex;
            retValue.syllables.push(match[0]);
            matchCharCount += match[0].length;
            match = re.exec(inputText);
        }
        if (pos != inputText.length) {
            var nonMatched = inputText.substring(pos, inputText.length);
            var strippedNonMatched = nonMatched.replace(codeRange, "");
            nonMyanmarCount += strippedNonMatched.length;
            retValue.syllables.push(nonMatched);
        }
        var freq = (matchCharCount) ? matchCharCount / (inputText.length - nonMyanmarCount) : 0;
        retValue.freq = freq;
        return retValue;
    }

    getFontFamily(isUnicode) {
        return (isUnicode) ? "'Padauk','ThanLwin','Myanmar3','Parabaik'" : this.fontFamily;
    }

    isPseudoUnicode() {
        return (this.minCodePoint == 0x1000);
    }

    TlsMyanmarUtn11() {
        this.kinzi = "((င|ရ|ၚ)်\u1039)?";//1
        this.cons = "(က|ခ|ဂ|ဃ|င|စ|ဆ|ဇ|ဈ|ဉ|ည|ဋ|ဌ|ဍ|ဎ|ဏ|တ|ထ|ဒ|ဓ|န|ပ|ဖ|ဗ|ဘ|မ|ယ|ရ|လ|ဝ|သ|ဟ|ဠ|အ|ဣ|ဤ|ဥ|ဦ|ဧ|ဩ|ဪ|ဿ|၀|၁|၂|၃|၄|၅|၆|၇|၈|၉|၌|၍|၎|၏|ၐ|ၑ|ၒ|ၓ|ၔ|ၕ|ၚ|ၛ|ၜ|ၝ|ၡ|ၥ|ၦ|ၮ|ၯ|ၰ|ၵ|ၶ|ၷ|ၸ|ၹ|ၺ|ၻ|ၼ|ၽ|ၾ|ၿ|ႀ|ႁ|ႎ|႐|႑|႒|႓|႔|႕|႖|႗|႘|႙|႟|ꩠ|ꩡ|ꩢ|ꩣ|ꩤ|ꩥ|ꩦ|ꩧ|ꩨ|ꩩ|ꩪ|ꩫ|ꩬ|ꩭ|ꩮ|ꩯ|ꩱ|ꩲ|ꩳ|ꩴ|ꩵ|ꩶ|꩷|꩸|꩹|ꩺ)";//3
        this.stack = "(\u1039(က|ခ|ဂ|ဃ|င|စ|ဆ|ဇ|ဈ|ဉ|ည|ဋ|ဌ|ဍ|ဎ|ဏ|တ|ထ|ဒ|ဓ|န|ပ|ဖ|ဗ|ဘ|မ|ယ|ရ|လ|ဝ|သ|ဟ|ဠ|အ|ၚ|ၛ|ၜ|ၝ)){0,2}";//4
        this.asat = "(\u103A)?";//6,11,22
        this.medialY = "(ျ|ၞ|ၟ)?";//7
        this.medialR = "(ြ)?";//8
        this.medialW = "(ွ|ႂ)?";//9
        this.medialH = "(ှ|ၠ)?";//10
        // asat 11
        this.eVowel = "(\u1031\u1031|\u1084\u1031|\u1031|\u1084)?";//12
        this.uVowel = "(ိ|ီ|ဲ|ဳ|ဴ|ဵ|ံ|ၱ|ၲ|ၳ|ၴ|ႅ|ႝ)?";//13
        this.lVowel = "(ု|ူ)?";//14
        this.karenVowel = "(ၢ|့)?";//15
        this.shanVowel = "(ႆ)?";//16
        this.aVowel = "(ါ|ာ|ၢ|ၣ|ၧ|ၨ|ႃ)?";//17
        this.anusvara = "(ဲ|ံ)?";//18
        this.pwoTone = "(ၤ|ၩ|ၪ|ၫ|ၬ|ၭ)?";//19
        this.lowerDot = "(့)?";//20
        this.monH = "(ှ)?";//21
        // asat 22
        this.visarga = "(း|ႇ|ႈ|ႉ|ႊ|ႋ|ႌ|ႍ|ႏ|ႚ|ႛ|ႜ)?";//23
        this.redup = "(ႝꩰ)?";//24
        this.section = "(၊|။)?";//25
        this.pattern = new RegExp(this.kinzi + this.cons + this.stack + this.asat + this.medialY + this.medialR + this.medialW + this.medialH + this.asat + this.eVowel + this.uVowel + this.lVowel + this.karenVowel + this.shanVowel + this.aVowel + this.anusvara + this.pwoTone + this.lowerDot + this.monH + this.asat + this.visarga + this.redup + this.section, "g");
        return this;
    }

    findSyllables(inputText) {
        var syllables = new Array();
        var pos = 0;
        var match = this.pattern.exec(inputText);
        while (match) {
            var nonMatched = inputText.substring(pos, match.index);
            if (nonMatched.length)
                syllables.push(nonMatched);
            pos = this.pattern.lastIndex;
            // check for asat or virama and append to previous syllable
            if (syllables.length && ((match[1] != null || match[4] != null ||
                match[6] != null || match[11] != null || match[22] != null) ||
                (syllables[syllables.length - 1] == "အ"))) {
                var lastSyl = syllables.pop();
                lastSyl += match[0];
                syllables.push(lastSyl);
            }
            else {
                syllables.push(match[0]);
            }
            match = this.pattern.exec(inputText);
        }
        if (pos != inputText.length) {
            var nonMatched = inputText.substring(pos, inputText.length);
            syllables.push(nonMatched);
        }
        return syllables;
    }

    /** Convert the text in a given element from source to target encoding
    * @param sourceId textarea from which to take the text
    * @param sourceEncoding
    * @param targetId textarea in which to place result
    * @param targetEncoding
    */
    tlsConvert(unicode) {
        let text = ""
        let sourceEncoding = 'unicode'
        let targetEncoding = 'wininnwa'

        var converter = tlsMyanmarConverters[targetEncoding];
        text = converter.convertFromUnicode(unicode);
        return text
    }


}
