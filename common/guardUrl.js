function guardUrl(unsafeUrl) {
	if ((/^https?:/g).test(unsafeUrl)) {
		return unsafeUrl;
	}
	return 'http://' + unsafeUrl;
}