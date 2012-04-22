chromeext : chromeExt/* common/*
	-rm -rf build
	mkdir build
	mkdir build/chromeExt
	mkdir build/chromeExt/common
	cp chromeExt/* build/chromeExt/
	cp common/* build/chromeExt/common/
