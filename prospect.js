var prospect = angular.module('prospect', []);

prospect.provider('prospectPaths', [function () {
		var pathTemplates = {};

		/*
		 * Add a path template.
		 */
		this.path = function (name, pathTemplate) {
			// /abc/:param1/:param2
			var parts = pathTemplate.split(/\//g);

			pathTemplates[name] = {
				template: pathTemplate,
				apply: function (args) {
					// TODO
					// use args to create the path
				}
			};
		};

		this.$get = [function () {
				return {
					getPathTemplate: function (name) {
						var pathTemplate = pathTemplates[name];
						if (pathTemplate === undefined) {
							throw new Error('Unable to find prospect path template with name: ' + name);
						}
						return pathTemplate;
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
							throw new Error('Unable to find prospect view with name: ' + name);
						}
						return view;
					}
				};
			}];
	}]);

/**
 * Internal service used to communicate events.
 */
prospect.service('$$prospectEvents', [function () {
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
			urlListeners.forEach(function (listener) {
				listener(path, params);
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

prospect.service('prospectState', ['$location', function ($location) {
		this.go = function (pathName, pathArgs, params) {
			// TODO path
			$location.path('/');

			for (var param in params) {
				if (params.hasOwnProperty(param)) {
					$location.search(param, params[param]);
				}
			}
		};
	}]);

prospect.directive('prospectView', ['$compile', '$rootScope', '$controller', '$sce', '$templateRequest', '$location', '$$prospectEvents', 'prospectViews',
	function ($compile, $rootScope, $controller, $sce, $templateRequest, $location, $$prospectEvents, prospectViews) {

		function handleView(scope, element, path, params) {
			var viewConfiguration = prospectViews.getView(scope.name);

			var renderResult = viewConfiguration.render(path, params);

			if (renderResult.templateUrl === scope.currentTemplateUrl &&
					renderResult.controller === scope.currentController &&
					renderResult.controllerAs === scope.currentControllerAs) {
				// notify the current controller that there was a change
				if (scope.currentControllerInstance.handleProspectStateChange) {
					scope.currentControllerInstance.handleProspectStateChange(path, params);
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
				handleView(scope, element, $location.path(), $location.search());

				// listen for URL changes to make updates to the view
				$$prospectEvents.addUrlListener(function (path, params) {
					handleView(scope, element, path, params);
				});
			}
		};
	}]);

