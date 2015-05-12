var Promise = require('bluebird').Promise;
var elasticsearch = require('elasticsearch');
var logger = require('../log')().get('modules');

var iiif_mapping = {
	iiif_manifest: {
		_id: {
			path: 'uri'
		},
		properties: {
			uri: {
				type: 'string',
				index: 'not_analyzed'
			},
			linkback: {
				type: 'string',
				index: 'not_analyzed'
			},
			license: {
				type: 'string',
				index: 'not_analyzed'
			},
			label: {
				type: 'string',
				copy_to: ['search_suggest']
			},
			description: {
				type: 'nested',
				properties: {
					lang: {
						type: 'string',
						index: 'not_analyzed'
					},
					value: {
						type: 'string',
						index: 'not_analyzed',
						copy_to: 'search_suggest'
					}
				}
			},
			metadata: {
				type: 'nested',
				properties: {
					label: {
						type: 'string',
						index: 'not_analyzed'
					},
					value: {
						type: 'nested',
						properties: {
							lang: {
								type: 'string',
								index: 'not_analyzed'
							},
							value: {
								type: 'string',
								index: 'not_analyzed',
								copy_to: 'search_suggest'
							}
						}
					}
				}
			},	
			attribution: {
				type: 'string',
				index: 'not_analyzed',
				copy_to: 'search_suggest'
			},
			thumbnail: {
				type: 'string',
				index: 'no'
			},
			search_suggest: {
				type: 'string'
			}
		}
	}
};


var Indexer = function(es_options) {
	logger.debug('Initializing first indexer instance: ' + JSON.stringify(es_options));
	this.es_options = es_options;
}

Indexer.prototype.createClient = function() {
	var self = this;

	return new Promise(function(resolve, reject) {
		if (!self.client) {
			self.client = new elasticsearch.Client({
				host: self.es_options.host+':'+self.es_options.port
			});
		}
		resolve(self.client);
	});
}

Indexer.prototype.getClient = function() {

	var self = this;

	return new Promise(function(resolve, reject) {
		self.createClient()
			.then(function(client) {
				client.ping({requestTimeout: self.es_options.timeout ? self.es_options.timeout : 3000 }, function(error) {
					if ( error ) {
						reject(error);
					} else {
						resolve(client);
					}
				});
			});
	});
}

Indexer.prototype.prepare = function(indexName) {

	var self = this;

	var indexRealName = indexName + '_' + (new Date().toISOString().substr(0,10));

	return new Promise(function(resolve, reject) {
		self.hasAlias(indexName)
			.then(function(aliasExists) {
				logger.debug('Alias State for ' + indexName + ': '+ JSON.stringify(aliasExists));
				if (aliasExists) {
					throw new Error('alias_exists');
				};
				logger.debug('Creating index: ' + indexRealName);
				return self.createIndex(indexRealName);
			})
			.then(function(createResult) {
				logger.debug('Index created, creating alias');
				return self.createAlias(indexRealName, indexName);
			})
			.then(function(aliasResult) {
				logger.debug('Alias created, creating mapping');
				return self.createMapping(indexRealName);
			})
			.then(function(mappingDone) {
				logger.debug('New index created');
				resolve(true);
			})
			.catch(function(error) {
				if ( error.message === 'alias_exists' ) {
					resolve(true);
					return;
				}
				logger.warn('Error preparing index: ' + error.toString());
				reject(error);
			});
	});
}

Indexer.prototype.hasIndex = function(indexName) {
	var self = this;

	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.indices.exists({index: indexName}, function(error, exists) {
					if ( error ) {
						reject(error);
						return;
					}
					resolve(exists);
				});
			});
	});	
}

Indexer.prototype.createIndex = function(indexName) {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.indices.create({index: indexName}, function(error, response) {
					if ( error ) {
						reject(error);
						return;
					}
					resolve(response);
				});
			});
	});	
}

Indexer.prototype.removeIndex = function(indexName) {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.indices.delete({index: indexName}, function(error, response) {
					if ( error ) {
						reject(error);
						return;
					}
					resolve(response);
				});
			});
	});
}

Indexer.prototype.createAlias = function(indexName, aliasName) {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.indices.putAlias({index: indexName, name: aliasName}, function(error, response) {
					if ( error ) {
						reject(error);
						return;
					}
					resolve(response);
				});
			});
	});

}

Indexer.prototype.hasAlias = function(aliasName) {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.indices.existsAlias({name: aliasName}, function(error, response) {
					if ( error ) {
						reject(error);
						return;
					}
					logger.debug('Aliases: ' + JSON.stringify(response));
					resolve(response);
				});
			});
	});
}

Indexer.prototype.createMapping = function(indexName) {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.indices.putMapping({body: iiif_mapping, index: indexName, type: 'iiif_manifest'}, function(error, response) {
					if ( error ) {
						reject(error);
						return;
					}
					resolve(response);
				});
			});
	});

}

