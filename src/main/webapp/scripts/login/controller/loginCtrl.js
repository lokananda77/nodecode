(function() {

    angular.module('nodeCodeApp.Login').controller('LoginCtrl',
            LoginCtrl);

    LoginCtrl.$inject = ['$state','ngToast','$timeout',
                         '$scope','$http','$rootScope', 
                         'dataBeanService', '$window','loginService',
                         '$sessionStorage','AuthenticationService','$mdDialog'];
    function LoginCtrl($state, ngToast, $timeout, 
    		$scope, $http, $rootScope, 
    		dataBeanService,$window, loginService,
    		$sessionStorage,auth,$mdDialog) {
        var vm = this;
        $scope.user = {};
        vm.userId = $sessionStorage.userId;
        vm.password = '';
        vm.hasErrMsg = false;
        vm.errMsg = '';
        vm.isAuthenticated = $sessionStorage.isAuthenticated;
        
        vm.passwordVO = {};
        
        if(!(angular.isUndefinedOrNull(vm.isAuthenticated))){
        	if(!vm.isAuthenticated){
        		vm.userId = '';
        	}        	
        }
        
        if(dataBeanService.getStatetransitionHasErr() === '1') {
            vm.hasErrMsg = true;
            vm.errMsg = 'NOT_AUTH'
        }

        vm.login = function() {

            if(!(angular.isUndefinedOrNull(vm.userId))
                    && !(angular.isUndefinedOrNull(vm.password))){
                vm.hasErrMsg = false;

                var res = loginService.getLoginResp(vm.userId, vm.password);

                res.then(function(response) {
                	var data = response.data;
                	var status = response.status;
                    if(status === 200) {

                    	$sessionStorage.userId = vm.userId;
                    	$sessionStorage.token = data.token;
                    	$sessionStorage.roles = data.userInfo.roles;
                        vm.isAuthenticated = true;                      
                        $sessionStorage.isAuthenticated = true;
                        if(auth.userHasPermission(['ROLE_USER'])){
                        	$state.go('tabs.reports');
                        }else if(auth.userHasPermission(['ROLE_ADMIN'])){
                        	$state.go('tabs.admin');
                        }
                        else{                       	
                        	$state.go('error',{error:"No role defined for user "+vm.userId});
                        }  
                    }else if (status === 401) {
                        vm.hasErrMsg = true;
                        vm.errMsg = "Hmm, that's not the right password. Please try again or email info@occideas.org to request a new one.";
                    }else {
                        vm.hasErrMsg = true;
                        vm.errMsg = 'failure message: ' + JSON.stringify({data: data}) +' status: '+status;
                    }

                });
            }
            else{
                vm.hasErrMsg = true;
                vm.errMsg = 'LoginId / Password is required.';
            }
        };

        vm.reset = function() {
            vm.userId = '';
            vm.password = '';
            $sessionStorage.userId = null;
            $sessionStorage.token = null;
            vm.isAuthenticated = false;
            vm.LoginHasErr = false;
            vm.hasErrMsg = false;
        };
        var originatorEv;
        vm.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
          };
          vm.showChangePasswordDialog = function(){
  			$mdDialog.show({
  				scope: $scope,  
  				preserveScope: true,
  				templateUrl : 'scripts/login/partials/changePasswordDialog.html',
  				clickOutsideToClose:false
  			});
  		}
  		
  		$scope.changePasswordBtn = function(){
  			if(vm.passwordVO.newPassword != vm.passwordVO.retypeNewPassword){
  				alert("New Password and Retype Password is not the same.");
  				return;
  			}
  			var passwordJson = {
  					userId:$sessionStorage.userId,
  					currentPassword:vm.passwordVO.currentPassword,
  					newPassword:vm.passwordVO.newPassword
  			}
  			loginService.changePassword(passwordJson).then(function(response){
  				if(response.status == 200){
  					alert("Password change was successful.");
  					$mdDialog.cancel();
  				}
  			});
  		}
  		
  		$scope.cancel = function() {
			$mdDialog.cancel();
		};
    }
})();