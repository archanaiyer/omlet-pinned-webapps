angular.module('starter.services', [])
    .factory('GameService', function ($http, $q) {
        var expose = {};
        expose.groupId = null;
        expose.currentGame = null;

        expose.getOpenedGame = function(groupId) {
            var deferred = $q.defer();

            $http.get("/api/games/" + groupId).
                success(function (data, status, headers, config) {
                    if (data == null) {
                        console.log("return empty list of vacation info");
                    }
                    //return the game object
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    console.log("could not get the vacation info, error status is " + status
                    + " the response content is " + data);

                    deferred.reject(data + status + headers + config);
                });
            return deferred.promise;
        }

        expose.getNbaGames = function() {

            var deferred = $q.defer();

            $http.get("/data/nba.json").
                success(function (data, status, headers, config) {
                    if (data == null) {
                        console.log("return empty list of vacation info");
                    }
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    console.log("could not get the vacation info, error status is " + status
                    + " the response content is " + data);
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        expose.getNflGames = function() {

            var deferred = $q.defer();

            $http.get("/api/games/" ).
                success(function (data, status, headers, config) {
                    if (data == null) {
                        console.log("return empty list of vacation info");
                    }
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    console.log("could not get the vacation info, error status is " + status
                    + " the response content is " + data);
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        expose.getGameById = function(gameId, groupId) {
            var deferred = $q.defer();
            $http.post("/api/games/" + groupId + "/" + gameId, null).
                success(function (data, status, headers, config) {
                    if (data == null) {

                    }
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        return expose;
    });
