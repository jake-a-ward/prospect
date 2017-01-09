
var myApp = angular.module('nestedExampleApp', ['prospect']);

myApp.config(['prospectViewsProvider', function (prospectViewsProvider) {

		prospectViewsProvider.view('mainView', {
			render: function (path, params) {
				return {
					controller: 'mainCtrl',
					controllerAs: 'mainCtrl',
					templateUrl: 'main.tmpl.html'
				};
			}
		});

		prospectViewsProvider.view('nestedView', {
			render: function (path, params) {
				return {
					controller: 'nestedCtrl',
					controllerAs: 'nestedCtrl',
					templateUrl: 'nested.tmpl.html'
				};
			}
		});

		prospectViewsProvider.view('doublyNestedView', {
			render: function (path, params) {
				return {
					controller: 'doublyNestedCtrl',
					controllerAs: 'doublyNestedCtrl',
					templateUrl: 'doublyNested.tmpl.html'
				};
			}
		});
	}]);


myApp.controller('mainCtrl', [function () {

		this.x = Math.random();

		this.handleProspectStateChange = function (path, params) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);

myApp.controller('nestedCtrl', [function () {

		this.y = Math.random();

		this.handleProspectStateChange = function (path, params) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);

myApp.controller('doublyNestedCtrl', [function () {

		this.z = Math.random();

		this.handleProspectStateChange = function (path, params) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);