# prospect: a simple Angular dynamic view library

## prospect makes it easy to define views on your page that will listen for changes to the URL fragment and update the view accordingly. It also allows you to create path templates that make it easy to navigate between URL paths.

### Views

The goal of prospect is to re-render your controllers and templates as FEW times as possible, because re-rendering will cause your application to be slow and give the user a poor user experience.

Here is how to declare the configuration for a view:
```javascript
// add a dependency on prospect
var myApp = angular.module('myApp', ['prospect']);

myApp.config(['prospectViewsProvider', function (prospectViewsProvider) {
		
		// use the 'view' function to define a named view
		prospectViewsProvider.view('myView', {
			
			// a view's 'render' function needs to return an object with the properties controller, templateUrl, and controllerAs (optional)
			// that will be used on the element rendering the view
			render: function (urlState) {
				return {
					controller: 'exampleCtrl',
					controllerAs: 'exampleCtrl',
					templateUrl: 'example1.tmpl.html'
				};
			}
		});
	}]);
```

The 'render' function can be used to dynamically swap the controller and/or template.

To use the view in your HTML files, use the 'prospect-view' directive and supply the name parameter to indicate which configured view to use:
```html
<div prospect-view name="myView" />
```

The controller will be instantiated whenever the 'render' function has changed either the controller, controllerAs, or templateUrl. 
To receive notifications in your view controller when the URL changes, add a function named 'handleProspectStateChange' to your controller:
```javascript
myapp.controller('exampleCtrl', function() {
	// code that will be executed when the view is newly rendered

	this.handleProspectStateChange = function(urlState) {
		// code that will be executed when the view has already been rendered, but the path or params have changed
		// do whatever you need to do based on the change in path or parameters
		// e.g. reload data, show something different, or do nothing
	};
});
```

## Paths



## TODO
- finish examples and README for path template examples
- add resolve support to views
- add support for prospectState.href
- add href directive