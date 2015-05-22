describe('Video List Controller', function () {
  var ctrl, scope;

  // Load the module containing the app, only 'ng' is loaded by default.
  beforeEach(module('App'));

  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();

    ctrl = $controller('videoListController', {
      $scope: scope,
      $rootScope: $rootScope,
      preferenceService: {
        getPref: function () {

        }
      },
      messageService: {},
      permissionsService: {
        getPerm: function () {

        }
      },
      $stateParams: {},
      userManagerService: {},
      $translate: {},
      $http: {},
      tagService: {},
      $window: {},
      deckService: {},
      cardService: {},
      videoService: {
        videoSearch: function () {
          return {
            then: function () {

            }
          }
        }
      },
      ngNotify: {}
    });
  }));

  it('should have empty search results initially', function () {
    expect(scope.searchResults.length).toBe(0);
  });

});