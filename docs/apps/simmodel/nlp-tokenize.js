var tokenize = (function factory() {
    
// @@@@@@@@@@@@@@@@@@@@@ https://www.npmjs.com/package/@stdlib/nlp-tokenize
'use strict';

var isBoolean = function isBoolean( value ) {
	return ( typeof value === 'boolean' );
};
var isString = function isBoolean( value ) {
	return ( typeof value === 'string' );
};
var hasOwnProp = function hasOwnProp( value, property ) {
	if (
		value === void 0 ||
		value === null
	) {
		return false;
	}
	return Object.prototype.hasOwnProperty.call( value, property );
};
var ABBRS = {
    "i.e.": ["i.e."],
    "I.e.": ["I.e."],
    "I.E.": ["I.E."],
    "e.g.": ["e.g."],
    "E.g.": ["E.g."],
    "E.G.": ["E.G."],
    "et al.": ["et al."],
    "etc.": ["etc."],
    "vs.": ["vs."],
    "A.S.A.P": ["A.S.A.P"],
    "E.T.A.": ["E.T.A."],
    "D.I.Y": ["D.I.Y"],
    "R.S.V.P": ["R.S.V.P"],
    "P.S.": ["P.S."],
    "B.Y.O.B": ["B.Y.O.B"],
    "Ms.": ["Ms."],
    "Mr.": ["Mr."],
    "Dr.": ["Dr."],
    "Prof.": ["Prof."],
    "Mrs.": ["Mrs."],
    "Messrs.": ["Messrs."],
    "Gov.": ["Gov."],
    "Gen.": ["Gen."],
    "Lt.": ["Lt."],
    "Col.":["Col."],
    "Mt.": ["Mt."],
    "Bros.": ["Bros."],
    "Corp.": ["Corp."],
    "Co.": ["Co."],
    "co.": ["co."],
    "Inc.": ["Inc."],
    "Ltd.": ["Ltd."],
    "Rep.": ["Rep."],
    "Sen.": ["Sen."],
    "Jr.": ["Jr."],
    "Sr.": ["Sr."],
    "Ph.D.": ["Ph.D."],
    "J.D.": ["J.D."],
    "M.D.": ["M.D."],
    "Rev.": ["Rev."],
    "Adm.": ["Adm."],
    "St.": ["St."],
    "a.m.": ["a.m."],
    "p.m.": ["p.m."],
    "b.c.": ["b.c."],
    "B.C.": ["B.C."],
    "a.d.": ["a.d."],
    "A.D.": ["A.D."],
    "b.c.e.": ["b.c.e."],
    "B.C.E.": ["B.C.E."],
    "Jan.": ["Jan."],
    "Feb.": ["Feb."],
    "Mar.": ["Mar."],
    "Apr.": ["Apr."],
    "May.": ["May."],
    "Jun.": ["Jun."],
    "Jul.": ["Jul."],
    "Aug.": ["Aug."],
    "Sep.": ["Sep."],
    "Sept.": ["Sept."],
    "Oct.": ["Oct."],
    "Nov.": ["Nov."],
    "Dec.": ["Dec."],
    "Ala.": ["Ala."],
    "Ariz.": ["Ariz."],
    "Ark.": [ "Ark."],
    "Calif.": ["Calif."],
    "Colo.": ["Colo."],
    "Conn.": ["Conn."],
    "Del.": [ "Del."],
    "D.C.": ["D.C."],
    "Fla.": [ "Fla."],
    "Ga.": ["Ga."],
    "Ill.": ["Ill."],
    "Ind.": ["Ind."],
    "Kans.": ["Kans."],
    "Kan.": ["Kan."],
    "Ky.": ["Ky."],
    "La.": ["La."],
    "Md.": ["Md."],
    "Mass.": ["Mass."],
    "Mich.": ["Mich."],
    "Minn.": ["Minn."],
    "Miss.": ["Miss."],
    "Mo.": ["Mo."],
    "Mont.": ["Mont."],
    "Nebr.": ["Nebr."],
    "Neb.": ["Neb."],
    "Nev.": [ "Nev."],
    "N.H.": ["N.H."],
    "N.J.": ["N.J."],
    "N.M.": ["N.M."],
    "N.Y.": ["N.Y."],
    "N.C.": ["N.C."],
    "N.D.": ["N.D."],
    "Okla.": ["Okla."],
    "Ore.": ["Ore."],
    "Pa.": ["Pa."],
    "Tenn.": ["Tenn."],
    "Va.": ["Va."],
    "Wash.": ["Wash."],
    "Wis.": ["Wis."]
};
var EMOJIS = {
    "^_^": ["^_^"],
    "=D": ["=D"],
    ";-p": [";-p"],
    ":O": [":O"],
    ":-/": [":-/"],
    "xD": ["xD"],
    "V_V": ["V_V"],
    ";(": [";("],
    "(:": ["(:"],
    "\")": ["\")"],
    ":Y": [":Y"],
    ":]": [":]"],
    ":3": [":3"],
    ":(": [":("],
    ":-)": [":-)"],
    "=3": ["=3"],
    ":))": [":))"],
    ":>": [":>"],
    ";p": [";p"],
    ":p": [":p"],
    "=[[": ["=[["],
    "xDD": ["xDD"],
    "<333": ["<333"],
    "<33": ["<33"],
    ":P": [":P"],
    "o.O": ["o.O"],
    "<3": ["<3"],
    ";-)": [";-)"],
    ":)": [":)"],
    "-_-": ["-_-"],
    ":')": [":')"],
    "o_O": ["o_O"],
    ";)": [";)"],
    "=]": ["=]"],
    "(=": ["(="],
    "-__-": ["-__-"],
    ":/": [":/"],
    ":0": [":0"],
    "(^_^)": ["(^_^)"],
    ";D": [";D"],
    "o_o": ["o_o"],
    ":((": [":(("],
    "=)": ["=)"]
};

var CONTRACT = {
    "'s": ["'s"],
    "'S": ["'S"],
    "ain't": ["ai", "n't"],
    "aint": ["ai", "nt"],
    "Ain't": ["Ai", "n't"],
    "aren't": ["are", "n't"],
    "arent": ["are", "nt"],
    "Aren't": ["Are", "n't"],
    "can't": ["ca", "n't"],
    "cant": ["ca", "nt"],
    "Can't": ["Ca", "n't"],
    "can't've": ["ca", "n't", "'ve"],
    "'cause": ["'cause'"],
    "cannot": ["can", "not"],
    "Cannot": ["Can", "not"],
    "could've": ["could", "'ve"],
    "couldve": ["could", "ve"],
    "Could've": ["Could", "'ve"],
    "couldn't": ["could", "n't"],
    "couldnt": ["could", "nt"],
    "Couldn't": ["Could", "n't"],
    "couldn't've": ["could", "n't", "'ve"],
    "couldntve": ["could", "nt", "ve"],
    "Couldn't've": ["Could", "n't", "'ve"],
    "didn't": ["did", "n't"],
    "didnt": ["did", "nt"],
    "Didn't": ["Did", "n't"],
    "doesn't": ["does", "n't"],
    "doesnt": ["does", "nt"],
    "Doesn't": ["Does", "n't"],
    "don't": ["do", "n't"],
    "dont": ["do", "nt"],
    "Don't": ["Do", "n't"],
    "hadn't": ["had", "n't"],
    "hadnt": ["had", "nt"],
    "Hadn't": ["Had", "n't"],
    "hadn't've": ["had", "n't", "'ve"],
    "hasn't": ["has", "n't"],
    "hasnt": ["has", "nt"],
    "haven't": ["have", "n't"],
    "havent": ["have", "nt"],
    "he'd": ["he", "'d"],
    "hed": ["he", "d"],
    "he'd've": ["he", "'d", "'ve"],
    "hedve": ["he", "d", "ve"],
    "he'll": ["he", "'ll"],
    "he'll've": ["he", "'ll", "'ve"],
    "he's": ["he", "'s"],
    "hes": ["he", "s"],
    "how'd": ["how", "'d"],
    "howd": ["how", "d"],
    "how'd'y": [ "how", "'d", "'y" ],
    "how'll": ["how", "'ll"],
    "howll": ["how", "ll"],
    "how's": ["how", "'s"],
    "hows": ["how", "s"],
    "I'd": ["I", "'d"],
    "I'd've": ["I", "'d", "'ve"],
    "I'll": ["I", "'ll"],
    "i'll": ["i", "'ll"],
    "I'll've": ["I", "'ll", "'ve"],
    "i'll've": ["i", "'ll", "'ve"],
    "I'm": ["I", "'m"],
    "i'm": ["i", "'m"],
    "Im": ["I", "m"],
    "im": ["i", "m"],
    "I'ma": ["I", "'ma"],
    "i'ma": ["i", "'ma"],
    "I've": ["I", "'ve"],
    "i've": ["i", "'ve"],
    "isn't": ["is", "n't"],
    "isnt": ["is", "nt"],
    "Isn't": ["Is", "n't"],
    "It'd": ["It", "'d"],
    "it'd": ["it", "'d"],
    "it'd've": ["it", "'d", "'ve"],
    "it'll've": ["it", "'ll", "'ve"],
    "it'll": ["it", "'ll"],
    "itll": ["it", "ll"],
    "it's": ["it", "'s"],
    "let's": ["let", "'s"],
    "lets": ["let", "s"],
    "ma'am": ["ma'am"],
    "mayn't": ["may", "n't"],
    "mightn't": ["might", "n't"],
    "mightn't've": ["might", "n't", "'ve"],
    "might've": ["might", "'ve"],
    "mustn't": ["must", "n't"],
    "mustn't've": ["must", "n't","'ve"],
    "must've": ["must", "'ve"],
    "needn't": ["need", "n't"],
    "needn't've": ["need", "n't", "'ve"],
    "not've": ["not", "'ve"],
    "o'clock": ["o'clock"],
    "oughtn't": ["ought", "n't"],
    "oughtn't've": ["ought", "n't", "'ve"],
    "so've": ["so", "'ve"],
    "so's": ["so", "'s"],
    "shan't": ["sha", "n't"],
    "sha'n't": ["sha'", "n't"],
    "shan't've": ["sha", "n't", "'ve"],
    "she'd": ["she", "'d"],
    "she'd've": ["she", "'d", "'ve"],
    "she'll": ["she", "'ll"],
    "she'll've": ["she", "'ll", "'ve"],
    "she's": ["she", "'s"],
    "should've": ["should", "'ve"],
    "shouldn't": ["should", "n't"],
    "shouldn't've": ["should", "n't", "'ve"],
    "that'd": ["that", "'d"],
    "that'd've": ["that", "'d", "'ve"],
    "that's": ["that", "'s"],
    "thats": ["that", "s"],
    "there'd": ["there", "'d"],
    "there'd've": ["there", "'d", "'ve"],
    "there's": ["there", "'s"],
    "they'd": ["they", "'d"],
    "They'd": ["They", "'d"],
    "they'd've": ["they", "'d", "'ve"],
    "They'd've": ["They", "'d", "'ve"],
    "they'll": ["they", "'ll"],
    "They'll": ["They", "'ll"],
    "they'll've": ["they", "'ll", "'ve"],
    "They'll've": ["They", "'ll", "'ve"],
    "they're": ["they", "'re"],
    "They're": ["They", "'re"],
    "they've": ["they", "'ve"],
    "They've": ["They", "'ve"],
    "to've": ["to", "'ve"],
    "wasn't": ["was", "n't"],
    "we'd": ["we", "'d"],
    "We'd": ["We", "'d"],
    "we'd've": ["we", "'d", "'ve"],
    "we'll": ["we", "'ll"],
    "We'll": ["We", "'ll"],
    "we'll've": ["we", "'ll", "'ve"],
    "We'll've": ["We", "'ll", "'ve"],
    "we're": ["we", "'re"],
    "We're": ["We", "'re"],
    "we've": ["we", "'ve"],
    "We've": ["We", "'ve"],
    "weren't": ["were", "n't"],
    "what'll": ["what", "'ll"],
    "what'll've": ["what", "'ll", "'ve"],
    "what're": ["what", "'re"],
    "what's": ["what", "'s"],
    "what've": ["what", "'ve"],
    "when's": ["when", "'s"],
    "when've": ["when", "'ve"],
    "where'd": ["where", "'d"],
    "where's": ["where", "'s"],
    "where've": ["where", "'ve"],
    "who'd": ["who", "'d"],
    "who'll": ["who", "'ll"],
    "who'll've": ["who", "'ll'", "'ve'"],
    "who're": ["who", "'re"],
    "who's": ["who", "'s"],
    "who've": ["who", "'ve"],
    "why've": ["why", "'ve"],
    "why'll": ["why", "'ll"],
    "why're": ["why", "'re"],
    "why's": ["why", "'s"],
    "will've": ["will", "'ve"],
    "won't": ["wo", "n't"],
    "wont": ["wo", "nt"],
    "won't've": ["wo", "n't", "'ve"],
    "would've": ["would", "'ve"],
    "wouldn't": ["would", "n't"],
    "wouldn't've": ["would", "n't", "'ve"],
    "y'all": ["y'", "all"],
    "y'all'd": ["y'", "all", "'d"],
    "y'all'd've": ["y'","all", "'d", "'ve"],
    "y'all're": [ "y'", "all", "'re'"],
    "y'all've": [ "y'", "all", "ve"],
    "you'd": ["you", "'d"],
    "You'd": ["You", "'d"],
    "you'd've": ["you", "'d", "'ve"],
    "You'd've": ["You", "'d", "'ve"],
    "you'll": ["you", "'ll"],
    "You'll": ["You", "'ll"],
    "you'll've": ["you", "'ll", "'ve"],
    "You'll've": ["You", "'ll", "'ve"],
    "you're": ["you", "'re"],
    "You're": ["You", "'re"],
    "you've": ["you", "'ve"],
    "You've": ["You", "'ve"]
};


// VARIABLES //

var REGEXP_PREFIXES = /^([,([{*<"“'`‘.])/gi;
var REGEXP_SUFFIXES = /([,.!?%*>:;"'”`)\]}])$/gi;


// FUNCTIONS //

/**
* Extends an array by the elements of another array.
*
* @private
* @param {Array} arr - input array
* @param {Array} ext - array to extend `arr` with
* @returns {Array} mutated input array
*
* @example
* var arr = [ 1, 2, 3 ];
* var out = extend( arr, [ 4, 5 ] );
* // returns [ 1, 2, 3, 4, 5 ]
*/
function extend( arr, ext ) {
	var i;
	for ( i = 0; i < ext.length; i++ ) {
		arr.push( ext[ i ] );
	}
	return arr;
}

/**
* Tokenizes a substring.
*
* @private
* @param {string} substr - input string
* @returns {Array} token array
*
* @example
* var str = '(never)';
* var out = tokenizeSubstring( str );
* // returns [ '(', 'never', ')' ]
*/
function tokenizeSubstring( substr ) {
	var prefixes = [];
	var suffixes = [];
	var match;
	var done;
	var res;

	do {
		if (
			!EMOJIS[ substr ] &&
			!ABBRS[ substr ] &&
			!CONTRACT[ substr ]
		) {
			match = substr.split( REGEXP_PREFIXES );
			if ( match.length > 1 ) {
				prefixes.push( match[ 1 ] );
				substr = match[ 2 ];
			}
			else {
				match = substr.split( REGEXP_SUFFIXES );
				if ( match.length > 1 ) {
					substr = match[ 0 ];
					suffixes.push( match[ 1 ] );
				} else {
					done = true;
				}
			}
		}
		else {
			done = true;
		}
	} while ( !done );

	res = prefixes;
	res.push( substr );
	extend( res, suffixes );
	return res;
}


// MAIN //

/**
* Tokenize a string.
*
* @param {string} str - input string
* @param {boolean} [keepWhitespace=false] - boolean indicating whether whitespace characters should be returned as part of the token array
* @throws {TypeError} first argument must be a string primitive
* @throws {TypeError} second argument must be a boolean primitive
* @returns {Array} array of tokens
*
* @example
* var str = 'Hello World!';
* var out = tokenize( str );
* // returns [ 'Hello', 'World', '!' ]
*
* @example
* var str = '';
* var out = tokenize( str );
* // returns []
*
* @example
* var str = 'Hello Mrs. Maple, could you call me back?';
* var out = tokenize( str );
* // returns [ 'Hello', 'Mrs.', 'Maple', ',', 'could', 'you', 'call', 'me', 'back', '?' ]
*/
function tokenize( str, keepWhitespace ) {
	var subtkns;
	var substrs;
	var tokens;
	var substr;
	var cache;
	var i;
	if ( !isString( str ) ) {
		throw new TypeError( 'invalid argument. First argument must be a string primitive. Value: `' + str + '`.' );
	}
	if ( arguments.length > 1 ) {
		if ( !isBoolean( keepWhitespace ) ) {
			throw new TypeError( 'invalid argument. Second argument must be a boolean primitive. Value: `' + keepWhitespace + '`.' );
		}
	}
	if ( !str ) {
		return [];
	}

	// Split on whitespace:
	if ( keepWhitespace ) {
		substrs = str.split( /(\s+)/ );
	} else {
		substrs = str.split( /\s+/ );
	}

	// Set up cache to hold tokens for substring matches:
	cache = {};

	// Initialize token array:
	tokens = [];

	for ( i = 0; i < substrs.length; i++ ) {
		substr = substrs[ i ];
		if ( hasOwnProp( cache, substr ) ) {
			extend( tokens, cache[ substr ] );
		}
		else {
			subtkns = tokenizeSubstring( substr );
			extend( tokens, subtkns );
			cache[ substr ] = subtkns;
		}
	}
	return tokens;
}
// @@@@@@@@@@@@@@@@@@@@@    

return tokenize;
})();