Indexer.prototype.index = function(document) {

	var self = this;
	
	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.index({
				  index: 'iiif-gallery',
				  type: 'iiif_manifest',
				  body: document
				}, function(error, result) {
					if (error) {
						reject(error);
						return;
					}
					resolve(result);	
				});
			});
		});
}

Indexer.prototype.advancedSuggest = function(hint) {

	var self = this;
	
	return new Promise(function(resolve, reject) {
		if (!hint.value) {
			reject(new Error('Missing suggestion hint'));
			return;
		}

		if (!hint.terms || hint.terms.length === 0) {
			self.suggest(hint)
				.then(function(suggestions) {
					resolve(suggestions);
				})
				.catch(function(error) {
					reject(error);
				});
			return;
		}

		var suggestQuery = {
			query: {
				filtered: {
					filter: {
						terms: {
							search_suggest: hint.terms,
							execution: 'and',
							_cache: true
						}
					}
				}
			},
			aggs: {
				suggestions: {
					terms: {
						field: 'search_suggest',
						include: {
						     pattern: hint.value + '.*',
						     flags: 'CANON_EQ|CASE_INSENSITIVE' 
						 }
					}
				}
			}
		};

		logger.debug('Query: ' + JSON.stringify(suggestQuery));
		self.getClient()
                        .then(function(client) {
				client.search({
					index: 'iiif-gallery',
					type: 'iiif_manifest',
					searchType: 'count',
					body: suggestQuery
				}, function(error, results) {
					if (error) {
						reject(error);
						return;
					};
					var suggestions = [];
					if ( results && 
						results.aggregations && 
						results.aggregations.suggestions &&
						results.aggregations.suggestions.buckets ) {
						suggestions = results.aggregations.suggestions.buckets.map(function(bucket) {
							return bucket.key;
						});
					};
					logger.debug('Suggestion results: ' + JSON.stringify(results));
					resolve(suggestions);
				});
			});

	});
}

Indexer.prototype.suggest = function(hint) {
	
	var self = this;
	
	return new Promise(function(resolve, reject) {
		if (!hint.value) {
			reject(new Error('Missing suggestion hint'));
			return;
		}

		self.getClient()
                        .then(function(client) {
				client.search({
					index: 'iiif-gallery',
					type: 'iiif_manifest',
					searchType: 'count',
					body: {
						query: { match_all: {} },
						aggs: {
							suggestions: {
								terms: {
									field: 'search_suggest',
									include: {
										pattern:  hint.value + '.*',
										flags : 'CANON_EQ|CASE_INSENSITIVE'
									}
								}
							}
						}
					}
				}, function(error, results) {
					if (error) {
						reject(error);
						return;
					};
					var suggestions = [];
					if ( results && 
						results.aggregations && 
						results.aggregations.suggestions &&
						results.aggregations.suggestions.buckets ) {
						suggestions = results.aggregations.suggestions.buckets.map(function(bucket) {
							return bucket.key;
						});
					};
					logger.debug('Suggestion results: ' + JSON.stringify(results));
					resolve(suggestions);
				});
			});
	});
}

Indexer.prototype.search = function(terms) {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		if (!terms || !Array.isArray(terms) || terms.length === 0) {
			reject(new Error('Missing terms in search request'));
			return;
		}

		var searchText = terms.join(' ');
		var searchQuery = {
			query: {
				filtered: {
					query: {
						bool: {
							must: [
								{
									match: {
										search_suggest: searchText 
									}
								}
							],
							should: [
								{
									match: {
										label: searchText
									}
								},
								{
									match_phrase: {
										label: {
											query: searchText,
											boost: 2.0
										}
									}
								},
								{
									match_phrase: {
										label: {
											query: searchText,
											slop: 2,
											boost: 1.5
										}
									}
								},
								{
									match_phrase: {
										search_suggest: {
											query:  searchText,
											slop: 2,
											boost: 1.0
										}
									}
								}
							]
						}
					},
					filter: {
						terms: {
							search_suggest: terms,
							execution: 'fielddata'
						}
					}
				}
			}
		};

		self.getClient()
                        .then(function(client) {
				client.search({
					index: 'iiif-gallery',
					type: 'iiif_manifest',
					body: searchQuery
				}, function(error, results) {
					if ( error ) {
						reject( new Error('Query failed: ' + error.message));
						return;
					}
					var hits = results.hits.hits;
					var sources = hits.map(function(hit) {
						var source = hit['_source'];
						source.score = hit._score;
						return source;
					});
					resolve(sources);
				});
			});
	});
 
	
}

var indexer;

module.exports = function(es_options) {
	if ( !indexer ) {
		indexer = new Indexer(es_options);
	}

	return indexer;
}
