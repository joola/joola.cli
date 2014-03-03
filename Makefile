REPORTER=spec

COVERALLS_GIT_COMMIT=HEAD
COVERALLS_REPO_TOKEN=9LkVCJfFfDVrHRPbdijLEyk2ru5f68z2d

export COVERALLS_GIT_COMMIT
export COVERALLS_REPO_TOKEN

test:
		$(MAKE) lint
		@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER)

lint:
		@./node_modules/.bin/jshint ./bin

test-cov:	
		$(MAKE) istanbul

istanbul:
		./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -R spec test

coveralls:
		cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: test

