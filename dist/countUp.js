var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var CountUp = /** @class */ (function () {
    function CountUp(target, endVal, options) {
        var _this = this;
        this.endVal = endVal;
        this.options = options;
        this.version = '2.8.0';
        this.defaults = {
            startVal: 0,
            decimalPlaces: 0,
            duration: 2,
            useEasing: true,
            useGrouping: true,
            useIndianSeparators: false,
            smartEasingThreshold: 999,
            smartEasingAmount: 333,
            separator: ',',
            decimal: '.',
            prefix: '',
            suffix: '',
            enableScrollSpy: false,
            scrollSpyDelay: 200,
            scrollSpyOnce: false,
        };
        this.finalEndVal = null;
        this.useEasing = true;
        this.countDown = false;
        this.error = '';
        this.startVal = 0;
        this.paused = true;
        this.once = false;
        this.count = function (timestamp) {
            if (!_this.startTime) {
                _this.startTime = timestamp;
            }
            var progress = timestamp - _this.startTime;
            _this.remaining = _this.duration - progress;
            if (_this.useEasing) {
                _this.frameVal = _this.countDown
                    ? _this.startVal - _this.easingFn(progress, 0, _this.startVal - _this.endVal, _this.duration)
                    : _this.easingFn(progress, _this.startVal, _this.endVal - _this.startVal, _this.duration);
            } else {
                _this.frameVal = _this.startVal + (_this.endVal - _this.startVal) * (progress / _this.duration);
            }
            var wentPast = _this.countDown ? _this.frameVal < _this.endVal : _this.frameVal > _this.endVal;
            _this.frameVal = wentPast ? _this.endVal : _this.frameVal;
            _this.frameVal = Number(_this.frameVal.toFixed(_this.options.decimalPlaces));
            _this.printValue(_this.frameVal);
            if (progress < _this.duration) {
                _this.rAF = requestAnimationFrame(_this.count);
            } else if (_this.finalEndVal !== null) {
                _this.update(_this.finalEndVal);
            } else {
                if (_this.options.onCompleteCallback) {
                    _this.options.onCompleteCallback();
                }
            }
        };
        this.formatNumber = function (num) {
            var neg = num < 0 ? '-' : '';
            var result = Math.abs(num).toFixed(_this.options.decimalPlaces);
            var x = result.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? _this.options.decimal + x[1] : '';
            if (_this.options.useGrouping) {
                var x3 = '';
                var factor = 3,
                    j = 0;
                for (var i = 0, len = x1.length; i < len; ++i) {
                    if (_this.options.useIndianSeparators && i === 4) {
                        factor = 2;
                        j = 1;
                    }
                    if (i !== 0 && j % factor === 0) {
                        x3 = _this.options.separator + x3;
                    }
                    j++;
                    x3 = x1[len - i - 1] + x3;
                }
                x1 = x3;
            }
            if (_this.options.numerals && _this.options.numerals.length) {
                x1 = x1.replace(/[0-9]/g, function (w) { return _this.options.numerals[+w]; });
                x2 = x2.replace(/[0-9]/g, function (w) { return _this.options.numerals[+w]; });
            }
            return neg + _this.options.prefix + x1 + x2 + _this.options.suffix;
        };
        this.easeOutExpo = function (t, b, c, d) {
            return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
        };
        this.options = __assign(__assign({}, this.defaults), options);
        this.formattingFn = this.options.formattingFn || this.formatNumber;
        this.easingFn = this.options.easingFn || this.easeOutExpo;
        this.startVal = this.validateValue(this.options.startVal);
        this.frameVal = this.startVal;
        this.endVal = this.validateValue(endVal);
        this.options.decimalPlaces = Math.max(0 || this.options.decimalPlaces);
        this.resetDuration();
        this.options.separator = String(this.options.separator);
        this.useEasing = this.options.useEasing;
        if (this.options.separator === '') {
            this.options.useGrouping = false;
        }
        this.el = typeof target === 'string' ? document.getElementById(target) : target;
        if (this.el) {
            this.printValue(this.startVal);
        } else {
            this.error = '[CountUp] target is null or undefined';
        }
    }

    CountUp.prototype.start = function (callback) {
        if (this.error) return;
        if (this.options.onStartCallback) this.options.onStartCallback();
        if (callback) this.options.onCompleteCallback = callback;
        if (this.duration > 0) {
            this.determineDirectionAndSmartEasing();
            this.paused = false;
            this.rAF = requestAnimationFrame(this.count);
        } else {
            this.printValue(this.endVal);
        }
    };

    CountUp.prototype.pauseResume = function () {
        if (!this.paused) {
            cancelAnimationFrame(this.rAF);
        } else {
            this.startTime = null;
            this.duration = this.remaining;
            this.startVal = this.frameVal;
            this.determineDirectionAndSmartEasing();
            this.rAF = requestAnimationFrame(this.count);
        }
        this.paused = !this.paused;
    };

    CountUp.prototype.reset = function () {
        cancelAnimationFrame(this.rAF);
        this.paused = true;
        this.resetDuration();
        this.startVal = this.validateValue(this.options.startVal);
        this.frameVal = this.startVal;
        this.printValue(this.startVal);
    };

    CountUp.prototype.update = function (newEndVal) {
        cancelAnimationFrame(this.rAF);
        this.startTime = null;
        this.endVal = this.validateValue(newEndVal);
        if (this.endVal === this.frameVal) return;
        this.startVal = this.frameVal;
        this.resetDuration();
        this.determineDirectionAndSmartEasing();
        this.rAF = requestAnimationFrame(this.count);
    };

    CountUp.prototype.printValue = function (val) {
        if (!this.el) return;
        var result = this.formattingFn(val);
        if (this.el.tagName === 'INPUT') {
            this.el.value = result;
        } else if (this.el.tagName === 'text' || this.el.tagName === 'tspan') {
            this.el.textContent = result;
        } else {
            this.el.innerHTML = result;
        }
    };

    CountUp.prototype.validateValue = function (value) {
        var newValue = Number(value);
        if (isNaN(newValue)) {
            this.error = `[CountUp] invalid start or end value: ${value}`;
            return null;
        }
        return newValue;
    };

    CountUp.prototype.resetDuration = function () {
        this.startTime = null;
        this.duration = Number(this.options.duration) * 1000;
        this.remaining = this.duration;
    };

    CountUp.prototype.determineDirectionAndSmartEasing = function () {
        console.log("StartVal:", this.startVal, "EndVal:", this.endVal);
        if (isNaN(this.startVal) || isNaN(this.endVal)) {
            console.error("[CountUp] Invalid values detected in determineDirectionAndSmartEasing");
            return;
        }
        var end = (this.finalEndVal) ? this.finalEndVal : this.endVal;
        this.countDown = (this.startVal > end);
        var animateAmount = end - this.startVal;
        if (Math.abs(animateAmount) > this.options.smartEasingThreshold && this.options.useEasing) {
            this.finalEndVal = end;
            var up = (this.countDown) ? 1 : -1;
            this.endVal = end + (up * this.options.smartEasingAmount);
            this.duration = this.duration / 2;
        } else {
            this.endVal = end;
            this.finalEndVal = null;
        }
        this.useEasing = this.finalEndVal !== null ? false : this.options.useEasing;
    };
    

    return CountUp;
})();

// Attach to the global window object
window.CountUp = CountUp;


