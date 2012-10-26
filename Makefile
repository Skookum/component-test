setup:
	rm -rf node_modules
	npm cache clean
	npm install

test:
	npm install
	source "config.test" && scripts/test

test-quick:
	source "config.test" && scripts/test

start:
	source "config.default" && npm start

open:
	(sleep 2 && open http://localhost:3000) &
	npm start



.PHONY: setup test test-quick start open