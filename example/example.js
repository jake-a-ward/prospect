
var myApp = angular.module('exampleApp', ['prospect']);

myApp.config(['prospectViewsProvider', function (prospectViewsProvider) {

		prospectViewsProvider.view('view1', {
			render: function (path, params) {
				// a view's 'render' function needs to return an object with a controller and templateUrl
				// that will be used on the element rendering the view
				return {
					controller: 'exampleCtrl',
					controllerAs: 'exampleCtrl',
					templateUrl: 'example1.tmpl.html'
				};
			}
		});

		prospectViewsProvider.view('view2', {
			render: function (path, params) {
				// conditional logic can be used to determine which controller and templateUrl to render
				return {
					controller: 'exampleCtrl',
					controllerAs: 'exampleCtrl',
					templateUrl: (params.a == 999 ? 'example1.tmpl.html' : 'example2.tmpl.html')
				};
			}
		});
	}]);


myApp.controller('exampleCtrl', ['$location',
	function ($location) {

		this.x = Math.random();

		this.foobar = function () {
			$location.search('a', 999);
			$location.path('/example');
		};

		this.handleProspectStateChange = function (path, params) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);