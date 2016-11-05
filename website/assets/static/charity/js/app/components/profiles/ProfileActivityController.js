
(function () {
    'use strict';

    angular
        .module('charity.profiles.controllers')
        .controller('ProfileActivityController', ProfileActivityController);

    ProfileActivityController.$inject = ['$http', '$location', 'Authentication', 'Profile'];

    function ProfileActivityController($http, $location, Authentication, Profile) {
        var vm = this;
        vm.isCharity = true;
        vm.activity = {};

        vm.timelineHtmlPart = "<div class='cd-timeline-block'><div class='cd-timeline-img cd-picture'>"
            + "<img src='/static/charity/css/profilecss/cd-icon-picture.svg' alt='Picture'></div>"
            + "<div class='cd-timeline-content'><h2>Event Name</h2><p>Content</p>"
            + "<a href='#0' class='cd-read-more'></a><span class='cd-date'>Jan 14</span></div></div>";

        vm.timelineHtmlPart1 = "<div class='cd-timeline-block'><div class='cd-timeline-img cd-picture'>"
            + "<img src='/static/charity/css/profilecss/cd-icon-picture.svg' alt='Picture'></div>"
            + "<div class='cd-timeline-content'><h2>";

        vm.timelineHtmlPart2 = "</h2><p>Content</p>"
            + "<a href='#0' class='cd-read-more'></a><span class='cd-date'>Jan 14</span></div></div>";

        activate();

        function activate() {
            // TODO Check if login and correct user login
            vm.isAuthenticated = Authentication.isAuthenticated();
            var authenticatedAccount = Authentication.getAuthenticatedAccount();
            if (!authenticatedAccount) {
                $location.url('/login');
                //Snackbar.error('You are not authorized to view this page.');
            } else {
                if (authenticatedAccount != undefined){
                    vm.user = authenticatedAccount.username;
                }
            }

            var user_role = Profile.getAuthenticatedAccount().userRole;
            vm.isCharity = user_role == "charity";

            // $http.get('/static/charity/resources/profileActivity.json').success(
            //     function (response) {
            //         vm.activityResults = response;
            //     });

            $http.get('/api/charity/get_activity/', {params:{"id": 12}}).then(getSuccessFn, getErrorFn);

            function getSuccessFn(data, status, headers, config) {
                var charityActivity = data.data["charity_activities"];
                console.log(charityActivity);
                vm.activityResults = charityActivity;
            }

            function getErrorFn(data, status, headers, config) {
                console.error('Getting Charity Profile failed! ' + status);
            }
        }

        // Called when the user clicks on Update profile
        // TODO After save success direct to activities page
        vm.update = function(){
            // TODO Next phase can delete activity
            // return $http.post('/api/charity/activity/', activity).then(updateSuccessFn, updateErrorFn);
            //
            // function updateSuccessFn(data, status, headers, config) {
            //     alert('Finish');
            //     console.log('Update successful!');
            // }
            //
            // function updateErrorFn(data, status, headers, config) {
            //     alert('Fail');
            //     console.error('Update failed!' + status);
            // }
        }
    }
})();