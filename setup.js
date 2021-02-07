(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const tmi = require('tmi.js');

const appendQuery = require('append-query');

let setupButton = document.querySelector("#pointsetupbutton");
let setupScreen = document.querySelector("#channelpointsetup");
let setupCancelButton = document.querySelector("#setupcancel");
let channelInput = document.querySelector("#channel");
let urlRequestButton = document.querySelector("#url-request");

let rewardId;
let actualChannelName;
function scanChannelReward(channel) {
    var twitchClient = new tmi.client({
        options: {
            debug: false
        },
        connection: {
            secure: true,
            cluster: "aws",
            reconnect: true
        },
        channels: [channel]
    });

    twitchClient.connect();
    twitchClient.on('chat', (channel, userstate, message) => {
        let isMod = userstate.mod || userstate['user-type'] === 'mod';
        let isBroadcaster = channel.slice(1) === userstate.username;
        let isModUp = isMod || isBroadcaster;

        if ((userstate['msg-id'] == 'highlighted-message' || userstate['custom-reward-id']) && isModUp && message == "!setup") {
            clearInterval(observerIntervalId);
            channelPlaceholder.style = "color: #44EE44";
            channelPlaceholder.innerHTML = "<b>Success!</b> TTS reward recognized. :) <i style=\"color:gray\">Wait a few seconds...</i>";
            rewardId = userstate['custom-reward-id'] || userstate['msg-id'];
            setupButton.style = "background-color:rgba(20, 50, 20, 0.6);";
            setupCancelButton.style = "display: none";
            actualChannelName = channelInput.value;
            document.getElementById('current-channel').innerHTML = "Logged in as " + actualChannelName;
            checkReadynessForButton();
            setTimeout(() => {
                setupScreen.style = "display: none;";
                setupCancelButton.style = "";
                channelPlaceholder.style = "color: #AAAAAA";
                observerIntervalId = setInterval(observerCallback, 600);
            }, 6000);
            twitchClient.disconnect();
        }
    });
}

let channelPlaceholder = document.querySelector("#channel-placeholder");
let dotCounter = 1;
let observerCallback = () => {
    let progressName = "Observing chat of " + channelInput.value;

    for (let i = 0; i < dotCounter; i++) {
        progressName += ".";
    }
    if (dotCounter++ >= 3) dotCounter = 1;

    channelPlaceholder.innerHTML = progressName;
};

let observerIntervalId = setInterval(observerCallback, 600);

let cacheTtsRewardId;
setupButton.onclick = () => {
    if (!channelInput.value) return;

    setupScreen.style = "";

    cacheTtsRewardId = rewardId;
    scanChannelReward(channelInput.value);
    checkReadynessForButton();
}

setupCancelButton.onclick = () => {
    setupScreen.style = "display: none;";

    rewardId = cacheTtsRewardId;
    checkReadynessForButton();
}

channelInput.onchange = () => {
    if (!channelInput.value || channelInput.value == "") {
        setupButton.style = "display: none;"
    } else {
        setupButton.style = ""
    }
    setupButton.style = "background-color:rgba(0, 0, 0, 0.6);";
    checkReadynessForButton();
}

function checkReadynessForButton() {
    if (channelInput.value && channelInput.value != "" && rewardId) {
        document.getElementById("url-request").style = "";
    } else {
        document.getElementById("url-request").style = "display: none;";
    }
}

let urlDisplay = document.getElementById("url-display");
let urlInput = document.getElementById("url-input");
urlRequestButton.onclick = () => {
    let voice = document.getElementById("voice-selection").value;
    
    let url = appendQuery(new URL(".", document.baseURI).href, {
        c: actualChannelName,
        r: rewardId,
        v: voice ? voice : "Brian"
    });

    urlInput.value = url;
    urlDisplay.style = "";
}


/*Dropdown Menu*/
$('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);
});
$('.dropdown').focusout(function () {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
});
$('.dropdown .dropdown-menu li').click(function () {
    $(this).parents('.dropdown').find('span').text($(this).text());
    document.getElementById("voice-placeholder").style = "";
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
});
/*End Dropdown Menu*/


$('.dropdown-menu li').click(() => {
    let input = '<b>' + document.getElementById("voice-selection").value + '</b>';
    document.querySelector('#volume-placeholder').innerHTML = input;
});
},{"append-query":2,"tmi.js":10}],2:[function(require,module,exports){
var querystring = require('querystring')
  , extend = require('extend')
  , url = require('url')

module.defaults = {
  encodeComponents: true
  , removeNull: false
}

module.exports = function appendQuery(uri, q, opts) {
  var parts = url.parse(uri, true)
    , originalQuery = parts.query
    , queryToAppend = typeof q === 'string' ? querystring.parse(q) : q
    , parsedQuery = extend(true, {}, parts.query, queryToAppend)
    , opts = extend({}, module.defaults, opts || {});

  parts.query = null
  var queryString = serialize(parsedQuery, opts)
  parts.search = queryString ? '?' + queryString : null
  return url.format(parts)
}

// serialize an object recursively
function serialize(obj, opts, prefix) {
  var str = []
    , useArraySyntax = false

  // if there's a prefix, and this object is an array, use array syntax
  // i.e., `prefix[]=foo&prefix[]=bar` instead of `prefix[0]=foo&prefix[1]=bar`
  if (Array.isArray(obj) && prefix) {
    useArraySyntax = true
  }

  Object.keys(obj).forEach(function (prop) {
    var key, query, val = obj[prop]

    key = prefix ?
      prefix + '[' + (useArraySyntax ? '' : prop) + ']' :
      prop

    if (val === null) {
      if (opts.removeNull) {
        return
      }
      query = opts.encodeComponents ? encodeURIComponent(key) : key
    } else if (typeof val === 'object') {
      query = serialize(val, opts, key)
    } else {
      query = opts.encodeComponents ?
        encodeURIComponent(key) + '=' + encodeURIComponent(val) :
        key + '=' + val;
    }
    str.push(query)
  })

  return str.join('&')
}

},{"extend":3,"querystring":9,"url":19}],3:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	'use strict';

	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

module.exports = function extend() {
	'use strict';

	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],9:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":7,"./encode":8}],10:[function(require,module,exports){
"use strict";

module.exports = {
	client: require("./lib/client"),
	Client: require("./lib/client")
};

},{"./lib/client":12}],11:[function(require,module,exports){
"use strict";

var request = require("request");
var _ = require("./utils");

var api = function api(options, callback) {
    // Set the url to options.uri or options.url..
    var url = _.get(options.url, null) === null ? _.get(options.uri, null) : _.get(options.url, null);

    // Make sure it is a valid url..
    if (!_.isURL(url)) {
        url = "https://api.twitch.tv/kraken" + (url[0] === "/" ? url : "/" + url);
    }

    // We are inside a Node application, so we can use the request module..
    if (_.isNode()) {
        request(_.merge({ method: "GET", json: true }, options, { url: url }), callback);
    }
    // Inside an extension -> we cannot use jsonp!
    else if (_.isExtension() || _.isReactNative()) {
            options = _.merge({ url: url, method: "GET", headers: {} }, options);
            // prepare request
            var xhr = new XMLHttpRequest();
            xhr.open(options.method, options.url, true);
            for (var name in options.headers) {
                xhr.setRequestHeader(name, options.headers[name]);
            }
            xhr.responseType = "json";
            // set request handler
            xhr.addEventListener("load", function (ev) {
                if (xhr.readyState == 4) {
                    if (xhr.status != 200) {
                        callback(xhr.status, null, null);
                    } else {
                        callback(null, null, xhr.response);
                    }
                }
            });
            // submit
            xhr.send();
        }
        // Inside a web application, use jsonp..
        else {
                // Callbacks must match the regex [a-zA-Z_$][\w$]*(\.[a-zA-Z_$][\w$]*)*
                var callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());
                window[callbackName] = function (data) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    callback(null, null, data);
                };

                // Inject the script in the document..
                var script = document.createElement("script");
                script.src = "" + url + (url.includes("?") ? "&" : "?") + "callback=" + callbackName;
                document.body.appendChild(script);
            }
};

