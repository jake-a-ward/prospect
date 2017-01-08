
var myApp = angular.module('exampleApp', ['prospect']);

myApp.config(['prospectViewsProvider', function (prospectViewsProvider) {

		prospectViewsProvider.view('view1', {
			render: function (path, params) {
				return {
					controller: 'exampleCtrl',
					templateUrl: 'example1.tmpl.html'
				};
			}
		});

		prospectViewsProvider.view('view2', {
			render: function (path, params) {
				return {
					controller: 'exampleCtrl',
					templateUrl: (params.a == 999 ? 'example1.tmpl.html' : 'example2.tmpl.html')
				};
			}
		});
	}]);


myApp.controller('exampleCtrl', ['$scope', '$location',
	function ($scope, $location) {
		$scope.x = 'abcdefg';

		$scope.foobar = function () {
			$location.search('a', 999);
			$location.path('/example');
		};

		$scope.handleStateChange = function () {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);