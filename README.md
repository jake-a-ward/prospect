# prospect: a simple Angular dynamic view library

Prospect makes it easy to define multiple views on your page that will listen for changes to the URL fragment and update the view accordingly. It also allows you to create path templates that make it easy to navigate between URL paths.

## Adding the dependency
```javascript
// add a dependency on prospect
var myApp = angular.module('myApp', ['prospect']);
```

## Views
One goal of prospect is to re-render your views as FEW times as possible, because re-rendering will cause your application to be slow and give the user a poor user experience.

Here is how to declare the configuration for a view:
```javascript
myApp.config(['prospectViewsProvider', function (prospectViewsProvider) {
		
		// define a named view
		prospectViewsProvider.view('myView', {
			
			// define a 'render' function that can dynamically return a controller and template
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

The 'render' function can be used to dynamically swap the controller, controllerAs, or templateUrl.

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

Using prospect views, you can create applications that:
* have multiple dynamic views on a page
* seamlessly render the views that need to be updated without needing to render the entire application
* use URL fragment history to record user actions and give users a seamless back/forward experience

## Paths

Prospect also makes it easy to define paths for your application, complete with path variables.

Here is how to declare the configuration for a path template:
```javascript
myApp.config(['prospectPathsProvider', function (prospectPathsProvider) {
		prospectPathsProvider.template('myPath', '/myPath/:q/detail');
	}]);
```
Path templates can contain constant values and variables (prefixed with ':').

## Managing State
Prospect also makes it easy to transition to new URL locations using 'prospectState'.

```javascript
myApp.controller('exampleCtrl', ['prospectState',
	function (prospectState) {
		// executing the following
		prospectState.go('myPath', {q: 'hello'}, {abc: 7});
		// will transition the application to:
		// #/myPath/hello/detail?abc=7
	}]);
```

You might also be asking yourself, 'what is the "urlState" parameter of the render and handleProspectStateChange functions and how does it help me?'.

Prospect will parse the URL every time that it changes and attempt to match it up to a predefined path template. If it can match your predefined path, it will pass these functions a 'urlState' object with the following properties:
* path
* pathName
* pathArgs
* params

For instance, in the example above the 'urlState' would be:
```json
{
	"path": "/myPath/hello/detail",
	"pathName": "myPath",
	"pathArgs": {"q": "hello"},
	"params": {"abc": "7"}
}
```

## TODO
- finish examples and README for path template examples
- add resolve support to views
- add support for prospectState.href
- add href directive