module.exports = api;

},{"./utils":18,"request":4}],12:[function(require,module,exports){
(function (global){
"use strict";

var api = require("./api");
var commands = require("./commands");
var eventEmitter = require("./events").EventEmitter;
var logger = require("./logger");
var parse = require("./parser");
var timer = require("./timer");
var ws = global.WebSocket || global.MozWebSocket || require("ws");
var _ = require("./utils");

// Client instance..
var client = function client(opts) {
    if (this instanceof client === false) {
        return new client(opts);
    }
    this.setMaxListeners(0);

    this.opts = _.get(opts, {});
    this.opts.channels = this.opts.channels || [];
    this.opts.connection = this.opts.connection || {};
    this.opts.identity = this.opts.identity || {};
    this.opts.options = this.opts.options || {};

    this.clientId = _.get(this.opts.options.clientId, null);

    this.maxReconnectAttempts = _.get(this.opts.connection.maxReconnectAttempts, Infinity);
    this.maxReconnectInterval = _.get(this.opts.connection.maxReconnectInterval, 30000);
    this.reconnect = _.get(this.opts.connection.reconnect, false);
    this.reconnectDecay = _.get(this.opts.connection.reconnectDecay, 1.5);
    this.reconnectInterval = _.get(this.opts.connection.reconnectInterval, 1000);

    this.reconnecting = false;
    this.reconnections = 0;
    this.reconnectTimer = this.reconnectInterval;

    this.secure = _.get(this.opts.connection.secure, false);

    // Raw data and object for emote-sets..
    this.emotes = "";
    this.emotesets = {};

    this.channels = [];
    this.currentLatency = 0;
    this.globaluserstate = {};
    this.lastJoined = "";
    this.latency = new Date();
    this.moderators = {};
    this.pingLoop = null;
    this.pingTimeout = null;
    this.reason = "";
    this.username = "";
    this.userstate = {};
    this.wasCloseCalled = false;
    this.ws = null;

    // Create the logger..
    var level = "error";
    if (this.opts.options.debug) {
        level = "info";
    }
    this.log = this.opts.logger || logger;

    try {
        logger.setLevel(level);
    } catch (e) {};

    // Format the channel names..
    this.opts.channels.forEach(function (part, index, theArray) {
        theArray[index] = _.channel(part);
    });

    eventEmitter.call(this);
};

_.inherits(client, eventEmitter);

client.prototype.api = api;

// Put all commands in prototype..
for (var methodName in commands) {
    client.prototype[methodName] = commands[methodName];
}

// Handle parsed chat server message..
client.prototype.handleMessage = function handleMessage(message) {
    var _this = this;

    if (_.isNull(message)) {
        return;
    }

    this.emit("raw_message", JSON.parse(JSON.stringify(message)), message);

    var channel = _.channel(_.get(message.params[0], null));
    var msg = _.get(message.params[1], null);
    var msgid = _.get(message.tags["msg-id"], null);

    // Parse badges, badge-info and emotes..
    message.tags = parse.badges(parse.badgeInfo(parse.emotes(message.tags)));

    // Transform IRCv3 tags..
    if (message.tags) {
        var tags = message.tags;
        for (var key in tags) {
            if (key !== "emote-sets" && key !== "ban-duration" && key !== "bits") {
                var value = tags[key];
                if (_.isBoolean(value)) {
                    value = null;
                } else if (value === "1") {
                    value = true;
                } else if (value === "0") {
                    value = false;
                } else if (_.isString(value)) {
                    value = _.unescapeIRC(value);
                }
                tags[key] = value;
            }
        }
    }

    // Messages with no prefix..
    if (_.isNull(message.prefix)) {
        switch (message.command) {
            // Received PING from server..
            case "PING":
                this.emit("ping");
                if (!_.isNull(this.ws) && this.ws.readyState === 1) {
                    this.ws.send("PONG");
                }
                break;

            // Received PONG from server, return current latency..
            case "PONG":
                var currDate = new Date();
                this.currentLatency = (currDate.getTime() - this.latency.getTime()) / 1000;
                this.emits(["pong", "_promisePing"], [[this.currentLatency]]);

                clearTimeout(this.pingTimeout);
                break;

            default:
                this.log.warn("Could not parse message with no prefix:\n" + JSON.stringify(message, null, 4));
                break;
        }
    }

    // Messages with "tmi.twitch.tv" as a prefix..
    else if (message.prefix === "tmi.twitch.tv") {
            switch (message.command) {
                case "002":
                case "003":
                case "004":
                case "375":
                case "376":
                case "CAP":
                    break;

                // Retrieve username from server..
                case "001":
                    this.username = message.params[0];
                    break;

                // Connected to server..
                case "372":
                    this.log.info("Connected to server.");
                    this.userstate["#tmijs"] = {};
                    this.emits(["connected", "_promiseConnect"], [[this.server, this.port], [null]]);
                    this.reconnections = 0;
                    this.reconnectTimer = this.reconnectInterval;

                    // Set an internal ping timeout check interval..
                    this.pingLoop = setInterval(function () {
                        // Make sure the connection is opened before sending the message..
                        if (!_.isNull(_this.ws) && _this.ws.readyState === 1) {
                            _this.ws.send("PING");
                        }
                        _this.latency = new Date();
                        _this.pingTimeout = setTimeout(function () {
                            if (!_.isNull(_this.ws)) {
                                _this.wasCloseCalled = false;
                                _this.log.error("Ping timeout.");
                                _this.ws.close();

                                clearInterval(_this.pingLoop);
                                clearTimeout(_this.pingTimeout);
                            }
                        }, _.get(_this.opts.connection.timeout, 9999));
                    }, 60000);

                    // Join all the channels from configuration with a 2 seconds interval..
                    var joinQueue = new timer.queue(2000);
                    var joinChannels = _.union(this.opts.channels, this.channels);
                    this.channels = [];

                    var _loop = function _loop() {
                        var channel = joinChannels[i];
                        joinQueue.add(function () {
                            if (!_.isNull(_this.ws) && _this.ws.readyState === 1) {
                                _this.join(channel).catch(function (err) {
                                    _this.log.error(err);
                                });
                            }
                        });
                    };

                    for (var i = 0; i < joinChannels.length; i++) {
                        _loop();
                    }

                    joinQueue.run();
                    break;

                // https://github.com/justintv/Twitch-API/blob/master/chat/capabilities.md#notice
                case "NOTICE":
                    var nullArr = [null];
                    var noticeArr = [channel, msgid, msg];
                    var msgidArr = [msgid];
                    var channelTrueArr = [channel, true];
                    var channelFalseArr = [channel, false];
                    var noticeAndNull = [noticeArr, nullArr];
                    var noticeAndMsgid = [noticeArr, msgidArr];
                    var basicLog = "[" + channel + "] " + msg;
                    switch (msgid) {
                        // This room is now in subscribers-only mode.
                        case "subs_on":
                            this.log.info("[" + channel + "] This room is now in subscribers-only mode.");
                            this.emits(["subscriber", "subscribers", "_promiseSubscribers"], [channelTrueArr, channelTrueArr, nullArr]);
                            break;

                        // This room is no longer in subscribers-only mode.
                        case "subs_off":
                            this.log.info("[" + channel + "] This room is no longer in subscribers-only mode.");
                            this.emits(["subscriber", "subscribers", "_promiseSubscribersoff"], [channelFalseArr, channelFalseArr, nullArr]);
                            break;

                        // This room is now in emote-only mode.
                        case "emote_only_on":
                            this.log.info("[" + channel + "] This room is now in emote-only mode.");
                            this.emits(["emoteonly", "_promiseEmoteonly"], [channelTrueArr, nullArr]);
                            break;

                        // This room is no longer in emote-only mode.
                        case "emote_only_off":
                            this.log.info("[" + channel + "] This room is no longer in emote-only mode.");
                            this.emits(["emoteonly", "_promiseEmoteonlyoff"], [channelFalseArr, nullArr]);
                            break;

                        // Do not handle slow_on/off here, listen to the ROOMSTATE notice instead as it returns the delay.
                        case "slow_on":
                        case "slow_off":
                            break;

                        // Do not handle followers_on/off here, listen to the ROOMSTATE notice instead as it returns the delay.
                        case "followers_on_zero":
                        case "followers_on":
                        case "followers_off":
                            break;

                        // This room is now in r9k mode.
                        case "r9k_on":
                            this.log.info("[" + channel + "] This room is now in r9k mode.");
                            this.emits(["r9kmode", "r9kbeta", "_promiseR9kbeta"], [channelTrueArr, channelTrueArr, nullArr]);
                            break;

                        // This room is no longer in r9k mode.
                        case "r9k_off":
                            this.log.info("[" + channel + "] This room is no longer in r9k mode.");
                            this.emits(["r9kmode", "r9kbeta", "_promiseR9kbetaoff"], [channelFalseArr, channelFalseArr, nullArr]);
                            break;

                        // The moderators of this room are: [..., ...]
                        case "room_mods":
                            var mods = msg.split(": ")[1].toLowerCase().split(", ").filter(function (n) {
                                return n;
                            });

                            this.emits(["_promiseMods", "mods"], [[null, mods], [channel, mods]]);
                            break;

                        // There are no moderators for this room.
                        case "no_mods":
                            this.emits(["_promiseMods", "mods"], [[null, []], [channel, []]]);
                            break;

                        // The VIPs of this channel are: [..., ...]
                        case "vips_success":
                            if (msg.endsWith(".")) {
                                msg = msg.slice(0, -1);
                            }
                            var vips = msg.split(": ")[1].toLowerCase().split(", ").filter(function (n) {
                                return n;
                            });

                            this.emits(["_promiseVips", "vips"], [[null, vips], [channel, vips]]);
                            break;

                        // There are no VIPs for this room.
                        case "no_vips":
                            this.emits(["_promiseVips", "vips"], [[null, []], [channel, []]]);
                            break;

                        // Ban command failed..
                        case "already_banned":
                        case "bad_ban_admin":
                        case "bad_ban_broadcaster":
                        case "bad_ban_global_mod":
                        case "bad_ban_self":
                        case "bad_ban_staff":
                        case "usage_ban":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseBan"], noticeAndMsgid);
                            break;

                        // Ban command success..
                        case "ban_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseBan"], noticeAndNull);
                            break;

                        // Clear command failed..
                        case "usage_clear":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseClear"], noticeAndMsgid);
                            break;

                        // Mods command failed..
                        case "usage_mods":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseMods"], [noticeArr, [msgid, []]]);
                            break;

                        // Mod command success..
                        case "mod_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseMod"], noticeAndNull);
                            break;

                        // VIPs command failed..
                        case "usage_vips":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseVips"], [noticeArr, [msgid, []]]);
                            break;

                        // VIP command failed..
                        case "usage_vip":
                        case "bad_vip_grantee_banned":
                        case "bad_vip_grantee_already_vip":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseVip"], [noticeArr, [msgid, []]]);
                            break;

                        // VIP command success..
                        case "vip_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseVip"], noticeAndNull);
                            break;

                        // Mod command failed..
                        case "usage_mod":
                        case "bad_mod_banned":
                        case "bad_mod_mod":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseMod"], noticeAndMsgid);
                            break;

                        // Unmod command success..
                        case "unmod_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseUnmod"], noticeAndNull);
                            break;

                        // Unvip command success...
                        case "unvip_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseUnvip"], noticeAndNull);
                            break;

                        // Unmod command failed..
                        case "usage_unmod":
                        case "bad_unmod_mod":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseUnmod"], noticeAndMsgid);
                            break;

                        // Unvip command failed..
                        case "usage_unvip":
                        case "bad_unvip_grantee_not_vip":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseUnvip"], noticeAndMsgid);
                            break;

                        // Color command success..
                        case "color_changed":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseColor"], noticeAndNull);
                            break;

                        // Color command failed..
                        case "usage_color":
                        case "turbo_only_color":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseColor"], noticeAndMsgid);
                            break;

                        // Commercial command success..
                        case "commercial_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseCommercial"], noticeAndNull);
                            break;

                        // Commercial command failed..
                        case "usage_commercial":
                        case "bad_commercial_error":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseCommercial"], noticeAndMsgid);
                            break;

                        // Host command success..
                        case "hosts_remaining":
                            this.log.info(basicLog);
                            var remainingHost = !isNaN(msg[0]) ? parseInt(msg[0]) : 0;
                            this.emits(["notice", "_promiseHost"], [noticeArr, [null, ~~remainingHost]]);
                            break;

                        // Host command failed..
                        case "bad_host_hosting":
                        case "bad_host_rate_exceeded":
                        case "bad_host_error":
                        case "usage_host":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseHost"], [noticeArr, [msgid, null]]);
                            break;

                        // r9kbeta command failed..
                        case "already_r9k_on":
                        case "usage_r9k_on":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseR9kbeta"], noticeAndMsgid);
                            break;

                        // r9kbetaoff command failed..
                        case "already_r9k_off":
                        case "usage_r9k_off":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseR9kbetaoff"], noticeAndMsgid);
                            break;

                        // Timeout command success..
                        case "timeout_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseTimeout"], noticeAndNull);
                            break;

                        case "delete_message_success":
                            this.log.info("[" + channel + " " + msg + "]");
                            this.emits(["notice", "_promiseDeletemessage"], noticeAndNull);

                        // Subscribersoff command failed..
                        case "already_subs_off":
                        case "usage_subs_off":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseSubscribersoff"], noticeAndMsgid);
                            break;

                        // Subscribers command failed..
                        case "already_subs_on":
                        case "usage_subs_on":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseSubscribers"], noticeAndMsgid);
                            break;

                        // Emoteonlyoff command failed..
                        case "already_emote_only_off":
                        case "usage_emote_only_off":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseEmoteonlyoff"], noticeAndMsgid);
                            break;

                        // Emoteonly command failed..
                        case "already_emote_only_on":
                        case "usage_emote_only_on":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseEmoteonly"], noticeAndMsgid);
                            break;

                        // Slow command failed..
                        case "usage_slow_on":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseSlow"], noticeAndMsgid);
                            break;

                        // Slowoff command failed..
                        case "usage_slow_off":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseSlowoff"], noticeAndMsgid);
                            break;

                        // Timeout command failed..
                        case "usage_timeout":
                        case "bad_timeout_admin":
                        case "bad_timeout_broadcaster":
                        case "bad_timeout_duration":
                        case "bad_timeout_global_mod":
                        case "bad_timeout_self":
                        case "bad_timeout_staff":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseTimeout"], noticeAndMsgid);
                            break;

                        // Unban command success..
                        // Unban can also be used to cancel an active timeout.
                        case "untimeout_success":
                        case "unban_success":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseUnban"], noticeAndNull);
                            break;

                        // Unban command failed..
                        case "usage_unban":
                        case "bad_unban_no_ban":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseUnban"], noticeAndMsgid);
                            break;

                        // Delete command failed..
                        case "usage_delete":
                        case "bad_delete_message_error":
                        case "bad_delete_message_broadcaster":
                        case "bad_delete_message_mod":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseDeletemessage"], noticeAndMsgid);
                            break;

                        // Unhost command failed..
                        case "usage_unhost":
                        case "not_hosting":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseUnhost"], noticeAndMsgid);
                            break;

                        // Whisper command failed..
                        case "whisper_invalid_login":
                        case "whisper_invalid_self":
                        case "whisper_limit_per_min":
                        case "whisper_limit_per_sec":
                        case "whisper_restricted_recipient":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseWhisper"], noticeAndMsgid);
                            break;

                        // Permission error..
                        case "no_permission":
                        case "msg_banned":
                        case "msg_room_not_found":
                        case "msg_channel_suspended":
                        case "tos_ban":
                            this.log.info(basicLog);
                            this.emits(["notice", "_promiseBan", "_promiseClear", "_promiseUnban", "_promiseTimeout", "_promiseDeletemessage", "_promiseMods", "_promiseMod", "_promiseUnmod", "_promiseVips", "_promiseVip", "_promiseUnvip", "_promiseCommercial", "_promiseHost", "_promiseUnhost", "_promiseJoin", "_promisePart", "_promiseR9kbeta", "_promiseR9kbetaoff", "_promiseSlow", "_promiseSlowoff", "_promiseFollowers", "_promiseFollowersoff", "_promiseSubscribers", "_promiseSubscribersoff", "_promiseEmoteonly", "_promiseEmoteonlyoff"], [noticeArr, [msgid, channel]]);
                            break;

                        // Automod-related..
                        case "msg_rejected":
                        case "msg_rejected_mandatory":
                            this.log.info(basicLog);
                            this.emit("automod", channel, msgid, msg);
                            break;

                        // Unrecognized command..
                        case "unrecognized_cmd":
                            this.log.info(basicLog);
                            this.emit("notice", channel, msgid, msg);
                            break;

                        // Send the following msg-ids to the notice event listener..
                        case "cmds_available":
                        case "host_target_went_offline":
                        case "msg_censored_broadcaster":
                        case "msg_duplicate":
                        case "msg_emoteonly":
                        case "msg_verified_email":
                        case "msg_ratelimit":
                        case "msg_subsonly":
                        case "msg_timedout":
                        case "msg_bad_characters":
                        case "msg_channel_blocked":
                        case "msg_facebook":
                        case "msg_followersonly":
                        case "msg_followersonly_followed":
                        case "msg_followersonly_zero":
                        case "msg_slowmode":
                        case "msg_suspended":
                        case "no_help":
                        case "usage_disconnect":
                        case "usage_help":
                        case "usage_me":
                            this.log.info(basicLog);
                            this.emit("notice", channel, msgid, msg);
                            break;

                        // Ignore this because we are already listening to HOSTTARGET..
                        case "host_on":
                        case "host_off":
                            break;

                        default:
                            if (msg.includes("Login unsuccessful") || msg.includes("Login authentication failed")) {
                                this.wasCloseCalled = false;
                                this.reconnect = false;
                                this.reason = msg;
                                this.log.error(this.reason);
                                this.ws.close();
                            } else if (msg.includes("Error logging in") || msg.includes("Improperly formatted auth")) {
                                this.wasCloseCalled = false;
                                this.reconnect = false;
                                this.reason = msg;
                                this.log.error(this.reason);
                                this.ws.close();
                            } else if (msg.includes("Invalid NICK")) {
                                this.wasCloseCalled = false;
                                this.reconnect = false;
                                this.reason = "Invalid NICK.";
                                this.log.error(this.reason);
                                this.ws.close();
                            } else {
                                this.log.warn("Could not parse NOTICE from tmi.twitch.tv:\n" + JSON.stringify(message, null, 4));
                            }
                            break;
                    }
                    break;

                // Handle subanniversary / resub..
                case "USERNOTICE":
                    var username = message.tags["display-name"] || message.tags["login"];
                    var plan = message.tags["msg-param-sub-plan"] || "";
                    var planName = _.unescapeIRC(_.get(message.tags["msg-param-sub-plan-name"], "")) || null;
                    var prime = plan.includes("Prime");
                    var methods = { prime: prime, plan: plan, planName: planName };
                    var userstate = message.tags;
                    var streakMonths = ~~(message.tags["msg-param-streak-months"] || 0);
                    var recipient = message.tags["msg-param-recipient-display-name"] || message.tags["msg-param-recipient-user-name"];
                    var giftSubCount = ~~message.tags["msg-param-mass-gift-count"];
                    userstate["message-type"] = msgid;

                    switch (msgid) {
                        // Handle resub
                        case "resub":
                            this.emits(["resub", "subanniversary"], [[channel, username, streakMonths, msg, userstate, methods]]);
                            break;

                        // Handle sub
                        case "sub":
                            this.emit("subscription", channel, username, methods, msg, userstate);
                            break;

                        // Handle gift sub
                        case "subgift":
                            this.emit("subgift", channel, username, streakMonths, recipient, methods, userstate);
                            break;

                        // Handle anonymous gift sub
                        // Need proof that this event occur
                        case "anonsubgift":
                            this.emit("anonsubgift", channel, streakMonths, recipient, methods, userstate);
                            break;

                        // Handle random gift subs
                        case "submysterygift":
                            this.emit("submysterygift", channel, username, giftSubCount, methods, userstate);
                            break;

                        // Handle anonymous random gift subs
                        // Need proof that this event occur
                        case "anonsubmysterygift":
                            this.emit("anonsubmysterygift", channel, giftSubCount, methods, userstate);
                            break;

                        // Handle user upgrading from Prime to a normal tier sub
                        case "primepaidupgrade":
                            this.emit("primepaidupgrade", channel, username, methods, userstate);
                            break;

                        // Handle user upgrading from a gifted sub
                        case "giftpaidupgrade":
                            var sender = message.tags["msg-param-sender-name"] || message.tags["msg-param-sender-login"];
                            this.emit("giftpaidupgrade", channel, username, sender, userstate);
                            break;

                        // Handle user upgrading from an anonymous gifted sub
                        case "anongiftpaidupgrade":
                            this.emit("anongiftpaidupgrade", channel, username, userstate);
                            break;

                        // Handle raid
                        case "raid":
                            var username = message.tags["msg-param-displayName"] || message.tags["msg-param-login"];
                            var viewers = message.tags["msg-param-viewerCount"];
                            this.emit("raided", channel, username, viewers);
                            break;
                    }

                    break;

                // Channel is now hosting another channel or exited host mode..
                case "HOSTTARGET":
                    var msgSplit = msg.split(" ");
                    var viewers = ~~msgSplit[1] || 0;
                    // Stopped hosting..
                    if (msgSplit[0] === "-") {
                        this.log.info("[" + channel + "] Exited host mode.");
                        this.emits(["unhost", "_promiseUnhost"], [[channel, viewers], [null]]);
                    }
                    // Now hosting..
                    else {
                            this.log.info("[" + channel + "] Now hosting " + msgSplit[0] + " for " + viewers + " viewer(s).");
                            this.emit("hosting", channel, msgSplit[0], viewers);
                        }
                    break;

                // Someone has been timed out or chat has been cleared by a moderator..
                case "CLEARCHAT":
                    // User has been banned / timed out by a moderator..
                    if (message.params.length > 1) {
                        // Duration returns null if it's a ban, otherwise it's a timeout..
                        var duration = _.get(message.tags["ban-duration"], null);

                        if (_.isNull(duration)) {
                            this.log.info("[" + channel + "] " + msg + " has been banned.");
                            this.emit("ban", channel, msg, null, message.tags);
                        } else {
                            this.log.info("[" + channel + "] " + msg + " has been timed out for " + duration + " seconds.");
                            this.emit("timeout", channel, msg, null, ~~duration, message.tags);
                        }
                    }
                    // Chat was cleared by a moderator..
                    else {
                            this.log.info("[" + channel + "] Chat was cleared by a moderator.");
                            this.emits(["clearchat", "_promiseClear"], [[channel], [null]]);
                        }
                    break;

                // Someone's message has been deleted
                case "CLEARMSG":
                    if (message.params.length > 1) {
                        var username = message.tags["login"];
                        var deletedMessage = msg;
                        var userstate = message.tags;
                        userstate["message-type"] = "messagedeleted";

                        this.log.info("[" + channel + "] " + username + "'s message has been deleted.");
                        this.emit("messagedeleted", channel, username, deletedMessage, userstate);
                    }
                    break;

                // Received a reconnection request from the server..
                case "RECONNECT":
                    this.log.info("Received RECONNECT request from Twitch..");
                    this.log.info("Disconnecting and reconnecting in " + Math.round(this.reconnectTimer / 1000) + " seconds..");
                    this.disconnect();
                    setTimeout(function () {
                        _this.connect();
                    }, this.reconnectTimer);
                    break;

                // Received when joining a channel and every time you send a PRIVMSG to a channel.
                case "USERSTATE":
                    message.tags.username = this.username;

                    // Add the client to the moderators of this room..
                    if (message.tags["user-type"] === "mod") {
                        if (!this.moderators[this.lastJoined]) {
                            this.moderators[this.lastJoined] = [];
                        }
                        if (!this.moderators[this.lastJoined].includes(this.username)) {
                            this.moderators[this.lastJoined].push(this.username);
                        }
                    }

                    // Logged in and username doesn't start with justinfan..
                    if (!_.isJustinfan(this.getUsername()) && !this.userstate[channel]) {
                        this.userstate[channel] = message.tags;
                        this.lastJoined = channel;
                        this.channels.push(channel);
                        this.log.info("Joined " + channel);
                        this.emit("join", channel, _.username(this.getUsername()), true);
                    }

                    // Emote-sets has changed, update it..
                    if (message.tags["emote-sets"] !== this.emotes) {
                        this._updateEmoteset(message.tags["emote-sets"]);
                    }

                    this.userstate[channel] = message.tags;
                    break;

                // Describe non-channel-specific state informations..
                case "GLOBALUSERSTATE":
                    this.globaluserstate = message.tags;

                    // Received emote-sets..
                    if (typeof message.tags["emote-sets"] !== "undefined") {
                        this._updateEmoteset(message.tags["emote-sets"]);
                    }
                    break;

                // Received when joining a channel and every time one of the chat room settings, like slow mode, change.
                // The message on join contains all room settings.
                case "ROOMSTATE":
                    // We use this notice to know if we successfully joined a channel..
                    if (_.channel(this.lastJoined) === channel) {
                        this.emit("_promiseJoin", null, channel);
                    }

                    // Provide the channel name in the tags before emitting it..
                    message.tags.channel = channel;
                    this.emit("roomstate", channel, message.tags);

                    if (!message.tags.hasOwnProperty("subs-only")) {
                        // Handle slow mode here instead of the slow_on/off notice..
                        // This room is now in slow mode. You may send messages every slow_duration seconds.
                        if (message.tags.hasOwnProperty("slow")) {
                            if (typeof message.tags.slow === "boolean" && !message.tags.slow) {
                                var disabled = [channel, false, 0];
                                this.log.info("[" + channel + "] This room is no longer in slow mode.");
                                this.emits(["slow", "slowmode", "_promiseSlowoff"], [disabled, disabled, [null]]);
                            } else {
                                var minutes = ~~message.tags.slow;
                                var enabled = [channel, true, minutes];
                                this.log.info("[" + channel + "] This room is now in slow mode.");
                                this.emits(["slow", "slowmode", "_promiseSlow"], [enabled, enabled, [null]]);
                            }
                        }

                        // Handle followers only mode here instead of the followers_on/off notice..
                        // This room is now in follower-only mode.
                        // This room is now in <duration> followers-only mode.
                        // This room is no longer in followers-only mode.
                        // duration is in minutes (string)
                        // -1 when /followersoff (string)
                        // false when /followers with no duration (boolean)
                        if (message.tags.hasOwnProperty("followers-only")) {
                            if (message.tags["followers-only"] === "-1") {
                                var disabled = [channel, false, 0];
                                this.log.info("[" + channel + "] This room is no longer in followers-only mode.");
                                this.emits(["followersonly", "followersmode", "_promiseFollowersoff"], [disabled, disabled, [null]]);
                            } else {
                                var minutes = ~~message.tags["followers-only"];
                                var enabled = [channel, true, minutes];
                                this.log.info("[" + channel + "] This room is now in follower-only mode.");
                                this.emits(["followersonly", "followersmode", "_promiseFollowers"], [enabled, enabled, [null]]);
                            }
                        }
                    }
                    break;

                // Wrong cluster..
                case "SERVERCHANGE":
                    break;

                default:
                    this.log.warn("Could not parse message from tmi.twitch.tv:\n" + JSON.stringify(message, null, 4));
                    break;
            }
        }

        // Messages from jtv..
        else if (message.prefix === "jtv") {
                switch (message.command) {
                    case "MODE":
                        if (msg === "+o") {
                            // Add username to the moderators..
                            if (!this.moderators[channel]) {
                                this.moderators[channel] = [];
                            }
                            if (!this.moderators[channel].includes(message.params[2])) {
                                this.moderators[channel].push(message.params[2]);
                            }

                            this.emit("mod", channel, message.params[2]);
                        } else if (msg === "-o") {
                            // Remove username from the moderators..
                            if (!this.moderators[channel]) {
                                this.moderators[channel] = [];
                            }
                            this.moderators[channel].filter(function (value) {
                                return value != message.params[2];
                            });

                            this.emit("unmod", channel, message.params[2]);
                        }
                        break;

                    default:
                        this.log.warn("Could not parse message from jtv:\n" + JSON.stringify(message, null, 4));
                        break;
                }
            }

            // Anything else..
            else {
                    switch (message.command) {
                        case "353":
                            this.emit("names", message.params[2], message.params[3].split(" "));
                            break;

                        case "366":
                            break;

                        // Someone has joined the channel..
                        case "JOIN":
                            var nick = message.prefix.split("!")[0];
                            // Joined a channel as a justinfan (anonymous) user..
                            if (_.isJustinfan(this.getUsername()) && this.username === nick) {
                                this.lastJoined = channel;
                                this.channels.push(channel);
                                this.log.info("Joined " + channel);
                                this.emit("join", channel, nick, true);
                            }

                            // Someone else joined the channel, just emit the join event..
                            if (this.username !== nick) {
                                this.emit("join", channel, nick, false);
                            }
                            break;

                        // Someone has left the channel..
                        case "PART":
                            var isSelf = false;
                            var nick = message.prefix.split("!")[0];
                            // Client left a channel..
                            if (this.username === nick) {
                                isSelf = true;
                                if (this.userstate[channel]) {
                                    delete this.userstate[channel];
                                }

                                var index = this.channels.indexOf(channel);
                                if (index !== -1) {
                                    this.channels.splice(index, 1);
                                }

                                var index = this.opts.channels.indexOf(channel);
                                if (index !== -1) {
                                    this.opts.channels.splice(index, 1);
                                }

                                this.log.info("Left " + channel);
                                this.emit("_promisePart", null);
                            }

                            // Client or someone else left the channel, emit the part event..
                            this.emit("part", channel, nick, isSelf);
                            break;

                        // Received a whisper..
                        case "WHISPER":
                            var nick = message.prefix.split("!")[0];
                            this.log.info("[WHISPER] <" + nick + ">: " + msg);

                            // Update the tags to provide the username..
                            if (!message.tags.hasOwnProperty("username")) {
                                message.tags.username = nick;
                            }
                            message.tags["message-type"] = "whisper";

                            var from = _.channel(message.tags.username);
                            // Emit for both, whisper and message..
                            this.emits(["whisper", "message"], [[from, message.tags, msg, false]]);
                            break;

                        case "PRIVMSG":
                            // Add username (lowercase) to the tags..
                            message.tags.username = message.prefix.split("!")[0];

                            // Message from JTV..
                            if (message.tags.username === "jtv") {
                                var name = _.username(msg.split(" ")[0]);
                                var autohost = msg.includes("auto");
                                // Someone is hosting the channel and the message contains how many viewers..
                                if (msg.includes("hosting you for")) {
                                    var count = _.extractNumber(msg);

                                    this.emit("hosted", channel, name, count, autohost);
                                }

                                // Some is hosting the channel, but no viewer(s) count provided in the message..
                                else if (msg.includes("hosting you")) {
                                        this.emit("hosted", channel, name, 0, autohost);
                                    }
                            } else {
                                // Message is an action (/me <message>)..
                                var actionMessage = _.actionMessage(msg);
                                if (actionMessage) {
                                    message.tags["message-type"] = "action";
                                    this.log.info("[" + channel + "] *<" + message.tags.username + ">: " + actionMessage[1]);
                                    this.emits(["action", "message"], [[channel, message.tags, actionMessage[1], false]]);
                                } else {
                                    if (message.tags.hasOwnProperty("bits")) {
                                        this.emit("cheer", channel, message.tags, msg);
                                    }

                                    // Message is a regular chat message..
                                    else {
                                            message.tags["message-type"] = "chat";
                                            this.log.info("[" + channel + "] <" + message.tags.username + ">: " + msg);

                                            this.emits(["chat", "message"], [[channel, message.tags, msg, false]]);
                                        }
                                }
                            }
                            break;

                        default:
                            this.log.warn("Could not parse message:\n" + JSON.stringify(message, null, 4));
                            break;
                    }
                }
};

