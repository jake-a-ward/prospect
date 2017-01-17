# prospect: a simple Angular dynamic view library

Prospect makes it easy to define multiple views on your page that will listen for changes to the URL fragment and update the view accordingly. It also allows you to create path templates that make it easy to navigate between URL paths.

## Install and Dependency
```
npm install --save https://github.com/jacob-alan-ward/prospect
```

```javascript
// add a dependency on prospect
var myApp = angular.module('myApp', ['prospect']);
```

## Paths
Prospect allows developers to create a set of path templates that will be used in an application and makes it easy to navigate between different paths.

Here is how to declare the configuration for a path template:
```javascript
myApp.config(['prospectPathsProvider', function (prospectPathsProvider) {
		prospectPathsProvider.template('myPath', '/myPath/:q/detail');
	}]);
```
Path templates can contain constant values and variables (prefixed with ':').

## Views
Prospect allows developers to create dynamic views that can be "switched out on the page". Prospect will re-render views as FEW times as possible, because re-rendering will cause your application to be slow and give the user a poor user experience. Prospect gives you tools to handle state changes gracefully in your views.

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
<div prospect-view="myView" />
```

The controller will be instantiated whenever the 'render' function has changed either the controller, controllerAs, or templateUrl. 
To receive notifications in your view controller when the URL changes but the controller, controllerAs, and templateUrl have not changed, add a function named 'handleProspectStateChange' to your controller:
```javascript
myapp.controller('exampleCtrl', function() {
	// code that will be executed when the view is newly rendered

	// code that will be executed when the view has already been rendered, but the path or params have changed
	this.handleProspectStateChange = function(urlState) {
		// do whatever you need to do based on the change in path or parameters
		// e.g. reload data, show something different, or do nothing
	};
});
```

Using prospect views, you can create applications that:
* have multiple dynamic views on a page
* seamlessly render the views that need to be updated without needing to render the entire application
* use URL fragment history to record user actions and give users a seamless back/forward experience


## Managing State

### Transitioning State
Prospect also makes it easy to transition to new URL locations using 'prospectState'. Given the 'Paths' example above, the following:
```javascript
myApp.controller('exampleCtrl', ['prospectState',
	function (prospectState) {
		prospectState.go('myPath', {q: 'hello'}, {abc: 7});
	}]);
```
Will transition the application to: #/myPath/hello/detail?abc=7

### URL State
The view 'render' function and the controller 'handleProspectStateChange' function both receive a 'urlState' object.
Prospect will parse the URL every time that a URL change occurs and it will attempt to match it up to a predefined path template. If it can match your predefined path, it will pass these functions a 'urlState' object with the following properties based on the URL:
* path
* pathName
* pathArgs
* params

For instance, in the 'Transitioning State' example above the 'urlState' would be:
```json
{
	"path": "/myPath/hello/detail",
	"pathName": "myPath",
	"pathArgs": {"q": "hello"},
	"params": {"abc": "7"}
}
```