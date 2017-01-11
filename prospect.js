var prospect = angular.module('prospect', []);

prospect.provider('prospectPaths', [function () {
		var pathTemplates = {};

		/*
		 * Add a path template.
		 */
		this.template = function (name, pathTemplate) {
			var parts = splitPath(pathTemplate);

			pathTemplates[name] = {
				template: pathTemplate,
				parts: parts
			};
		};

		/*
		 * Split a path or path template into parts separated by a /.
		 */
		function splitPath(path) {
			var strParts = path.split(/\//g);
			if (!strParts[0]) {
				strParts.splice(0, 1);
			}
			if (!strParts[strParts.length - 1]) {
				strParts.splice(strParts.length - 1, 1);
			}
			return strParts;
		}

		function partIsVariable(part) {
			return part.startsWith(':');
		}

		function extractVariableName(part) {
			return part.substring(1);
		}

		/*
		 * Convert a path template name and arguments into a path.
		 * 
		 * Example:
		 * If a path template named 'abc' were configured with the template '/abc/:a'
		 * Then apply('abc', {a: 9}) would produce '/abc/9'
		 */
		function apply(name, args) {
			var pathTemplate = pathTemplates[name];
			if (pathTemplate === undefined) {
				throw new Error('Unable to find prospect path template with name "' + name + '"');
			}

			var assembledPath = '/';

			var parts = pathTemplate.parts;
			var first = true;
			parts.forEach(function (part) {
				if (!first) {
					assembledPath += '/';
				}

				var val;
				if (partIsVariable(part)) {
					// extract the value of the variable from the arguments object
					val = args[extractVariableName(part)];
					if (val === undefined) {
						throw new Error('Unable to find prospect path template argument "' + part + '" for path template with name "' + name + '"');
					}
				} else {
					// constant value
					val = part;
				}

				assembledPath += encodeURIComponent(val);

				first = false;
			});

			return assembledPath;
		}

		/*
		 * Parse a path into a single configured path template.
		 * 
		 * An error is thrown if 0 or more than one path templates match the path.
		 */
		function parse(path) {
			var matched = [];
			for (var name in pathTemplates) {
				if (pathTemplates.hasOwnProperty(name)) {
					var pathTemplate = pathTemplates[name];
					var matchedArgs = matchAndExtract(path, pathTemplate);
					if (matchedArgs) {
						matched.push({
							name: name,
							args: matchedArgs
						});
					}
				}
			}

			if (matched.length === 0) {
				throw new Error('Path "' + path + '" did not match any prospect paths');
			}

			if (matched.length > 1) {
				throw new Error('Path "' + path + '" matched more than one prospect path template: ' + matched.map(function (match) {
					return match.name;
				}).join(', '));
			}

			return matched[0];
		}

		/*
		 * Determine if a path matches a single path template.
		 * 
		 * If so, the matched argument values are returned.
		 * If not, then false is returned.
		 */
		function matchAndExtract(path, pathTemplate) {
			var templateParts = pathTemplate.parts;

			var pathParts = splitPath(path);
			if (pathParts.length !== templateParts.length) {
				return false;
			}

			var args = {};

			for (var i = 0; i < pathParts.length; i++) {
				var pathPart = pathParts[i];
				var templatePart = templateParts[i];

				if (partIsVariable(templatePart)) {
					// variable in the template
					args[extractVariableName(templatePart)] = pathPart;
				} else {
					// constant value in the template
					if (pathPart !== templatePart) {
						return false;
					}
				}
			}

			return args;

		}

		this.$get = [function () {
				return {
					/*
					 * Parse a path into a named path.
					 */
					parse: function (path) {
						return parse(path);
					},
					apply: function (name, args) {
						return apply(name, args);
					}
				};
			}];
	}]);

prospect.provider('prospectViews', [function () {
		var views = {};

		/*
		 * Add a view configuration.
		 */
		this.view = function (name, configuration) {
			views[name] = configuration;
		};

		this.$get = [function () {
				return {
					/**
					 * Lookup a view configuration based on name.
					 */
					getView: function (name) {
						var view = views[name];
						if (view === undefined) {
							throw new Error('Unable to find prospect view with name "' + name + '"');
						}
						return view;
					}
				};
			}];
	}]);


/**
 * Internal service used to parse URL states.
 * 
 * Example:
 * If a preconfigured path template named 'xyx' had the template '/xyz/:x'
 * A URL of '/xyz/12345?a=8' would have a URL state of:
 * {
 *		path: '/xyz/12345',
 *		pathName: 'xyz',
 *		pathArgs: {x: 12345},
 *		params: {a: 8}
 * }
 */
prospect.service('$$prospectUrlState', ['$location', 'prospectPaths',
	function ($location, prospectPaths) {

		/*
		 * Get the current URL state.
		 */
		this.getCurrentUrlState = function () {
			return this.parseUrlState($location.path(), $location.search());
		}.bind(this);

		/*
		 * Parse the current URL state.
		 */
		this.parseUrlState = function (path, params) {
			var match = prospectPaths.parse(path);

			return {
				path: path,
				pathName: match.name,
				pathArgs: match.args,
				params: params
			};
		};
	}]);

/**
 * Internal service used to communicate events.
 */
prospect.service('$$prospectEvents', ['$$prospectUrlState', function ($$prospectUrlState) {
		var urlListeners = [];

		/*
		 * Add listener to be notified when the URL change has occurred.
		 */
		this.addUrlListener = function (listener) {
			urlListeners.push(listener);
		};

		/*
		 * Notify every listener that a URL change has occurred.
		 */
		this.notifyUrlListeners = function (path, params) {
			var urlState = $$prospectUrlState.parseUrlState(path, params);

			urlListeners.forEach(function (listener) {
				listener(urlState);
			});
		};
	}]);


prospect.run(['$location', '$rootScope', '$$prospectEvents',
	function ($location, $rootScope, $$prospectEvents) {
		/*
		 * Listen for URL changes and notify all listeners.
		 */
		$rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl, newState, oldState) {
			$$prospectEvents.notifyUrlListeners($location.path(), $location.search());
		});
	}]);

