var Promise = require('bluebird').Promise;
var elasticsearch = require('elasticsearch');
var logger = require('../log')().get('modules');

var iiif_settings = {
     settings: {
        analysis: {
             analyzer: {
                 edge_analyzer: {
                      tokenizer: 'edge_tokenizer',
                      filter: ['lowercase', 'asciifolding']
                 },
                 folding_analyzer: {
                      tokenizer: 'standard',
                      filter: [ 'lowercase', 'asciifolding' ]
                 },
                 sort_analyzer: {
                      tokenizer: 'keyword',
                      filter: [ 'lowercase', 'asciifolding' ]
                 }
            },
            tokenizer: {
                edge_tokenizer: {
                    type: 'edgeNGram',
                    min_gram: '2',
                    max_gram: '32',
                    token_chars: ['letter', 'digit']
                }
            }
        }
    }
};

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
				copy_to: ['search_suggest', 'typeahead']
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
						copy_to: ['search_suggest', 'typeahead']
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
								copy_to: [ 'search_suggest', 'typeahead' ]
							}
						}
					}
				}
			},	
			attribution: {
				type: 'string',
				index: 'not_analyzed',
				copy_to: [ 'search_suggest', 'typeahead' ]
			},
			thumbnail: {
				type: 'string',
				index: 'no'
			},
			search_suggest: {
				type: 'string'
			},
			typeahead: {
				type: 'string',
				index_analyzer: 'edge_analyzer',
                                search_analyzer: 'folding_analyzer',
                                include_in_all: false
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
			})
			.catch(function(error) {
				reject(new Error('Could not ping ES: ' + error.message));
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
			})
			.catch(function(error) {
				logger.warn('Error checking for index: ' + error.toString());
				reject(error);
			});
	});	
}

Indexer.prototype.createIndex = function(indexName) {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		self.getClient()
			.then(function(client) {
				client.indices.create({index: indexName, body: iiif_settings}, function(error, response) {
					if ( error ) {
						reject(error);
						return;
					}
					resolve(response);
				});
			})
			.catch(function(error) {
				logger.warn('Error creating index: ' + error.toString());
				reject(error);
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
			})
			.catch(function(error) {
				logger.warn('Error removing index: ' + error.toString());
				reject(error);
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
			})
			.catch(function(error) {
				logger.warn('Error creating alias: ' + error.toString());
				reject(error);
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
			})
			.catch(function(error) {
				logger.warn('Error checking alias: ' + error.toString());
				reject(error);
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
			})
			.catch(function(error) {
				logger.warn('Error creating mapping: ' + error.toString());
				reject(error);
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
			})
			.catch(function(error) {
				logger.warn('Error indexing document: ' + error.toString());
				reject(error);
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
			logger.debug('Using simple suggestion from advanced. Missing terms.');
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
						bool: {
							must: [
								{ 
									term: {
										typeahead: hint.value
									}
								},
								{
									terms: {
										search_suggest: hint.terms,
										execution: 'and',
										_cache: true
									}
								}
							]
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

		if ( hint.attribution ) {
			suggestQuery.query.filtered.filter.bool.must.push({ 
							term: {
								attribution: hint.attribution
							}
			});
		}

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
			})
			.catch(function(error) {
				logger.warn('Error fetching suggestions: ' + error.toString());
				reject(error);
			});

	});
}

Indexer.prototype.attributionsList = function() {

	var self = this;

	var query = { 
		aggs: { 
			attributions: { 
				terms: { field: 'attribution', size: 0 } 
			} 
		} 
	};

	return new Promise(function(resolve, reject) {
		self.getClient()
                        .then(function(client) {
				client.search({
					index: 'iiif-gallery',
					type: 'iiif_manifest',
					searchType: 'count',
					body: query
				}, function(error, results) {
					if (error) {
						return reject(error);
					}
					var attributions = [];
					if ( results && 
						results.aggregations && 
						results.aggregations.attributions &&
						results.aggregations.attributions.buckets ) {
						attributions = results.aggregations.attributions.buckets.map(function(bucket) {
							return { attribution: bucket.key, count: bucket.doc_count };
						});
					};
					logger.debug('Attributions results: ' + JSON.stringify(attributions));
					resolve(attributions);
				});
			})
			.catch(function(error) {
				reject(error);
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

		var suggestQuery = {
					query: {
						filtered: {
							filter: {
								term: {
									typeahead: hint.value
								}
							}
						}
					},
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
				};

		if ( hint.attribution ) {
			suggestQuery.query.filtered.filter = { 
				bool: {
					must: [
						{
							term: {
								typeahead: hint.value
							}
						},
						{
							term: {
								attribution: hint.attribution
							}
						}
					]
				}
			};
		}

		logger.debug('Suggest query: ' + JSON.stringify(suggestQuery, undefined, 4));

		self.getClient()
                        .then(function(client) {
				client.search({
					index: 'iiif-gallery',
					type: 'iiif_manifest',
					searchType: 'count',
					body: suggestQuery
				}, function(error, results) {
					if (error) {
						logger.warn('Error: ' + error.message);
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
			})
			.catch(function(error) {
				logger.warn('Error fetching suggestions: ' + error.toString());
				reject(error);
			});
	});
}

Indexer.prototype.search = function(query) {
	var self = this;
	
	return new Promise(function(resolve, reject) {

		var terms = query.terms;
		var attribution = query.attribution;
		var page_size = query.page_size ? query.page_size : 20;
		var from_page = query.from;

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

		if ( attribution ) {
			searchQuery.query.filtered.filter = {
				bool: {
					must: [
						{
							term: {
								attribution: attribution
							}
						},
						{
							terms: {                                                                                                                                  
								search_suggest: terms,                                                                                                            
								execution: 'fielddata'                                                                                                            
							}
						}
					]
				}
			};
		}

		if ( page_size ) {
			searchQuery.size = page_size;
		}

		if ( typeof from_page !== 'undefined' ) {
			searchQuery.from = from_page * page_size;
		}

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
					logger.debug('Search result: ' + JSON.stringify(results, undefined, 4));
					var hits = results.hits.hits;
					var sources = hits.map(function(hit) {
						var source = hit['_source'];
						source.score = hit._score;
						return source;
					});
					resolve({ total: results.hits.total, results: sources});
				});
			})
			.catch(function(error) {
				logger.warn('Error executing query: ' + error.toString());
				reject(error);
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
