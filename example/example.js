
var myApp = angular.module('exampleApp', ['prospect']);

myApp.config(['prospectPathsProvider', 'prospectViewsProvider', function (prospectPathsProvider, prospectViewsProvider) {

		prospectPathsProvider.template('root', '/');
		prospectPathsProvider.template('abc', '/abc/:q/123');
		prospectPathsProvider.template('xyz', '/xyz/:q/:r');

		prospectViewsProvider.view('view1', {
			render: function (urlState) {
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
			render: function (urlState) {
				// conditional logic can be used to determine which controller and templateUrl to render
				return {
					controller: 'exampleCtrl',
					controllerAs: 'exampleCtrl',
					templateUrl: (urlState.params.a == 999 ? 'example1.tmpl.html' : 'example2.tmpl.html')
				};
			}
		});
	}]);


myApp.controller('exampleCtrl', ['prospectState',
	function (prospectState) {

		this.x = Math.random();

		this.foobar = function () {
			if (Math.random() > 0.5) {
				prospectState.go('xyz', {q: 'hello', r: 'world'}, {a: 7});
			} else {
				prospectState.go('abc', {q: 'hello'}, {a: 7});
			}
		};

		this.handleProspectStateChange = function (urlState) {
			// instead of reloading the entire controller
			// this function is called instead
		};
	}]);