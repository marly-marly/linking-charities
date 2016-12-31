(function () {
    'use strict';

    angular
        .module('charity.search.controllers')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', '$http', 'Search', '$location', '$anchorScroll', '$modal'];

    function SearchController($scope, $http, Search, $location, $anchorScroll, $modal) {
        //search function
        var searchKey = Search.getSearchKey();
        // $scope.searchKeyWord = searchKey.name;
        search();

        function search(row) {
            var url;
            // Normal Search
            if (searchKey.filter == null && searchKey.country == null && searchKey.city == null && searchKey.tag == null) {
                url = "/api/charity/charity_search/";
                $http.get(url, {
                    params: {"name": searchKey.name}
                }).then(getSuccessFn, getErrorFn);
            } else { // Advance Search
                url = "/api/charity/charity_advance_search/";
                $http.get(url, {
                    params: {
                        "name": searchKey.name,
                        "filter": searchKey.filter,
                        "country": searchKey.country,
                        "city": searchKey.city,
                        "tag": searchKey.tag
                    }
                }).then(getSuccessFn, getErrorFn);
            }

            function getSuccessFn(data, status, headers, config) {
                console.log(data);
                var search = data.data["charity_profiles"];
                $scope.searchResults = search;
            }

            function getErrorFn(data, status, headers, config) {
                console.error('Getting Search failed! ' + status);
            }
        }

        // filtered data
        $scope.$watch(function () {
            $scope.filteredItems = $scope.$eval("searchResults | filter : searchKeyWord");
        });

        //pagination function
        $scope.pageProperties = {
            size: 10,
            current: 1
        };
        $scope.numberOfPages = function () {
            if ($scope.filteredItems != null) {
                return Math.ceil($scope.filteredItems.length / $scope.pageProperties.size);
            } else {
                return 0;
            }
        };
        $scope.selectPage = function (page) {
            if (page >= 1 && page <= $scope.numberOfPages()) {
                $scope.pageProperties.current = page;
                document.getElementById("inputPage").value = $scope.pageProperties.current;
                $anchorScroll();
            }
        };
        $scope.selectPageInput = function () {
            if (document.getElementById("inputPage").value >= 1 && document.getElementById("inputPage").value <= $scope.numberOfPages()) {
                $scope.pageProperties.current = parseInt(document.getElementById("inputPage").value);
                $anchorScroll();
            }
            else {
                alert("please input correct pages");
            }
        };

        //info about numbers of listed charities
        $scope.firstInfo = function () {
            if ($scope.filteredItems != null) {
                if ($scope.filteredItems.length != 0) {
                    return (($scope.pageProperties.current - 1) * $scope.pageProperties.size + 1);
                }
                else {
                    return 0;
                }
            }
        };
        $scope.secondInfo = function () {
            if ($scope.filteredItems != null) {
                if ($scope.filteredItems.length == 0) {
                    return 0;
                }
                else if (($scope.pageProperties.current * $scope.pageProperties.size) > $scope.filteredItems.length) {
                    return ($scope.filteredItems.length);
                }
                else {
                    return ($scope.pageProperties.current * $scope.pageProperties.size);
                }
            }
        };

        //sort function
        $scope.sortClick = function (sortKeyName) {
            $scope.sortKey = sortKeyName;
            $scope.reverse = !$scope.reverse;
            $scope.selectPage(1);
        };

        //Change between list and map
        $scope.isMap = 0;
        $scope.isList = function (list) {
            if (list == 1) {
                $scope.isMap = 0;
            }
            if (list == 0) {
                $scope.isMap = 1;
            }
        };

        //map function
        $scope.locations = [];
        $scope.locationsID = [];
        $scope.locationsName = [];
        $scope.pushLocations = function () {
            if ($scope.locations.length == 0) {
                for (var j = 0; j < $scope.filteredItems.length; j++) {
                    if ($scope.filteredItems[j].country != null && $scope.filteredItems[j].city != null && $scope.filteredItems[j].postcode != null) {
                        $scope.locations.push($scope.filteredItems[j].country + "&nbsp" + $scope.filteredItems[j].city + "&nbsp" + $scope.filteredItems[j].postcode);
                        $scope.locationsID.push($scope.filteredItems[j].id);
                        $scope.locationsName.push($scope.filteredItems[j].charity_name);
                    }
                }
            }
        };
        $scope.mapFunction = function () {
            var mapCanvas = document.getElementById("map");
            var myCenter = new google.maps.LatLng(51.508742, -0.120850);
            var mapOptions = {center: myCenter, zoom: 10};
            var map = new google.maps.Map(mapCanvas, mapOptions);
            var infowindow = new google.maps.InfoWindow({content: "Hello World!"});
            var bounds = new google.maps.LatLngBounds();
            var geocoder = new google.maps.Geocoder();

            var nextAddress = 0;
            var delay = 100;

            var geocodeAddress = function (address, id, name, tagIsFirstData) {
                if (tagIsFirstData == 0) {
                    geocoder.geocode({"address": address}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            //difference
                            map.setCenter(results[0].geometry.location);

                            var p = results[0].geometry.location;
                            var lat = p.lat();
                            var lng = p.lng();
                            createMarker(address, id, name, lat, lng);
                        }
                        else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                            nextAddress--;
                            delay++;
                        }
                        else {
                            console.log("Geocode was not successful for the following reason: " + status);
                        }
                        //next();
                    });
                }
                else if (tagIsFirstData != 0) {
                    geocoder.geocode({"address": address}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var p = results[0].geometry.location;
                            var lat = p.lat();
                            var lng = p.lng();
                            createMarker(address, id, name, lat, lng);
                        }
                        else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                            nextAddress--;
                            delay++;
                        }
                        else {
                            console.log("Geocode was not successful for the following reason: " + status);
                        }
                    });
                }
            };

            var createMarker = function (address, id, name, lat, lng) {
                //set style of info window content
                var contentString = '<table class="infoTable">' +
                    '<tbody>' +
                    '<tr>' +
                    '<td class="showPicture">' +
                    '<img class="picStyle" src="/static/charity/images/no-user-image.gif">' +
                    '</td>' +
                    '<td class="infoShowContent">' +
                    '<a href= "/charity/charityprofile/' + id + '">' + name + '</a>' +
                    '<p>' + address + '</p>' +
                    '</td>' +
                    '</tr>' +
                    '</tbodyclass>' +
                    '</table>';

                //set markers
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: map
                });

                //zoom when clicking marker
                google.maps.event.addListener(marker, 'click', function () {
                    map.setZoom(15);
                    map.setCenter(marker.getPosition());
                });

                //show info window when clicking marker
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(contentString);
                    infowindow.open(map, marker);
                });

                bounds.extend(marker.position);
            };

            for (; nextAddress < $scope.locations.length; nextAddress++) {
                geocodeAddress($scope.locations[nextAddress], $scope.locationsID[nextAddress], $scope.locationsName[nextAddress], nextAddress);
                // if (nextAddress == $scope.locations.length - 1) {
                //     map.fitBounds(bounds);
                //     map.setCenter(bounds.getCenter())
                // }
            }
        };


        // $scope.uploadPictureFunction = function () {
        //     var modalInstance = $modal.open({
        //         templateUrl: '/static/charity/js/app/components/imgcrop/uploadimg.html',
        //         controller: 'UploadimgController'
        //     });
        // };
        //
        // $scope.updateImageFunction = function(){
        //     var modalInstance = $modal.open({
        //         templateUrl: '/static/charity/js/app/components/imgcrop/imgcrop.html',
        //         controller: 'ImgcropController'
        //     });
        // };
    }
})
();