// Connect to server..
client.prototype.connect = function connect() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
        _this2.server = _.get(_this2.opts.connection.server, "irc-ws.chat.twitch.tv");
        _this2.port = _.get(_this2.opts.connection.port, 80);

        // Override port if using a secure connection..
        if (_this2.secure) {
            _this2.port = 443;
        }
        if (_this2.port === 443) {
            _this2.secure = true;
        }

        _this2.reconnectTimer = _this2.reconnectTimer * _this2.reconnectDecay;
        if (_this2.reconnectTimer >= _this2.maxReconnectInterval) {
            _this2.reconnectTimer = _this2.maxReconnectInterval;
        }

        // Connect to server from configuration..
        _this2._openConnection();
        _this2.once("_promiseConnect", function (err) {
            if (!err) {
                resolve([_this2.server, ~~_this2.port]);
            } else {
                reject(err);
            }
        });
    });
};

// Open a connection..
client.prototype._openConnection = function _openConnection() {
    this.ws = new ws((this.secure ? "wss" : "ws") + "://" + this.server + ":" + this.port + "/", "irc");

    this.ws.onmessage = this._onMessage.bind(this);
    this.ws.onerror = this._onError.bind(this);
    this.ws.onclose = this._onClose.bind(this);
    this.ws.onopen = this._onOpen.bind(this);
};

