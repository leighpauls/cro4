
exports.forEachBut = function(entries, but, fn) {
	for (var i = 0; i < entries.length; ++i) {
		if (entries[i] !== but) {
			if (fn(entries[i]) === false) {
				break;
			}
		}
	}
};