prospect.service('prospectState', ['$location', 'prospectPaths',
	function ($location, prospectPaths) {
		this.go = function (pathName, pathArgs, params) {

			var path = prospectPaths.apply(pathName, pathArgs);
			$location.path(path);

			if (params) {
				for (var param in params) {
					if (params.hasOwnProperty(param)) {
						$location.search(param, params[param]);
					}
				}
			}
		};

		/*
		 * Create a full URL link
		 */
		this.href = function (pathName, pathArgs, params) {
			// TODO
		};
	}]);

prospect.directive('prospectView', ['$compile', '$rootScope', '$controller', '$sce', '$templateRequest', '$$prospectEvents', '$$prospectUrlState', 'prospectViews',
	function ($compile, $rootScope, $controller, $sce, $templateRequest, $$prospectEvents, $$prospectUrlState, prospectViews) {

		function handleView(scope, element, urlState) {
			var viewConfiguration = prospectViews.getView(scope.name);

			var renderResult = viewConfiguration.render(urlState);

			if (renderResult.templateUrl === scope.currentTemplateUrl &&
					renderResult.controller === scope.currentController &&
					renderResult.controllerAs === scope.currentControllerAs) {
				// notify the current controller that there was a change
				if (scope.currentControllerInstance.handleProspectStateChange) {
					scope.currentControllerInstance.handleProspectStateChange(urlState);
				}
			} else {
				// re-render everything
				renderView(element, renderResult.templateUrl, renderResult.controller, renderResult.controllerAs).then(function (controllerInstance) {
					scope.currentTemplateUrl = renderResult.templateUrl;
					scope.currentController = renderResult.controller;
					scope.currentControllerAs = renderResult.controllerAs;
					scope.currentControllerInstance = controllerInstance;
				});
			}
		}

		/*
		 * Render a new template and controller on the specified element.
		 */
		function renderView(element, templateUrl, controller, controllerAs) {
			templateUrl = $sce.getTrustedResourceUrl(templateUrl);

			return $templateRequest(templateUrl).then(function (template) {
				var viewScope = $rootScope.$new();

				var controllerInstance = $controller(controller, {
					$scope: viewScope
				});

				if (controllerAs !== undefined) {
					viewScope[controllerAs] = controllerInstance;
				}

				element.html(template);
				$compile(element.contents())(viewScope);

				return controllerInstance;
			}, function (err) {
				throw new Error("Error loading prospect template: " + templateUrl);
			});
		}

		return {
			replace: false,
			restrict: 'EA',
			scope: {
				// the name of the preconfigured view that will manage this element
				name: '@'
			},
			link: function (scope, element, attrs) {
				// initial draw of the view
				handleView(scope, element, $$prospectUrlState.getCurrentUrlState());

				// listen for URL changes to make updates to the view
				$$prospectEvents.addUrlListener(function (urlState) {
					handleView(scope, element, urlState);
				});
			}
		};
	}]);