// Called when the WebSocket connection's readyState changes to OPEN.
// Indicates that the connection is ready to send and receive data..
client.prototype._onOpen = function _onOpen() {
    if (_.isNull(this.ws) || this.ws.readyState !== 1) {
        return;
    }
    // Emitting "connecting" event..
    this.log.info("Connecting to " + this.server + " on port " + this.port + "..");
    this.emit("connecting", this.server, ~~this.port);

    this.username = _.get(this.opts.identity.username, _.justinfan());
    this.password = _.password(_.get(this.opts.identity.password, "SCHMOOPIIE"));

    // Emitting "logon" event..
    this.log.info("Sending authentication to server..");
    this.emit("logon");

    // Authentication..
    this.ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
    this.ws.send("PASS " + this.password);
    this.ws.send("NICK " + this.username);
};

// Called when a message is received from the server..
client.prototype._onMessage = function _onMessage(event) {
    var _this3 = this;

    var parts = event.data.split("\r\n");

    parts.forEach(function (str) {
        if (!_.isNull(str)) {
            _this3.handleMessage(parse.msg(str));
        }
    });
};

// Called when an error occurs..
client.prototype._onError = function _onError() {
    var _this4 = this;

    this.moderators = {};
    this.userstate = {};
    this.globaluserstate = {};

    // Stop the internal ping timeout check interval..
    clearInterval(this.pingLoop);
    clearTimeout(this.pingTimeout);

    this.reason = !_.isNull(this.ws) ? "Unable to connect." : "Connection closed.";

    this.emits(["_promiseConnect", "disconnected"], [[this.reason]]);

    // Reconnect to server..
    if (this.reconnect && this.reconnections === this.maxReconnectAttempts) {
        this.emit("maxreconnect");
        this.log.error("Maximum reconnection attempts reached.");
    }
    if (this.reconnect && !this.reconnecting && this.reconnections <= this.maxReconnectAttempts - 1) {
        this.reconnecting = true;
        this.reconnections = this.reconnections + 1;
        this.log.error("Reconnecting in " + Math.round(this.reconnectTimer / 1000) + " seconds..");
        this.emit("reconnect");
        setTimeout(function () {
            _this4.reconnecting = false;_this4.connect();
        }, this.reconnectTimer);
    }

    this.ws = null;
};

