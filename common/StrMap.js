// indexes values by strings.
// guarded to prevent against prototype attacks
function StrMap() {
	this.map = {};
	this.keys = [];
	this.keyPos = {};
}

StrMap.prototype.put = function(key, val) {
	var safeKey = 'k_' + key;
	this.map[safeKey] = val;
	this.keyPos[safeKey] = this.keys.length;
	this.keys.push(key);
}

StrMap.prototype.get = function(key) {
	return this.map['k_' + key];
};

StrMap.prototype.remove = function(key) {
	var safeKey = 'k_' + key
	, keyPos = this.keyPos[safeKey];
	delete this.keyPos[safeKey];
	delete this.map[safeKey];
	
	this.keys.splice(keyPos, 1);
};

StrMap.prototype.length = function() {
	return this.keys.length;
};

StrMap.prototype.atIndex = function(i) {
	return this.map['k_' + this.keys[i]];
};