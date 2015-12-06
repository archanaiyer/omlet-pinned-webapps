angular.module('starter.controllers', [])
    .controller('OmletCtrl', function($scope, GameService, $state) {
        Omlet.ready(function(){
            if(Omlet.isInstalled()){
                var groupId = Omlet.scope.feed_key;
                $scope.checkOpenGame(groupId);

            } else {
                var groupId = "123";
                $scope.checkOpenGame("123");
            }

            GameService.groupId = groupId;
        });

        $scope.checkOpenGame = function(groupId) {
            //check if there is a game open
            GameService.getOpenedGame(groupId).then(function(data) {
                    //if there is a open game, go to the currentGame page
                    $state.go('game', {game: data, gameId: data.id});
                },
                function(reason) {
                    $state.go('tabs.home');
                })
        }
    })
    .controller('HomeCtrl', function($scope, GameService, $state) {
        GameService.getNflGames().then(function(data) {
            $scope.nfl = data;
        });
    })

    .controller('CurrentGameCtrl', function($scope, GameService, $stateParams, $interval) {
        var groupId = GameService.groupId;

        //Initiate the Timer object.
        $scope.Timer = null;

        //Timer start function.
        $scope.StartTimer = function () {
            //Set the Timer start message.
            $scope.Message = "Timer started. ";

            //Initialize the Timer to run every 1000 milliseconds i.e. one second.
            $scope.Timer = $interval(function () {
                GameService.getGameById($stateParams.gameId, groupId).then(function(data) {
                    if (data) {
                        $scope.currentGame = data;
                        GameService.currentGame = data;
                        if($scope.currentGame.status == "closed" || $scope.currentGame.status == "scheduled") {
                            $scope.StopTimer();
                        }
                    }
                }, function(reason) {
                    $scope.currentGame = null;
                });
            }, 1000);
        };

        //Timer stop function.
        $scope.StopTimer = function () {

            //Set the Timer stop message.
            $scope.Message = "Timer stopped.";

            //Cancel the Timer.
            if (angular.isDefined($scope.Timer)) {
                $interval.cancel($scope.Timer);
            }
        };
        $scope.StartTimer();
    })
    .controller('FormCtrl', function($scope, $http, GameService) {
        var title = GameService.currentGame.home.alias + " VS " + GameService.currentGame.away.alias;

        $scope.submitForm = function() {
            alert("enter submit");
            Omlet.ready(function() {
                alert("before rdl");
                if(!isFromRDL()) {
                    alert("enter rdl");
                    var rdl = Omlet.createRDL({
                        noun: "pin-app",
                        displayTitle: title,
                        displayText: $scope.data.comment,
                        json: {game: GameService.currentGame, gameId: GameService.currentGame.id},
                        webCallback:"omlet-pinapp:http://ec2-52-34-18-73.us-west-2.compute.amazonaws.com:8080/gameDetails",
                        callback:"omlet-pinapp:http://ec2-52-34-18-73.us-west-2.compute.amazonaws.com:8080/gameDetails"
                    });
                    Omlet.exit(rdl);
                }
            })
        };
    })