// Called when the WebSocket connection's readyState changes to CLOSED..
client.prototype._onClose = function _onClose() {
    var _this5 = this;

    this.moderators = {};
    this.userstate = {};
    this.globaluserstate = {};

    // Stop the internal ping timeout check interval..
    clearInterval(this.pingLoop);
    clearTimeout(this.pingTimeout);

    // User called .disconnect(), don't try to reconnect.
    if (this.wasCloseCalled) {
        this.wasCloseCalled = false;
        this.reason = "Connection closed.";
        this.log.info(this.reason);
        this.emits(["_promiseConnect", "_promiseDisconnect", "disconnected"], [[this.reason], [null], [this.reason]]);
    }
    // Got disconnected from server..
    else {
            this.emits(["_promiseConnect", "disconnected"], [[this.reason]]);

            // Reconnect to server..
            if (this.reconnect && this.reconnections === this.maxReconnectAttempts) {
                this.emit("maxreconnect");
                this.log.error("Maximum reconnection attempts reached.");
            }
            if (this.reconnect && !this.reconnecting && this.reconnections <= this.maxReconnectAttempts - 1) {
                this.reconnecting = true;
                this.reconnections = this.reconnections + 1;
                this.log.error("Could not connect to server. Reconnecting in " + Math.round(this.reconnectTimer / 1000) + " seconds..");
                this.emit("reconnect");
                setTimeout(function () {
                    _this5.reconnecting = false;_this5.connect();
                }, this.reconnectTimer);
            }
        }

    this.ws = null;
};

// Minimum of 600ms for command promises, if current latency exceeds, add 100ms to it to make sure it doesn't get timed out..
client.prototype._getPromiseDelay = function _getPromiseDelay() {
    if (this.currentLatency <= 600) {
        return 600;
    } else {
        return this.currentLatency + 100;
    }
};

// Send command to server or channel..
client.prototype._sendCommand = function _sendCommand(delay, channel, command, fn) {
    var _this6 = this;

    // Race promise against delay..
    return new Promise(function (resolve, reject) {
        // Make sure the socket is opened..
        if (_.isNull(_this6.ws) || _this6.ws.readyState !== 1) {
            // Disconnected from server..
            return reject("Not connected to server.");
        } else if (typeof delay === 'number') {
            _.promiseDelay(delay).then(function () {
                reject("No response from Twitch.");
            });
        }

        // Executing a command on a channel..
        if (!_.isNull(channel)) {
            var chan = _.channel(channel);
            _this6.log.info("[" + chan + "] Executing command: " + command);
            _this6.ws.send("PRIVMSG " + chan + " :" + command);
        }

        // Executing a raw command..
        else {
                _this6.log.info("Executing command: " + command);
                _this6.ws.send(command);
            }
        fn(resolve, reject);
    });
};

// Send a message to channel..
client.prototype._sendMessage = function _sendMessage(delay, channel, message, fn) {
    var _this7 = this;

    // Promise a result..
    return new Promise(function (resolve, reject) {
        // Make sure the socket is opened and not logged in as a justinfan user..
        if (_.isNull(_this7.ws) || _this7.ws.readyState !== 1) {
            return reject("Not connected to server.");
        } else if (_.isJustinfan(_this7.getUsername())) {
            return reject("Cannot send anonymous messages.");
        }
        var chan = _.channel(channel);
        if (!_this7.userstate[chan]) {
            _this7.userstate[chan] = {};
        }

        // Split long lines otherwise they will be eaten by the server..
        if (message.length >= 500) {
            var msg = _.splitLine(message, 500);
            message = msg[0];

            setTimeout(function () {
                _this7._sendMessage(delay, channel, msg[1], function () {});
            }, 350);
        }

        _this7.ws.send("PRIVMSG " + chan + " :" + message);

        var emotes = {};

        // Parse regex and string emotes..
        Object.keys(_this7.emotesets).forEach(function (id) {
            _this7.emotesets[id].forEach(function (emote) {
                if (_.isRegex(emote.code)) {
                    return parse.emoteRegex(message, emote.code, emote.id, emotes);
                }
                parse.emoteString(message, emote.code, emote.id, emotes);
            });
        });

        // Merge userstate with parsed emotes..
        var userstate = _.merge(_this7.userstate[chan], parse.emotes({ emotes: parse.transformEmotes(emotes) || null }));

        // Message is an action (/me <message>)..
        var actionMessage = _.actionMessage(message);
        if (actionMessage) {
            userstate["message-type"] = "action";
            _this7.log.info("[" + chan + "] *<" + _this7.getUsername() + ">: " + actionMessage[1]);
            _this7.emits(["action", "message"], [[chan, userstate, actionMessage[1], true]]);
        }

        // Message is a regular chat message..
        else {
                userstate["message-type"] = "chat";
                _this7.log.info("[" + chan + "] <" + _this7.getUsername() + ">: " + message);
                _this7.emits(["chat", "message"], [[chan, userstate, message, true]]);
            }
        fn(resolve, reject);
    });
};

// Grab the emote-sets object from the API..
client.prototype._updateEmoteset = function _updateEmoteset(sets) {
    var _this8 = this;

    this.emotes = sets;

    this.api({
        url: "/chat/emoticon_images?emotesets=" + sets,
        headers: {
            "Authorization": "OAuth " + _.password(_.get(this.opts.identity.password, "")).replace("oauth:", ""),
            "Client-ID": this.clientId
        }
    }, function (err, res, body) {
        if (!err) {
            _this8.emotesets = body["emoticon_sets"] || {};
            return _this8.emit("emotesets", sets, _this8.emotesets);
        }
        setTimeout(function () {
            _this8._updateEmoteset(sets);
        }, 60000);
    });
};

// Get current username..
client.prototype.getUsername = function getUsername() {
    return this.username;
};

// Get current options..
client.prototype.getOptions = function getOptions() {
    return this.opts;
};

// Get current channels..
client.prototype.getChannels = function getChannels() {
    return this.channels;
};

// Check if username is a moderator on a channel..
client.prototype.isMod = function isMod(channel, username) {
    var chan = _.channel(channel);
    if (!this.moderators[chan]) {
        this.moderators[chan] = [];
    }
    return this.moderators[chan].includes(_.username(username));
};

// Get readyState..
client.prototype.readyState = function readyState() {
    if (_.isNull(this.ws)) {
        return "CLOSED";
    }
    return ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][this.ws.readyState];
};

// Disconnect from server..
client.prototype.disconnect = function disconnect() {
    var _this9 = this;

    return new Promise(function (resolve, reject) {
        if (!_.isNull(_this9.ws) && _this9.ws.readyState !== 3) {
            _this9.wasCloseCalled = true;
            _this9.log.info("Disconnecting from server..");
            _this9.ws.close();
            _this9.once("_promiseDisconnect", function () {
                resolve([_this9.server, ~~_this9.port]);
            });
        } else {
            _this9.log.error("Cannot disconnect from server. Socket is not opened or connection is already closing.");
            reject("Cannot disconnect from server. Socket is not opened or connection is already closing.");
        }
    });
};

