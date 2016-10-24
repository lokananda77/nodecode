
(function(){

angular
  .module("famersBlockchainApp", [
    "ui.router",
    "toaster",
    "ngMaterial",
    "ngStorage",
    "ui.tree",
    "ngTable",
    "ngSanitize",
    "ngCsv",
    "angular-confirm",
    "sticky",
    "fsm",
    "angular.filter",
    "ui.bootstrap.contextMenu",
    "ui.bootstrap",
    "famersBlockchainApp.Tabs",   
    "famersBlockchainApp.DisplayError",    
    "famersBlockchainApp.Login",
    "famersBlockchainApp.Logout",
    "famersBlockchainApp.Admin"
  ], function($rootScopeProvider){
	  $rootScopeProvider.digestTtl(100);
  })
  .constant('_', window._)
  .config(['$urlRouterProvider', '$stateProvider','$httpProvider',function($urlRouterProvider, $stateProvider,$httpProvider) {
	$httpProvider.interceptors.push('ErrorHandler');
	$httpProvider.interceptors.push('TokenRefreshInterceptor');
    $urlRouterProvider.otherwise('/');
    $stateProvider
    .state('error', {
        url: '/error',
        templateUrl: 'scripts/error/view/error.html',
        controller: 'ErrorCtrl as vm',
        params:{
        	error:null
        },
        resolve:{
        	error: function($stateParams) {
        		console.log($stateParams.error);
        			return $stateParams.error;
				}
        }
      });
  }])
  .run(configureDefaults)
  .provider({
  })
  .service(service)
  .factory('TokenRefreshInterceptor',TokenRefreshInterceptor)
  .factory('ErrorHandler',ErrorHandler)
  .decorator('$mdAria', function mdAriaDecorator($delegate) {
    $delegate.expect = angular.noop;
    $delegate.expectAsync = angular.noop;
    $delegate.expectWithText = angular.noop;
    return $delegate;
  });	

   configureDefaults.$inject = ['ngTableDefaults','$state', '$rootScope','AuthenticationService', 'dataBeanService','$window','$sessionStorage'];
   function configureDefaults(ngTableDefaults,$state,$rootScope,AuthenticationService, dataBeanService,$window,$sessionStorage) {
	   	$rootScope._ = window._; 
	   	ngTableDefaults.params.count = 5;
        ngTableDefaults.settings.counts = [];
        $rootScope.isReadOnly = false; 
        
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        	  event.preventDefault();
        	  $state.get('error').error = { code: 123, description: 'Exception stack trace' };
        	  $state.get('displayError').error = { code: 123, description: 'Exception stack trace' };
        	  return $state.go('displayError');
        });
        document.addEventListener("keyup", function(e) {
            if (e.keyCode === 27)
                $rootScope.$broadcast("escapePressed", e.target);
        });

        document.addEventListener("click", function(e) {
            $rootScope.$broadcast("documentClicked", e.target);
        });
        
        var windowElement = angular.element($window);
        windowElement.on('beforeunload', function (event) {
            // do whatever you want in here before the page unloads.
            // the following line of code will prevent reload or navigating away.
            event.preventDefault();
        });
        
        $rootScope.$on("$stateChangeStart", function(event, toState){
            if (toState.authenticate){
                var resp = AuthenticationService.checkUserCredentials($sessionStorage.userId);
                if(resp === '1'){
                	$sessionStorage.showLogout = false;
                    dataBeanService.setStatetransitionHasErr('1');
                    $state.go('login', {}, {reload: true});
                    event.preventDefault();
                }
            }
          });
        
   }
   
   ErrorHandler.$inject = ['$injector','$window','$location'];
   function ErrorHandler($injector,$window,$location){
   	return {
   		'requestError': function(rejection) {
   	      if (canRecover(rejection)) {
   	        return responseOrNewPromise
   	      }
   	      return $q.reject(rejection);
   	    }
   	}
   }
   
   TokenRefreshInterceptor.$inject = ['$injector','$window','$rootScope'];
   function TokenRefreshInterceptor($injector,$window,$rootScope){
       return {
           'request': function(config) {
        	   var $sessionStorage = $injector.get('$sessionStorage');
        	   var http = $injector.get('$http');
               if ($sessionStorage.token) {
                   config.headers['X-Auth-Token'] = $sessionStorage.token;
                   http.defaults.headers.common['X-Auth-Token'] = $sessionStorage.token;
               }
               return config;
           },
           'response': function(response) {
        	   var $sessionStorage = $injector.get('$sessionStorage');
        	   var http = $injector.get('$http');
                       var data = response.headers('X-Auth-Token');
                   if(data){
                       var json = angular.fromJson(data);
                       $sessionStorage.token = json.token;
                       http.defaults.headers.common['X-Auth-Token'] = json.token;
                   }
                 return response;
            },
           'responseError': function(response) {
        	   var $sessionStorage = $injector.get('$sessionStorage');
        	   var state = $injector.get('$state');
        	   var http = $injector.get('$http');
               if (response.status === 401) {
            	   delete $sessionStorage.token;
                   http.defaults.headers.common['X-Auth-Token'] = "";
                   state.go('login', {}, {reload: true});
               } else {
            	   var errorMessages = [];
            	   if(response.message){
            		   errorMessages.push(response.message);
            	   }
            	   if(response.status){
            		   errorMessages.push(response.status);
            	   }
            	   if(response.statusText){
            		   errorMessages.push(response.statusText);
            	   }
            	   if(response.data){
            		   errorMessages.push(response.data);
            	   }
            	   if($rootScope['addErrorTab']){
            		   $rootScope.addErrorTab(errorMessages);
            	   }else{
            		   alert("Response Status returned:"
          	            		+response.status+" "
           	            		+response.statusText+" "
           	            		+response.data);
            	   }
               }
               return response;
           }
       }
   }
   
   service.$inject = ['$state', '$rootScope', 'AuthenticationService', 'dataBeanService', 'toaster','$window','$sessionStorage'];
   function service ($state, $rootScope, AuthenticationService, dataBeanService, toaster,$window,$sessionStorage){
       var app = this;
       app.logout = function() {
           toaster.pop('success', "Logout Successfull", "Goodbye");
           $sessionStorage.userId = null;
           $sessionStorage.token = null;
           $state.go('login', {}, {reload: true});
       };
   }
   
   angular.isUndefinedOrNull = function(val) {
       return angular.isUndefined(val) || val == null || val === "null";
   }
   
})();