
var myApp = angular.module('nestedExampleApp', ['prospect']);

myApp.config(['prospectPathsProvider', 'prospectViewsProvider', function (prospectPathsProvider, prospectViewsProvider) {

		prospectPathsProvider.template('root', '/');

		prospectViewsProvider.view('mainView', {
			render: function (urlState) {
				return {
					controller: 'mainCtrl',
					controllerAs: 'mainCtrl',
					templateUrl: 'main.tmpl.html'
				};
			}
		});

		prospectViewsProvider.view('nestedView', {
			render: function (urlState) {
				return {
					controller: 'nestedCtrl',
					controllerAs: 'nestedCtrl',
					templateUrl: 'nested.tmpl.html'
				};
			}
		});

		prospectViewsProvider.view('doublyNestedView', {
			render: function (urlState) {
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

		this.handleProspectStateChange = function (urlState) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);

myApp.controller('nestedCtrl', [function () {

		this.y = Math.random();

		this.handleProspectStateChange = function (urlState) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);

myApp.controller('doublyNestedCtrl', [function () {

		this.z = Math.random();

		this.handleProspectStateChange = function (urlState) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);