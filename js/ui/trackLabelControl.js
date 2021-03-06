/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 University of California San Diego
 * Author: Jim Robinson
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

/**
 * Created by dat on 3/26/18.
 */
var igv = (function (igv) {

    igv.TrackLabelControl = function ($parent) {
        var self = this;

        this.$button = $('<div class="igv-nav-bar-button">');
        $parent.append(this.$button);
        this.$button.text('track labels');

        this.$button.on('click', function () {
            if (true === igv.browser.trackLabelsVisible) {
                self.doHide();
            } else {
                self.doShow();
            }
        });
    };

    igv.TrackLabelControl.prototype.doHide = function () {
        this.$button.removeClass('igv-nav-bar-button-clicked');
        igv.browser.hideTrackLabels();
    };

    igv.TrackLabelControl.prototype.doShow = function () {
        this.$button.addClass('igv-nav-bar-button-clicked');
        igv.browser.showTrackLabels();
    };

    igv.TrackLabelControl.prototype.setState = function (trackLabelsVisible) {
        if (true === trackLabelsVisible) {
            this.$button.addClass('igv-nav-bar-button-clicked');
        } else {
            this.$button.removeClass('igv-nav-bar-button-clicked');
        }
    };

    igv.TrackLabelControl.prototype.disable = function () {
        this.doHide();
        this.$button.hide();
    };

    igv.TrackLabelControl.prototype.enable = function () {
        this.$button.show();
    };

    return igv;

}) (igv || {});