// Expose everything, for browser and Node..
if (typeof module !== "undefined" && module.exports) {
    module.exports = client;
}
if (typeof window !== "undefined") {
    window.tmi = {};
    window.tmi.client = client;
    window.tmi.Client = client;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api":11,"./commands":13,"./events":14,"./logger":15,"./parser":16,"./timer":17,"./utils":18,"ws":4}],13:[function(require,module,exports){
"use strict";

var _ = require("./utils");

// Enable followers-only mode on a channel..
function followersonly(channel, minutes) {
    var _this = this;

    channel = _.channel(channel);
    minutes = _.get(minutes, 30);

    // Send the command to the server and race the Promise against a delay..
    return this._sendCommand(this._getPromiseDelay(), channel, "/followers " + minutes, function (resolve, reject) {
        // Received _promiseFollowers event, resolve or reject..
        _this.once("_promiseFollowers", function (err) {
            if (!err) {
                resolve([channel, ~~minutes]);
            } else {
                reject(err);
            }
        });
    });
}

// Disable followers-only mode on a channel..
function followersonlyoff(channel) {
    var _this2 = this;

    channel = _.channel(channel);

    // Send the command to the server and race the Promise against a delay..
    return this._sendCommand(this._getPromiseDelay(), channel, "/followersoff", function (resolve, reject) {
        // Received _promiseFollowersoff event, resolve or reject..
        _this2.once("_promiseFollowersoff", function (err) {
            if (!err) {
                resolve([channel]);
            } else {
                reject(err);
            }
        });
    });
}

// Leave a channel..
function part(channel) {
    var _this3 = this;

    channel = _.channel(channel);

    // Send the command to the server and race the Promise against a delay..
    return this._sendCommand(this._getPromiseDelay(), null, "PART " + channel, function (resolve, reject) {
        // Received _promisePart event, resolve or reject..
        _this3.once("_promisePart", function (err) {
            if (!err) {
                resolve([channel]);
            } else {
                reject(err);
            }
        });
    });
}

// Enable R9KBeta mode on a channel..
function r9kbeta(channel) {
    var _this4 = this;

    channel = _.channel(channel);

    // Send the command to the server and race the Promise against a delay..
    return this._sendCommand(this._getPromiseDelay(), channel, "/r9kbeta", function (resolve, reject) {
        // Received _promiseR9kbeta event, resolve or reject..
        _this4.once("_promiseR9kbeta", function (err) {
            if (!err) {
                resolve([channel]);
            } else {
                reject(err);
            }
        });
    });
}

// Disable R9KBeta mode on a channel..
function r9kbetaoff(channel) {
    var _this5 = this;

    channel = _.channel(channel);

    // Send the command to the server and race the Promise against a delay..
    return this._sendCommand(this._getPromiseDelay(), channel, "/r9kbetaoff", function (resolve, reject) {
        // Received _promiseR9kbetaoff event, resolve or reject..
        _this5.once("_promiseR9kbetaoff", function (err) {
            if (!err) {
                resolve([channel]);
            } else {
                reject(err);
            }
        });
    });
}

// Enable slow mode on a channel..
function slow(channel, seconds) {
    var _this6 = this;

    channel = _.channel(channel);
    seconds = _.get(seconds, 300);

    // Send the command to the server and race the Promise against a delay..
    return this._sendCommand(this._getPromiseDelay(), channel, "/slow " + seconds, function (resolve, reject) {
        // Received _promiseSlow event, resolve or reject..
        _this6.once("_promiseSlow", function (err) {
            if (!err) {
                resolve([channel, ~~seconds]);
            } else {
                reject(err);
            }
        });
    });
}

// Disable slow mode on a channel..
function slowoff(channel) {
    var _this7 = this;

    channel = _.channel(channel);

    // Send the command to the server and race the Promise against a delay..
    return this._sendCommand(this._getPromiseDelay(), channel, "/slowoff", function (resolve, reject) {
        // Received _promiseSlowoff event, resolve or reject..
        _this7.once("_promiseSlowoff", function (err) {
            if (!err) {
                resolve([channel]);
            } else {
                reject(err);
            }
        });
    });
}

module.exports = {
    // Send action message (/me <message>) on a channel..
    action: function action(channel, message) {
        channel = _.channel(channel);
        message = "\x01ACTION " + message + "\x01";

        // Send the command to the server and race the Promise against a delay..
        return this._sendMessage(this._getPromiseDelay(), channel, message, function (resolve, reject) {
            // At this time, there is no possible way to detect if a message has been sent has been eaten
            // by the server, so we can only resolve the Promise.
            resolve([channel, message]);
        });
    },

    // Ban username on channel..
    ban: function ban(channel, username, reason) {
        var _this8 = this;

        channel = _.channel(channel);
        username = _.username(username);
        reason = _.get(reason, "");

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/ban " + username + " " + reason, function (resolve, reject) {
            // Received _promiseBan event, resolve or reject..
            _this8.once("_promiseBan", function (err) {
                if (!err) {
                    resolve([channel, username, reason]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Clear all messages on a channel..
    clear: function clear(channel) {
        var _this9 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/clear", function (resolve, reject) {
            // Received _promiseClear event, resolve or reject..
            _this9.once("_promiseClear", function (err) {
                if (!err) {
                    resolve([channel]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Change the color of your username..
    color: function color(channel, newColor) {
        var _this10 = this;

        newColor = _.get(newColor, channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), "#tmijs", "/color " + newColor, function (resolve, reject) {
            // Received _promiseColor event, resolve or reject..
            _this10.once("_promiseColor", function (err) {
                if (!err) {
                    resolve([newColor]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Run commercial on a channel for X seconds..
    commercial: function commercial(channel, seconds) {
        var _this11 = this;

        channel = _.channel(channel);
        seconds = _.get(seconds, 30);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/commercial " + seconds, function (resolve, reject) {
            // Received _promiseCommercial event, resolve or reject..
            _this11.once("_promiseCommercial", function (err) {
                if (!err) {
                    resolve([channel, ~~seconds]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Delete a specific message on a channel
    deletemessage: function deletemessage(channel, messageUUID) {
        var _this12 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/delete " + messageUUID, function (resolve, reject) {
            // Received _promiseDeletemessage event, resolve or reject..
            _this12.once("_promiseDeletemessage", function (err) {
                if (!err) {
                    resolve([channel]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Enable emote-only mode on a channel..
    emoteonly: function emoteonly(channel) {
        var _this13 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/emoteonly", function (resolve, reject) {
            // Received _promiseEmoteonly event, resolve or reject..
            _this13.once("_promiseEmoteonly", function (err) {
                if (!err) {
                    resolve([channel]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Disable emote-only mode on a channel..
    emoteonlyoff: function emoteonlyoff(channel) {
        var _this14 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/emoteonlyoff", function (resolve, reject) {
            // Received _promiseEmoteonlyoff event, resolve or reject..
            _this14.once("_promiseEmoteonlyoff", function (err) {
                if (!err) {
                    resolve([channel]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Enable followers-only mode on a channel..
    followersonly: followersonly,

    // Alias for followersonly()..
    followersmode: followersonly,

    // Disable followers-only mode on a channel..
    followersonlyoff: followersonlyoff,

    // Alias for followersonlyoff()..
    followersmodeoff: followersonlyoff,

    // Host a channel..
    host: function host(channel, target) {
        var _this15 = this;

        channel = _.channel(channel);
        target = _.username(target);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(2000, channel, "/host " + target, function (resolve, reject) {
            // Received _promiseHost event, resolve or reject..
            _this15.once("_promiseHost", function (err, remaining) {
                if (!err) {
                    resolve([channel, target, ~~remaining]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Join a channel..
    join: function join(channel) {
        var _this16 = this;

        channel = _.channel(channel);

        // Send the command to the server ..
        return this._sendCommand(null, null, "JOIN " + channel, function (resolve, reject) {
            var eventName = "_promiseJoin";
            var hasFulfilled = false;
            var listener = function listener(err, joinedChannel) {
                if (channel === _.channel(joinedChannel)) {
                    // Received _promiseJoin event for the target channel, resolve or reject..
                    _this16.removeListener(eventName, listener);
                    hasFulfilled = true;
                    if (!err) {
                        resolve([channel]);
                    } else {
                        reject(err);
                    }
                }
            };
            _this16.on(eventName, listener);
            // Race the Promise against a delay..
            var delay = _this16._getPromiseDelay();
            _.promiseDelay(delay).then(function () {
                if (!hasFulfilled) {
                    _this16.emit(eventName, "No response from Twitch.", channel);
                }
            });
        });
    },

    // Mod username on channel..
    mod: function mod(channel, username) {
        var _this17 = this;

        channel = _.channel(channel);
        username = _.username(username);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/mod " + username, function (resolve, reject) {
            // Received _promiseMod event, resolve or reject..
            _this17.once("_promiseMod", function (err) {
                if (!err) {
                    resolve([channel, username]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Get list of mods on a channel..
    mods: function mods(channel) {
        var _this18 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/mods", function (resolve, reject) {
            // Received _promiseMods event, resolve or reject..
            _this18.once("_promiseMods", function (err, mods) {
                if (!err) {
                    // Update the internal list of moderators..
                    mods.forEach(function (username) {
                        if (!_this18.moderators[channel]) {
                            _this18.moderators[channel] = [];
                        }
                        if (!_this18.moderators[channel].includes(username)) {
                            _this18.moderators[channel].push(username);
                        }
                    });
                    resolve(mods);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Leave a channel..
    part: part,

    // Alias for part()..
    leave: part,

    // Send a ping to the server..
    ping: function ping() {
        var _this19 = this;

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), null, "PING", function (resolve, reject) {
            // Update the internal ping timeout check interval..
            _this19.latency = new Date();
            _this19.pingTimeout = setTimeout(function () {
                if (_this19.ws !== null) {
                    _this19.wasCloseCalled = false;
                    _this19.log.error("Ping timeout.");
                    _this19.ws.close();

                    clearInterval(_this19.pingLoop);
                    clearTimeout(_this19.pingTimeout);
                }
            }, _.get(_this19.opts.connection.timeout, 9999));

            // Received _promisePing event, resolve or reject..
            _this19.once("_promisePing", function (latency) {
                resolve([parseFloat(latency)]);
            });
        });
    },

    // Enable R9KBeta mode on a channel..
    r9kbeta: r9kbeta,

    // Alias for r9kbeta()..
    r9kmode: r9kbeta,

    // Disable R9KBeta mode on a channel..
    r9kbetaoff: r9kbetaoff,

    // Alias for r9kbetaoff()..
    r9kmodeoff: r9kbetaoff,

    // Send a raw message to the server..
    raw: function raw(message) {
        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), null, message, function (resolve, reject) {
            resolve([message]);
        });
    },

    // Send a message on a channel..
    say: function say(channel, message) {
        channel = _.channel(channel);

        if (message.startsWith(".") && !message.startsWith("..") || message.startsWith("/") || message.startsWith("\\")) {
            // Check if the message is an action message..
            if (message.substr(1, 3) === "me ") {
                return this.action(channel, message.substr(4));
            } else {
                // Send the command to the server and race the Promise against a delay..
                return this._sendCommand(this._getPromiseDelay(), channel, message, function (resolve, reject) {
                    // At this time, there is no possible way to detect if a message has been sent has been eaten
                    // by the server, so we can only resolve the Promise.
                    resolve([channel, message]);
                });
            }
        }

        // Send the command to the server and race the Promise against a delay..
        return this._sendMessage(this._getPromiseDelay(), channel, message, function (resolve, reject) {
            // At this time, there is no possible way to detect if a message has been sent has been eaten
            // by the server, so we can only resolve the Promise.
            resolve([channel, message]);
        });
    },

    // Enable slow mode on a channel..
    slow: slow,

    // Alias for slow()..
    slowmode: slow,

    // Disable slow mode on a channel..
    slowoff: slowoff,

    // Alias for slowoff()..
    slowmodeoff: slowoff,

    // Enable subscribers mode on a channel..
    subscribers: function subscribers(channel) {
        var _this20 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/subscribers", function (resolve, reject) {
            // Received _promiseSubscribers event, resolve or reject..
            _this20.once("_promiseSubscribers", function (err) {
                if (!err) {
                    resolve([channel]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Disable subscribers mode on a channel..
    subscribersoff: function subscribersoff(channel) {
        var _this21 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/subscribersoff", function (resolve, reject) {
            // Received _promiseSubscribersoff event, resolve or reject..
            _this21.once("_promiseSubscribersoff", function (err) {
                if (!err) {
                    resolve([channel]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Timeout username on channel for X seconds..
    timeout: function timeout(channel, username, seconds, reason) {
        var _this22 = this;

        channel = _.channel(channel);
        username = _.username(username);

        if (!_.isNull(seconds) && !_.isInteger(seconds)) {
            reason = seconds;
            seconds = 300;
        }

        seconds = _.get(seconds, 300);
        reason = _.get(reason, "");

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/timeout " + username + " " + seconds + " " + reason, function (resolve, reject) {
            // Received _promiseTimeout event, resolve or reject..
            _this22.once("_promiseTimeout", function (err) {
                if (!err) {
                    resolve([channel, username, ~~seconds, reason]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Unban username on channel..
    unban: function unban(channel, username) {
        var _this23 = this;

        channel = _.channel(channel);
        username = _.username(username);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/unban " + username, function (resolve, reject) {
            // Received _promiseUnban event, resolve or reject..
            _this23.once("_promiseUnban", function (err) {
                if (!err) {
                    resolve([channel, username]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // End the current hosting..
    unhost: function unhost(channel) {
        var _this24 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(2000, channel, "/unhost", function (resolve, reject) {
            // Received _promiseUnhost event, resolve or reject..
            _this24.once("_promiseUnhost", function (err) {
                if (!err) {
                    resolve([channel]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Unmod username on channel..
    unmod: function unmod(channel, username) {
        var _this25 = this;

        channel = _.channel(channel);
        username = _.username(username);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/unmod " + username, function (resolve, reject) {
            // Received _promiseUnmod event, resolve or reject..
            _this25.once("_promiseUnmod", function (err) {
                if (!err) {
                    resolve([channel, username]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Unvip username on channel..
    unvip: function unvip(channel, username) {
        var _this26 = this;

        channel = _.channel(channel);
        username = _.username(username);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/unvip " + username, function (resolve, reject) {
            // Received _promiseUnvip event, resolve or reject..
            _this26.once("_promiseUnvip", function (err) {
                if (!err) {
                    resolve([channel, username]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Add username to VIP list on channel..
    vip: function vip(channel, username) {
        var _this27 = this;

        channel = _.channel(channel);
        username = _.username(username);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/vip " + username, function (resolve, reject) {
            // Received _promiseVip event, resolve or reject..
            _this27.once("_promiseVip", function (err) {
                if (!err) {
                    resolve([channel, username]);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Get list of VIPs on a channel..
    vips: function vips(channel) {
        var _this28 = this;

        channel = _.channel(channel);

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), channel, "/vips", function (resolve, reject) {
            // Received _promiseVips event, resolve or reject..
            _this28.once("_promiseVips", function (err, vips) {
                if (!err) {
                    resolve(vips);
                } else {
                    reject(err);
                }
            });
        });
    },

    // Send an whisper message to a user..
    whisper: function whisper(username, message) {
        var _this29 = this;

        username = _.username(username);

        // The server will not send a whisper to the account that sent it.
        if (username === this.getUsername()) {
            return Promise.reject("Cannot send a whisper to the same account.");
        }

        // Send the command to the server and race the Promise against a delay..
        return this._sendCommand(this._getPromiseDelay(), "#tmijs", "/w " + username + " " + message, function (resolve, reject) {
            var from = _.channel(username),
                userstate = _.merge({
                "message-type": "whisper",
                "message-id": null,
                "thread-id": null,
                username: _this29.getUsername()
            }, _this29.globaluserstate);

            // Emit for both, whisper and message..
            _this29.emits(["whisper", "message"], [[from, userstate, message, true], [from, userstate, message, true]]);

            // At this time, there is no possible way to detect if a message has been sent has been eaten
            // by the server, so we can only resolve the Promise.
            resolve([username, message]);
        });
    }
};

},{"./utils":18}],14:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || undefined;
}

module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function (n) {
    if (!isNumber(n) || n < 0 || isNaN(n)) {
        throw TypeError("n must be a positive number");
    }

    this._maxListeners = n;

    return this;
};

// Emit multiple events..
EventEmitter.prototype.emits = function (types, values) {
    for (var i = 0; i < types.length; i++) {
        var val = i < values.length ? values[i] : values[values.length - 1];
        this.emit.apply(this, [types[i]].concat(val));
    }
};

EventEmitter.prototype.emit = function (type) {
    var er, handler, len, args, i, listeners;

    if (!this._events) {
        this._events = {};
    }

    // If there is no 'error' event listener then throw.
    if (type === "error") {
        if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
            er = arguments[1];
            if (er instanceof Error) {
                throw er;
            }
            throw TypeError("Uncaught, unspecified \"error\" event.");
        }
    }

    handler = this._events[type];

    if (isUndefined(handler)) {
        return false;
    }

    if (isFunction(handler)) {
        switch (arguments.length) {
            // fast cases
            case 1:
                handler.call(this);
                break;
            case 2:
                handler.call(this, arguments[1]);
                break;
            case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
            // slower
            default:
                args = Array.prototype.slice.call(arguments, 1);
                handler.apply(this, args);
        }
    } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++) {
            listeners[i].apply(this, args);
        }
    }

    return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
    var m;

    if (!isFunction(listener)) {
        throw TypeError("listener must be a function");
    }

    if (!this._events) {
        this._events = {};
    }

    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this._events.newListener) {
        this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
    }

    // Optimize the case of one listener. Don't need the extra array object.
    if (!this._events[type]) {
        this._events[type] = listener;
    }
    // If we've already got an array, just append.
    else if (isObject(this._events[type])) {
            this._events[type].push(listener);
        }
        // Adding the second element, need to change to array.
        else {
                this._events[type] = [this._events[type], listener];
            }

    // Check for listener leak
    if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
            m = this._maxListeners;
        } else {
            m = EventEmitter.defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
            // Not supported in IE 10
            if (typeof console.trace === "function") {
                console.trace();
            }
        }
    }

    return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

// Modified to support multiple calls..
EventEmitter.prototype.once = function (type, listener) {
    if (!isFunction(listener)) {
        throw TypeError("listener must be a function");
    }

    var fired = false;

    if (this._events.hasOwnProperty(type) && type.charAt(0) === "_") {
        var count = 1;
        var searchFor = type;

        for (var k in this._events) {
            if (this._events.hasOwnProperty(k) && k.startsWith(searchFor)) {
                count++;
            }
        }
        type = type + count;
    }

    function g() {
        if (type.charAt(0) === "_" && !isNaN(type.substr(type.length - 1))) {
            type = type.substring(0, type.length - 1);
        }
        this.removeListener(type, g);

        if (!fired) {
            fired = true;
            listener.apply(this, arguments);
        }
    }

    g.listener = listener;
    this.on(type, g);

    return this;
};

// Emits a "removeListener" event if the listener was removed..
// Modified to support multiple calls from .once()..
EventEmitter.prototype.removeListener = function (type, listener) {
    var list, position, length, i;

    if (!isFunction(listener)) {
        throw TypeError("listener must be a function");
    }

    if (!this._events || !this._events[type]) {
        return this;
    }

    list = this._events[type];
    length = list.length;
    position = -1;
    if (list === listener || isFunction(list.listener) && list.listener === listener) {
        delete this._events[type];

        if (this._events.hasOwnProperty(type + "2") && type.charAt(0) === "_") {
            var searchFor = type;
            for (var k in this._events) {
                if (this._events.hasOwnProperty(k) && k.startsWith(searchFor)) {
                    if (!isNaN(parseInt(k.substr(k.length - 1)))) {
                        this._events[type + parseInt(k.substr(k.length - 1) - 1)] = this._events[k];
                        delete this._events[k];
                    }
                }
            }

            this._events[type] = this._events[type + "1"];
            delete this._events[type + "1"];
        }
        if (this._events.removeListener) {
            this.emit("removeListener", type, listener);
        }
    } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
            if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                position = i;
                break;
            }
        }

        if (position < 0) {
            return this;
        }

        if (list.length === 1) {
            list.length = 0;
            delete this._events[type];
        } else {
            list.splice(position, 1);
        }

        if (this._events.removeListener) {
            this.emit("removeListener", type, listener);
        }
    }

    return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
    var key, listeners;

    if (!this._events) {
        return this;
    }

    // not listening for removeListener, no need to emit
    if (!this._events.removeListener) {
        if (arguments.length === 0) {
            this._events = {};
        } else if (this._events[type]) {
            delete this._events[type];
        }
        return this;
    }

    // emit removeListener for all listeners on all events
    if (arguments.length === 0) {
        for (key in this._events) {
            if (key === "removeListener") {
                continue;
            }
            this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = {};
        return this;
    }

    listeners = this._events[type];

    if (isFunction(listeners)) {
        this.removeListener(type, listeners);
    } else if (listeners) {
        while (listeners.length) {
            this.removeListener(type, listeners[listeners.length - 1]);
        }
    }
    delete this._events[type];

    return this;
};

EventEmitter.prototype.listeners = function (type) {
    var ret;
    if (!this._events || !this._events[type]) {
        ret = [];
    } else if (isFunction(this._events[type])) {
        ret = [this._events[type]];
    } else {
        ret = this._events[type].slice();
    }
    return ret;
};

EventEmitter.prototype.listenerCount = function (type) {
    if (this._events) {
        var evlistener = this._events[type];

        if (isFunction(evlistener)) {
            return 1;
        } else if (evlistener) {
            return evlistener.length;
        }
    }
    return 0;
};

EventEmitter.listenerCount = function (emitter, type) {
    return emitter.listenerCount(type);
};

function isFunction(arg) {
    return typeof arg === "function";
}

function isNumber(arg) {
    return typeof arg === "number";
}

function isObject(arg) {
    return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === "object" && arg !== null;
}

function isUndefined(arg) {
    return arg === void 0;
}

},{}],15:[function(require,module,exports){
"use strict";

var _ = require("./utils");

var currentLevel = "info";
var levels = { "trace": 0, "debug": 1, "info": 2, "warn": 3, "error": 4, "fatal": 5

    // Logger implementation..
};function log(level) {
    // Return a console message depending on the logging level..
    return function (message) {
        if (levels[level] >= levels[currentLevel]) {
            console.log("[" + _.formatDate(new Date()) + "] " + level + ": " + message);
        }
    };
}

module.exports = {
    // Change the current logging level..
    setLevel: function setLevel(level) {
        currentLevel = level;
    },
    trace: log("trace"),
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
    fatal: log("fatal")
};

},{"./utils":18}],16:[function(require,module,exports){
"use strict";

/*
    Copyright (c) 2013-2015, Fionn Kelleher All rights reserved.

    Redistribution and use in source and binary forms, with or without modification,
    are permitted provided that the following conditions are met:

        Redistributions of source code must retain the above copyright notice,
        this list of conditions and the following disclaimer.

        Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation and/or other materials
        provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
    IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
    INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
    OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
    WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
    ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
    OF SUCH DAMAGE.
*/
var _ = require("./utils");
var nonspaceRegex = /\S+/g;

function parseComplexTag(tags, tagKey) {
    var splA = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ",";
    var splB = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "/";
    var splC = arguments[4];

    var raw = tags[tagKey];

    if (raw === undefined) {
        return tags;
    }

    var tagIsString = _.isString(raw);
    tags[tagKey + "-raw"] = tagIsString ? raw : null;

    if (raw === true) {
        tags[tagKey] = null;
        return tags;
    }

    tags[tagKey] = {};

    if (tagIsString) {
        var spl = raw.split(splA);

        for (var i = 0; i < spl.length; i++) {
            var parts = spl[i].split(splB);
            var val = parts[1];
            if (splC !== undefined && val) {
                val = val.split(splC);
            }
            tags[tagKey][parts[0]] = val || null;
        }
    }
    return tags;
}

module.exports = {
    // Parse Twitch badges..
    badges: function badges(tags) {
        return parseComplexTag(tags, "badges");
    },

    // Parse Twitch badge-info..
    badgeInfo: function badgeInfo(tags) {
        return parseComplexTag(tags, "badge-info");
    },

    // Parse Twitch emotes..
    emotes: function emotes(tags) {
        return parseComplexTag(tags, "emotes", "/", ":", ",");
    },

    // Parse regex emotes..
    emoteRegex: function emoteRegex(msg, code, id, obj) {
        nonspaceRegex.lastIndex = 0;
        var regex = new RegExp("(\\b|^|\s)" + _.unescapeHtml(code) + "(\\b|$|\s)");
        var match;

        // Check if emote code matches using RegExp and push it to the object..
        while ((match = nonspaceRegex.exec(msg)) !== null) {
            if (regex.test(match[0])) {
                obj[id] = obj[id] || [];
                obj[id].push([match.index, nonspaceRegex.lastIndex - 1]);
            }
        }
    },

    // Parse string emotes..
    emoteString: function emoteString(msg, code, id, obj) {
        nonspaceRegex.lastIndex = 0;
        var match;

        // Check if emote code matches and push it to the object..
        while ((match = nonspaceRegex.exec(msg)) !== null) {
            if (match[0] === _.unescapeHtml(code)) {
                obj[id] = obj[id] || [];
                obj[id].push([match.index, nonspaceRegex.lastIndex - 1]);
            }
        }
    },

    // Transform the emotes object to a string with the following format..
    // emote_id:first_index-last_index,another_first-another_last/another_emote_id:first_index-last_index
    transformEmotes: function transformEmotes(emotes) {
        var transformed = "";

        Object.keys(emotes).forEach(function (id) {
            transformed = transformed + id + ":";
            emotes[id].forEach(function (index) {
                transformed = transformed + index.join("-") + ",";
            });
            transformed = transformed.slice(0, -1) + "/";
        });

        return transformed.slice(0, -1);
    },

    // Parse Twitch messages..
    msg: function msg(data) {
        var message = {
            raw: data,
            tags: {},
            prefix: null,
            command: null,
            params: []

            // Position and nextspace are used by the parser as a reference..
        };var position = 0;
        var nextspace = 0;

        // The first thing we check for is IRCv3.2 message tags.
        // http://ircv3.atheme.org/specification/message-tags-3.2
        if (data.charCodeAt(0) === 64) {
            var nextspace = data.indexOf(" ");

            // Malformed IRC message..
            if (nextspace === -1) {
                return null;
            }

            // Tags are split by a semi colon..
            var rawTags = data.slice(1, nextspace).split(";");

            for (var i = 0; i < rawTags.length; i++) {
                // Tags delimited by an equals sign are key=value tags.
                // If there's no equals, we assign the tag a value of true.
                var tag = rawTags[i];
                var pair = tag.split("=");
                message.tags[pair[0]] = tag.substring(tag.indexOf("=") + 1) || true;
            }

            position = nextspace + 1;
        }

        // Skip any trailing whitespace..
        while (data.charCodeAt(position) === 32) {
            position++;
        }

        // Extract the message's prefix if present. Prefixes are prepended with a colon..
        if (data.charCodeAt(position) === 58) {
            nextspace = data.indexOf(" ", position);

            // If there's nothing after the prefix, deem this message to be malformed.
            if (nextspace === -1) {
                return null;
            }

            message.prefix = data.slice(position + 1, nextspace);
            position = nextspace + 1;

            // Skip any trailing whitespace..
            while (data.charCodeAt(position) === 32) {
                position++;
            }
        }

        nextspace = data.indexOf(" ", position);

        // If there's no more whitespace left, extract everything from the
        // current position to the end of the string as the command..
        if (nextspace === -1) {
            if (data.length > position) {
                message.command = data.slice(position);
                return message;
            }

            return null;
        }

        // Else, the command is the current position up to the next space. After
        // that, we expect some parameters.
        message.command = data.slice(position, nextspace);

        position = nextspace + 1;

        // Skip any trailing whitespace..
        while (data.charCodeAt(position) === 32) {
            position++;
        }

        while (position < data.length) {
            nextspace = data.indexOf(" ", position);

            // If the character is a colon, we've got a trailing parameter.
            // At this point, there are no extra params, so we push everything
            // from after the colon to the end of the string, to the params array
            // and break out of the loop.
            if (data.charCodeAt(position) === 58) {
                message.params.push(data.slice(position + 1));
                break;
            }

            // If we still have some whitespace...
            if (nextspace !== -1) {
                // Push whatever's between the current position and the next
                // space to the params array.
                message.params.push(data.slice(position, nextspace));
                position = nextspace + 1;

                // Skip any trailing whitespace and continue looping.
                while (data.charCodeAt(position) === 32) {
                    position++;
                }

                continue;
            }

            // If we don't have any more whitespace and the param isn't trailing,
            // push everything remaining to the params array.
            if (nextspace === -1) {
                message.params.push(data.slice(position));
                break;
            }
        }

        return message;
    }
};

},{"./utils":18}],17:[function(require,module,exports){
"use strict";

// Initialize the queue with a specific delay..
function queue(defaultDelay) {
    this.queue = [];
    this.index = 0;
    this.defaultDelay = defaultDelay || 3000;
}

// Add a new function to the queue..
queue.prototype.add = function add(fn, delay) {
    this.queue.push({
        fn: fn,
        delay: delay
    });
};

// Run the current queue..
queue.prototype.run = function run(index) {
    (index || index === 0) && (this.index = index);
    this.next();
};

// Go to the next in queue..
queue.prototype.next = function next() {
    var _this = this;

    var i = this.index++;
    var at = this.queue[i];
    var next = this.queue[this.index];

    if (!at) {
        return;
    }

    at.fn();
    next && setTimeout(function () {
        _this.next();
    }, next.delay || this.defaultDelay);
};

// Reset the queue..
queue.prototype.reset = function reset() {
    this.index = 0;
};

// Clear the queue..
queue.prototype.clear = function clear() {
    this.index = 0;
    this.queue = [];
};

exports.queue = queue;

},{}],18:[function(require,module,exports){
(function (process){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var actionMessageRegex = /^\u0001ACTION ([^\u0001]+)\u0001$/;
var justinFanRegex = /^(justinfan)(\d+$)/;
var unescapeIRCRegex = /\\([sn:r\\])/g;
var ircEscapedChars = { s: ' ', n: '', ':': ';', r: '' };
var self = module.exports = {
    // Return the second value if the first value is undefined..
    get: function get(obj1, obj2) {
        return typeof obj1 === "undefined" ? obj2 : obj1;
    },

    // Value is a boolean..
    isBoolean: function isBoolean(obj) {
        return typeof obj === "boolean";
    },

    // Value is a finite number..
    isFinite: function (_isFinite) {
        function isFinite(_x) {
            return _isFinite.apply(this, arguments);
        }

        isFinite.toString = function () {
            return _isFinite.toString();
        };

        return isFinite;
    }(function (int) {
        return isFinite(int) && !isNaN(parseFloat(int));
    }),

    // Value is an integer..
    isInteger: function isInteger(int) {
        return !isNaN(self.toNumber(int, 0));
    },

    // Username is a justinfan username..
    isJustinfan: function isJustinfan(username) {
        return justinFanRegex.test(username);
    },

    // Value is null..
    isNull: function isNull(obj) {
        return obj === null;
    },

    // Value is a regex..
    isRegex: function isRegex(str) {
        return (/[\|\\\^\$\*\+\?\:\#]/.test(str)
        );
    },

    // Value is a string..
    isString: function isString(str) {
        return typeof str === "string";
    },

    // Value is a valid url..
    isURL: function isURL(str) {
        return RegExp('^(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$', "i").test(str);
    },

    // Return a random justinfan username..
    justinfan: function justinfan() {
        return 'justinfan' + Math.floor(Math.random() * 80000 + 1000);
    },

    // Return a valid password..
    password: function password(str) {
        return ["SCHMOOPIIE", "", null].includes(str) ? "SCHMOOPIIE" : 'oauth:' + str.toLowerCase().replace("oauth:", "");
    },

    // Race a promise against a delay..
    promiseDelay: function promiseDelay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    },

    // Replace all occurences of a string using an object..
    replaceAll: function replaceAll(str, obj) {
        if (str === null || typeof str === "undefined") {
            return null;
        }
        for (var x in obj) {
            str = str.replace(new RegExp(x, "g"), obj[x]);
        }
        return str;
    },

    unescapeHtml: function unescapeHtml(safe) {
        return safe.replace(/\\&amp\\;/g, "&").replace(/\\&lt\\;/g, "<").replace(/\\&gt\\;/g, ">").replace(/\\&quot\\;/g, "\"").replace(/\\&#039\\;/g, "'");
    },

    // Escaping values: http://ircv3.net/specs/core/message-tags-3.2.html#escaping-values
    unescapeIRC: function unescapeIRC(msg) {
        return !msg || !msg.includes('\\') ? msg : msg.replace(unescapeIRCRegex, function (m, p) {
            return p in ircEscapedChars ? ircEscapedChars[p] : p;
        });
    },

    actionMessage: function actionMessage(msg) {
        return msg.match(actionMessageRegex);
    },

    // Add word to a string..
    addWord: function addWord(line, word) {
        return line.length ? line + " " + word : line + word;
    },

    // Return a valid channel name..
    channel: function channel(str) {
        var channel = (str ? str : "").toLowerCase();
        return channel[0] === "#" ? channel : "#" + channel;
    },

    // Extract a number from a string..
    extractNumber: function extractNumber(str) {
        var parts = str.split(" ");
        for (var i = 0; i < parts.length; i++) {
            if (self.isInteger(parts[i])) {
                return ~~parts[i];
            }
        }
        return 0;
    },

    // Format the date..
    formatDate: function formatDate(date) {
        var hours = date.getHours();
        var mins = date.getMinutes();

        hours = (hours < 10 ? "0" : "") + hours;
        mins = (mins < 10 ? "0" : "") + mins;

        return hours + ':' + mins;
    },

    // Inherit the prototype methods from one constructor into another..
    inherits: function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function TempCtor() {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
    },

    // Return whether inside a Node application or not..
    isNode: function isNode() {
        try {
            return "object" === (typeof process === 'undefined' ? 'undefined' : _typeof(process)) && Object.prototype.toString.call(process) === "[object process]";
        } catch (e) {}
        return false;
    },

    // Return whether inside a Chrome extension or not..
    isExtension: function isExtension() {
        try {
            return window.chrome && chrome.runtime && chrome.runtime.id;
        } catch (e) {}
        return false;
    },

    // Return whether inside a React Native app..
    isReactNative: function isReactNative() {
        try {
            return navigator && navigator.product == "ReactNative";
        } catch (e) {}
        return false;
    },

    // Merge two objects..
    merge: Object.assign,

    // Split a line but try not to cut a word in half..
    splitLine: function splitLine(input, length) {
        var lastSpace = input.substring(0, length).lastIndexOf(" ");
        // No spaces found, split at the very end to avoid a loop..
        if (lastSpace === -1) {
            lastSpace = length - 1;
        }
        return [input.substring(0, lastSpace), input.substring(lastSpace + 1)];
    },

    // Parse string to number. Returns NaN if string can't be parsed to number..
    toNumber: function toNumber(num, precision) {
        if (num === null) return 0;
        var factor = Math.pow(10, self.isFinite(precision) ? precision : 0);
        return Math.round(num * factor) / factor;
    },

    // Merge two arrays..
    union: function union(arr1, arr2) {
        var hash = {};
        var ret = [];
        for (var i = 0; i < arr1.length; i++) {
            var e = arr1[i];
            if (!hash[e]) {
                hash[e] = true;
                ret.push(e);
            }
        }
        for (var i = 0; i < arr2.length; i++) {
            var e = arr2[i];
            if (!hash[e]) {
                hash[e] = true;
                ret.push(e);
            }
        }
        return ret;
    },

    // Return a valid username..
    username: function username(str) {
        var username = (str ? str : "").toLowerCase();
        return username[0] === "#" ? username.slice(1) : username;
    }
};

}).call(this,require('_process'))
},{"_process":6}],19:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":20,"punycode":5,"querystring":9}],20:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}]},{},[1]);
