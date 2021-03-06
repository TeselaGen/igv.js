/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Broad Institute
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var igv = (function (igv) {

    igv.RulerTrack = function () {

        this.height = 40;
        this.name = "";
        this.id = "ruler";
        this.disableButtons = true;
        this.ignoreTrackMenu = true;
        this.order = -Number.MAX_VALUE;
        this.supportsWholeGenome = true;
        this.rulerSweepers = [];
        this.removable = false;

    };

    igv.RulerTrack.prototype.updateLocusLabel = function () {
        var self = this;

        this.trackView.viewports.forEach(function (viewport) {
            var str;
            str = viewport.genomicState.referenceFrame.showLocus(viewport.$viewport.width());

            // console.log('ruler update label - viewport ' + viewport.id + ' ' + str);
            viewport.$rulerLabel.text( str );
        });

    };

    igv.RulerTrack.prototype.appendMultiPanelCloseButton = function ($viewport, genomicState) {

        var $close,
            $closeButton;

        $viewport.addClass('igv-viewport-ruler');

        $close = $('<div class="igv-viewport-fa-close">');
        $viewport.append($close);

        $closeButton = $('<div>');
        $closeButton.append(igv.createIcon("times-circle"));
        $close.append($closeButton);

        $close.click(function (e) {
            igv.browser.removeMultiLocusPanelWithGenomicState(genomicState, true);
        });

    };

    igv.RulerTrack.prototype.removeRulerSweeperWithLocusIndex = function (index) {
        this.rulerSweepers.splice(index, 1);
    };

    igv.RulerTrack.prototype.getFeatures = function (chr, bpStart, bpEnd) {

        return Promise.resolve([]);

    };

    igv.RulerTrack.prototype.draw = function (options) {
        var self = this,
            key,
            rulerSweeper,
            $viewportContent,
            pixelWidthBP,
            tick,
            label,
            shim,
            center,
            size,
            rect,
            tickHeight;

        key = igv.browser.genomicStateList.indexOf(options.genomicState).toString();
        rulerSweeper = this.rulerSweepers[ key ];

        $viewportContent = $(rulerSweeper.viewport.contentDiv);

        if ('all' === options.referenceFrame.chrName.toLowerCase()) {

            $viewportContent.find('canvas').hide();
            $viewportContent.find('.igv-whole-genome-container').show();
            rulerSweeper.disableMouseHandlers();
        } else {

            $viewportContent.find('.igv-whole-genome-container').hide();
            $viewportContent.find('canvas').show();
            rulerSweeper.addMouseHandlers();

            tickHeight = 6;
            shim = 2;

            pixelWidthBP = 1 + Math.floor(options.referenceFrame.toBP(options.pixelWidth));
            tick = new igv.Tick(pixelWidthBP, options);

            tick.drawTicks(options, tickHeight, shim, this.height);

            igv.graphics.strokeLine(options.context, 0, this.height - shim, options.pixelWidth, this.height - shim);

        }

    };

    igv.Tick = function (pixelWidthBP, options) {

        initialize.call(this, pixelWidthBP, options);

        function initialize(pixelWidthBP, options) {

            var numberOfZeroes,
                majorUnit,
                unitMultiplier,
                numberOfMajorTicks,
                str,
                labelWidthBP;

            if (pixelWidthBP < 10) {
                set.call(this, 1, "bp", 1);
            }

            numberOfZeroes = Math.floor(Math.log10(pixelWidthBP));

            if (numberOfZeroes > 9) {
                majorUnit = "gb";
                unitMultiplier = 1e9;
            } else if (numberOfZeroes > 6) {
                majorUnit = "mb";
                unitMultiplier = 1e6;
            } else if (numberOfZeroes > 3) {
                majorUnit = "kb";
                unitMultiplier = 1e3;
            } else {
                majorUnit = "bp";
                unitMultiplier = 1;
            }

            str = igv.numberFormatter(Math.floor(pixelWidthBP / unitMultiplier)) + " " + majorUnit;
            this.labelWidthBP = Math.round(options.referenceFrame.toBP(options.context.measureText( str ).width));

            numberOfMajorTicks = pixelWidthBP / Math.pow(10, numberOfZeroes - 1);

            if (numberOfMajorTicks < 25) {
                set.call(this, Math.pow(10, numberOfZeroes - 1), majorUnit, unitMultiplier);
            } else {
                set.call(this, Math.pow(10, numberOfZeroes) / 2, majorUnit, unitMultiplier);
            }

            // this.description( (Math.floor(numberOfMajorTicks)) );
        }

        function set(majorTick, majorUnit, unitMultiplier) {

            this.majorTick = majorTick;
            this.majorUnit = majorUnit;

            this.halfTick = majorTick / 2;
            this.quarterTick = majorTick / 4;

            this.minorTick = majorTick / 10.0;

            this.unitMultiplier = unitMultiplier;
        }

    };

    igv.Tick.prototype.drawTicks = function (options, tickHeight, shim, height) {

        var numberOfTicks,
            bp,
            pixel,
            label,
            labelWidth,
            labelX,
            numer,
            floored;

        // major ticks
        numberOfTicks = Math.floor(options.bpStart/this.majorTick) - 1;
        pixel = 0;
        while (pixel < options.pixelWidth) {

            bp = Math.floor(numberOfTicks * this.majorTick);
            pixel = Math.round(options.referenceFrame.toPixels((bp - 1) - options.bpStart + 0.5));

            label = igv.numberFormatter(Math.floor(bp / this.unitMultiplier)) + " " + this.majorUnit;
            labelWidth = options.context.measureText(label).width;
            labelX = pixel - labelWidth / 2;
            igv.graphics.fillText(options.context, label, labelX, height - (tickHeight / 0.75));

            igv.graphics.strokeLine(options.context, pixel, height - tickHeight, pixel, height - shim);

            ++numberOfTicks;
        }

        // major ticks
        numberOfTicks = Math.floor(options.bpStart/this.halfTick) - 1;
        pixel = 0;
        while (pixel < options.pixelWidth) {

            bp = Math.floor(numberOfTicks * this.halfTick);
            pixel = Math.round(options.referenceFrame.toPixels((bp - 1) - options.bpStart + 0.5));
            numer = bp / this.unitMultiplier;
            floored = Math.floor(numer);
            // console.log(numer - floored);
            if (numer === floored && (this.majorTick / this.labelWidthBP) > 8) {
                label = igv.numberFormatter(Math.floor(numer)) + " " + this.majorUnit;
                labelWidth = options.context.measureText(label).width;
                labelX = pixel - labelWidth / 2;
                igv.graphics.fillText(options.context, label, labelX, height - (tickHeight / 0.75));
            }

            igv.graphics.strokeLine(options.context, pixel, height - tickHeight, pixel, height - shim);

            ++numberOfTicks;
        }


    };

    igv.Tick.prototype.description = function (blurb) {
        console.log((blurb || '') + ' tick ' + igv.numberFormatter(this.majorTick) + ' label width ' + igv.numberFormatter(this.labelWidthBP) + ' multiplier ' + this.unitMultiplier);
    };

    return igv;
})(igv || {});
