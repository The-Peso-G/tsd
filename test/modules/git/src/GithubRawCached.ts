///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/git/GithubRawCached.ts" />
///<reference path="../../../../src/tsd/context/Context.ts" />

describe('git.GithubRawCached', () => {

	var raw:git.GithubRawCached;

	var context:tsd.Context;
	var repo:git.GithubRepo;

	var path = require('path');
	var cacheDir;

	beforeEach(() => {
		context = new tsd.Context();
		context.paths.cacheDir = path.resolve(__dirname, tsd.Const.cacheDir);

		cacheDir = path.join(context.paths.cacheDir, 'git_raw');
		repo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);

		raw = new git.GithubRawCached(repo, cacheDir);
	});
	afterEach(() => {
		context = null;
		repo = null;
		raw = null;
	});

	it('should be defined', () => {
		assert.isFunction(git.GithubRawCached, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			raw = new git.GithubRawCached(null, null);
		});
	});
	it('should have default options', () => {
		assert.isFunction(git.GithubRawCached, 'constructor');
		assert.isTrue(raw.loader.options.cacheRead, 'options.cacheRead');
		assert.isTrue(raw.loader.options.cacheWrite, 'options.cacheWrite');
		assert.isTrue(raw.loader.options.remoteRead, 'options.remoteRead');
	});

	describe('getFile', () => {

		var filePath = 'async/async.d.ts';
		var commitSha = '1eab71a53a7df593305bd9b8b27cb752cc045417';

		it('should cache and return data', () => {
			//raw.debug = true;

			assert.isTrue(raw.stats.hasAllZero(), 'pretest stats');

			return raw.getFile(commitSha, filePath).then((data) => {
				assert.ok(data, 'first callback data');
				assert.isString(data, 'first callback data');
				assert.operator(data.length, '>', 20, 'first callback data');

				//xm.log(raw.loader.stats.stats.export());
				helper.assertStatCounter(raw.loader.stats, {
					start: 1,
					'read-start': 1,
					'active-set': 1,
					'read-miss': 1,
					'load-start': 1,
					'load-success': 1,
					'write-start': 1,
					'write-success': 1,
					'active-remove': 1,
					complete: 1
				}, 'first');

				// get again, should be cached
				return raw.getFile(commitSha, filePath);
			}).then((data) => {
				assert.ok(data, 'second callback data');
				assert.isString(data, 'second callback data');
				assert.operator(data.length, '>', 20, 'second callback data');

				//xm.log(raw.loader.stats.stats.export());
				helper.assertStatCounter(raw.loader.stats, {
					start: 2,
					'read-start': 2,
					'active-set': 2,
					'read-miss': 1,
					'load-start': 1,
					'load-success': 1,
					'write-start': 1,
					'write-success': 1,
					'active-remove': 2,
					complete: 2,
					'read-hit': 1,
					'cache-hit': 1
				}, 'second');

			});
		});
	});
});