'use strict';
var scripts = document.getElementsByTagName('script');
var typeaheadDirectivePath = scripts[scripts.length-1].src;
var typeaheadDirectiveTpl = typeaheadDirectivePath.replace(/\.js/, '.html');

/** My JSFiddle to play with this: https://jsfiddle.net/d8cu5acf/ **/

/**
 * @ngdoc directive
 * @name showcaseClientApp.directive:typeahead
 * @description
 * # typeahead
 */
angular.module('showcaseClientApp')
  .directive('typeahead', function() {
    return {
      restrict: 'E',
      replace: 'true',
      scope: {
	suggester: '=',
	attribution: '=',
	terms: '='
      },
      templateUrl: typeaheadDirectiveTpl,
        link: function(scope, elem, attrs) {
	  var keyProcess;
          scope.suggestions = [];
          scope.chosen = '';
          scope.terms = [];
          scope.selected = 0;
          elem.bind('keydown', 
          function(evt)     {
              // console.log(evt);
              var processed = false;
	      if ( keyProcess ) {
		  clearTimeout(keyProcess);
	      }
              if ( evt.keyCode === 40 && scope.suggestions.length>0 ) {
                  if ( scope.selected === scope.suggestions.length - 1 ) {
                        scope.selected = 0;
                  } else {
                      scope.selected++;
                  }
                  evt.preventDefault();
                  processed = true;
              }
              
              if ( evt.keyCode === 38 && scope.suggestions.length>0 ) {
                  if ( scope.selected === 0 ) {
                        scope.selected = scope.suggestions.length - 1 ;
                  } else {
                      scope.selected--;
                  }
                  evt.preventDefault();
                  processed = true;
              }
              
              if (  evt.keyCode === 13 || evt.keyCode === 9 ) {
                  if ( scope.suggestions.length>0 ) {
                      scope.terms.push(scope.suggestions[scope.selected]);
                      elem.find('input')[0].value = scope.terms.join(' ') + ' ';
                      scope.suggestions = [];
                      evt.preventDefault();
                      processed = true;
                  } else {
                      processed = true;
                  }
              }
              
              if (  evt.keyCode === 8 ) {
                  scope.terms = elem.find('input')[0].value.toLowerCase().split(/\s/).slice(0, -1);
              }
              
              if (  evt.keyCode === 32 ) {
		  scope.suggestions = [];
                  scope.terms = elem.find('input')[0].value.toLowerCase().split(/\s/);
		  processed = true;
              }
              
              if (!processed) {
                  var value = elem.find('input')[0].value;
                  if ( evt.keyCode !== 8 ) {
                      value += String.fromCharCode(evt.keyCode);
                  } else {
                      value = value.slice(0, - 1);
                  }
		  scope.selected = 0;
		  if (value.length > 0 ) {
			  keyProcess = setTimeout(function() {
				  scope.suggester.suggest(scope.terms, value.toLowerCase(), scope.attribution)
					.then(function(suggestions) {
						scope.suggestions = suggestions;
					});
			  }, 200);
		  } else {
			  scope.suggestions = [];
		  }
              }
              scope.$apply();
          });
      }
    };
});

