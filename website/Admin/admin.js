(function(){
	
/*** Globals ***/
var apiendpoint = "https://su2wwwksy0.execute-api.us-east-1.amazonaws.com/prod"; //Enter API gateway in here. Should be done automatically.

var app = angular.module('KitsuiDashboard', ['ngRoute'])
	.config(function($locationProvider, $routeProvider, $httpProvider) {
		
		//Testing cookie sending
		$httpProvider.defaults.withCredentials = true;
		
		//Post routing
		$routeProvider.when('/post/add', {
           templateUrl: 'form-template.html', 
           controller: 'AddPostController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/post/edit/:postid', {
           templateUrl: 'form-template.html', 
           controller: 'EditPostController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/post/list/:current_page', {
           templateUrl: 'table-template.html', 
           controller: 'ListPostsController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/post/delete/:postid', {
           templateUrl: 'form-template.html', 
           controller: 'DeletePostController',
		   controllerAs: 'ctrl'
        });
		
		//Page routing
		$routeProvider.when('/page/add', {
           templateUrl: 'form-template.html', 
           controller: 'AddPageController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/page/edit/:pageid', {
           templateUrl: 'form-template.html', 
           controller: 'EditPageController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/page/list/:current_page', {
           templateUrl: 'table-template.html', 
           controller: 'ListPostsController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/page/delete/:pageid', {
           templateUrl: 'form-template.html', 
           controller: 'DeletePageController',
		   controllerAs: 'ctrl'
        });
		
		//User routing
		$routeProvider.when('/user/add', {
           templateUrl: 'form-template.html', 
           controller: 'AddUserController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/user/edit/:userid', {
           templateUrl: 'form-template.html', 
           controller: 'EditUserController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/user/list/:current_page', {
           templateUrl: 'table-template.html', 
           controller: 'ListUsersController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/user/delete/:userid', {
           templateUrl: 'form-template.html', 
           controller: 'DeleteUserController',
		   controllerAs: 'ctrl'
        });
		
		//Roles routing
		$routeProvider.when('/role/add', {
           templateUrl: 'form-template.html', 
           controller: 'AddRoleController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/role/edit/:roleid', {
           templateUrl: 'form-template.html', 
           controller: 'EditRoleController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/role/list/:current_page', {
           templateUrl: 'table-template.html', 
           controller: 'ListRolesController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/role/delete/:pageid', {
           templateUrl: 'form-template.html', 
           controller: 'DeleteRoleController',
		   controllerAs: 'ctrl'
        });
		
		//Other
		$routeProvider.when('/navigation', {
           templateUrl: 'form-template.html', 
           controller: 'NavbarSettingsController',
		   controllerAs: 'ctrl'
        });
		$routeProvider.when('/settings', {
           templateUrl: 'form-template.html', 
           controller: 'SiteSettingsController',
		   controllerAs: 'ctrl'
        });
		

        //$routeProvider.otherwise({redirectTo: '/home', controller: HomeCtrl});
     });


/*** Maps URLs to controllers ***/










/*** Controllers Below Here ***/

/* Post Controllers */

//Handles adding a post.
app.controller('AddPostController', ['$http', function($http){
	//var controller = this; //Needed to pass this object into the below function
	this.page_title = "Add Post";
	this.inputs =[
		{
			"type": "text",
			"title": "Title",
			"prefill": "My Adventures In Knitting"
		},
		{
			"type": "mce",
			"title": "Content"
		}
	];
	
	
	/*
	this.submit() = function(){
		$http.post(apiendpoint, {
			
		}
		).then(function(response){
			
			
		});
	}*/
	//console.log(controller.response); //Log the controller for debugging.

} ]);

app.filter('html', function($sce) { return $sce.trustAsHtml; });












//Handles editing a post
app.controller('EditPostController', ['$http', '$routeParams', function($http, $routeParams){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
			"request": "getBlog",
			"blogID": $routeParams.postid
		}).then(function(response) {
		//Transform the data as necessary.
        
		controller.inputs =[
			{
				"type": "text",
				"title": "Title",
				"prefill": "My Adventures In Knitting",
				"value": response.data.data.Title.S
			},
			{
				"type": "mce",
				"title": "Content",
				"value": response.data.data.Content.S
			}
		];
		
		
		
		//controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(response.data); //Log the controller for debugging.
    });
} ]);











//Handles listing all posts.
app.controller('ListPostsController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
			"request": "getAllBlogs"
		}).then(function(response) {
		//Transform the data as necessary.
        
		//Push the table information from the response into the controller.
		controller.cols = ['Title', 'Content', 'Author', 'Delete'];
		
		controller.rows = [];
		
		for (i = 0; i < response.data.data.length; ++i){
			controller.rows.push(
				{
					"Title": "<a href=\"#/post/edit/"+response.data.data[i].ID.S+"\">"+response.data.data[i].Title.S+"</a>",
					"Content": response.data.data[i].Content.S,
					"Author":response.data.data[i].Author.S,
					"Delete":"<a class=\"text-danger\" href=\"#/post/delete/"+response.data.data[i].ID.S+"\">Delete "+response.data.data[i].Title.S+"</a>"
				}
			);
		}
		
		console.log(response); //Log the controller for debugging.
    });
} ]);










//Handles deleting a post
app.controller('DeletePostController', ['$http', '$routeParams', function($http, $routeParams){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
		"request": "getBlog",
		"blogID": $routeParams.postid
	}).then(function(response) {
		//Transform the data as necessary.
        controller.page_title = "Are you sure you want to delete this post?";
		controller.inputs =[
			{
				"type": "text",
				"disabled": true,
				"title": "Title",
				"prefill": "My Adventures In Knitting",
				"value": response.data.data.Title.S
			},
			{
				"type": "mce",
				"disabled": true,
				"title": "Content",
				"value": response.data.data.Content.S
			}
		];
    });
	this.submit = function(){
		$http.post(apiendpoint, {
			//An object to post to API goes here.
			"request": "deleteBlog",
			"blogID": $routeParams.postid
		}).then(function(response){
			alert("Post was deleted.");
			window.location = "#/post/list/0";
		});
	};
} ]);































































/* Page Controllers */


//Handles adding a page
app.controller('AddPageController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles editing page
app.controller('EditPageController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles listing pages
app.controller('ListPagesController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles deleting a page
app.controller('DeletePageController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);


/* User controllers */


//Handles adding a user
app.controller('AddUserController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles editing user
app.controller('EditUserController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles listing users
app.controller('ListUsersController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles deleting a user
app.controller('DeleteUserController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);


/* User controllers */


//Handles adding a role
app.controller('AddRoleController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles editing role
app.controller('EditRoleController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles listing roles
app.controller('ListRolesController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles deleting a role
app.controller('DeleteRoleController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);



/* Other Controllers */

//Handles showing / editing navbar items
app.controller('NavbarSettingsController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);

//Handles showing / editing site settings
app.controller('SiteSettingsController', ['$http', function($http){
	var controller = this; //Needed to pass this object into the below function
	$http.post(apiendpoint, {
		//An object to post to API goes here.
	}).then(function(response) {
		//Transform the data as necessary.
        
		controller.response = response.data; //Push the data from the API response into the "response" array of this controller
		
		console.log(controller.response); //Log the controller for debugging.
    });
} ]);


})();
