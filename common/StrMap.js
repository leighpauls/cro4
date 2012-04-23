// indexes values by strings.
// guarded to prevent against prototype attacks
function StrMap() {
	this.map = {};
	this.keys = [];
	this.keyPos = {};
}

StrMap.prototype.put = function(key, val) {
	if (key === undefined || key === null) {
		throw "invalid key: " + key;
	}

	var safeKey = 'k_' + key;
	this.map[safeKey] = val;
	this.keyPos[safeKey] = this.keys.length;
	this.keys.push(key);
}

StrMap.prototype.get = function(key) {
	if (key === undefined || key === null) {
		throw "invalid key: " + key;
	}

	return this.map['k_' + key];
};

StrMap.prototype.remove = function(key) {
	if (key === undefined || key === null) {
		throw "invalid key: " + key;
	}
	var safeKey = 'k_' + key
	, keyPos = this.keyPos[safeKey];

	if (keyPos === undefined) {
		throw "unknown key: " + key;
	}

	this.keyPos[safeKey] = undefined;
	this.map[safeKey] = undefined;
	
	this.keys.splice(keyPos, 1);
};

StrMap.prototype.length = function() {
	return this.keys.length;
};

StrMap.prototype.atIndex = function(i) {
	return this.map['k_' + this.keys[i]];
};