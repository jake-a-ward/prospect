# prospect: a simple Angular dynamic view library

prospect makes it easy to define views on your page that will listen for changes to the URL fragment and update the view accordingly.

Here is how to declare the configuration for a view:
~~~~
// add a dependency on prospect
var myApp = angular.module('myApp', ['prospect']);

// inject 'prospectViewsProvider'
myApp.config(['prospectViewsProvider', function (prospectViewsProvider) {
		// use the 'view' function to define a named view
		prospectViewsProvider.view('myView', {
			// a view's 'render' function needs to return an object with the properties controller and templateUrl
			// that will be used on the element rendering the view
			render: function (path, params) {
				// this function can be used to dynamically change the view based on the URL path and parameters
				return {
					controller: 'exampleCtrl',
					templateUrl: 'example1.tmpl.html'
				};
			}
		});
	}]);
~~~~

To use the view in your HTML files, use the 'prospect-view' directive and supply the name parameter to indicate which configured view to use:
~~~~
<div prospect-view name="myView" />
~~~~

In your controller, you can change the URL however you want, and the view will update automatically. One way would be to use $location:
~~~~
$location.path('/subview');
$location.search('param', 12345);
~~~~

The controller will be instantiated whenever the 'render' function has changed either controller or templateUrl. 
To receive notifications in your view controller when the URL changes, add a function named 'handleProspectStateChange' to your controllers scope:
~~~~
myapp.controller('exampleCtrl', function($scope) {
	// code that will be executed when the view is newly rendered

	$scope.handleProspectStateChange = function() {
		// code that will be executed when the view has already been rendered, but the path or params have changed
		// do whatever you need to do based on the change in path or parameters
		// e.g. reload data, show something different, or do nothing
	};
});
~~~~

## TODO
- controllerAs support
- state configuration with path parameters