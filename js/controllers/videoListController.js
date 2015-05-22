/**
 * @ngdoc controller
 * @name mSystem.controller:videoListController
 * @description
 * @created May 22, 2015
 */
App.controller('videoListController', function (preferenceService,
                                                $rootScope,
                                                messageService,
                                                permissionsService,
                                                $stateParams,
                                                userManagerService,
                                                $translate,
                                                $http,
                                                tagService,
                                                $window,
                                                deckService,
                                                cardService,
                                                videoService,
                                                ngNotify,
                                                $scope) {

  "use strict";
  $scope.playAllMode = preferenceService.getPref('playAllMode', false);
  $scope.playOnceMode = preferenceService.getPref('playOnceMode', true);
  $scope.editMode = preferenceService.getPref('editMode', true);
  $scope.displayClipTexts = preferenceService.getPref('displayClipTexts', true);
  $scope.displayTranslations = preferenceService.getPref('displayTranslations', true);
  $scope.displayPhonetics = preferenceService.getPref('displayPhonetics', true);
  $scope.displayAnnotations = preferenceService.getPref('displayAnnotations', true);
  $scope.repeatMode = preferenceService.getPref('repeatMode', true);
  $scope.videoService = videoService;
  $scope.searchResults = [];
  /**
   * @ngdoc function
   * @name videoListController.function:getEditMode
   * @description we seam to need this otherwise when you go back to the deckList, editMode is nul value and dropdown menu doesnt show
   * @created 26 Mar 2015
   */
  $scope.getEditMode = function () {
    return preferenceService.getPref('editMode', true);
  };
  $scope.USER = $window.USER;
  $scope.deckService = deckService;
  $scope.stateParams = $stateParams;
  $scope.permissionsService = permissionsService;

  $scope.addingVideo = false;
  /**
   * @ngdoc function
   * @name videoListController.function:clearSearchResults
   * @description clearSearchResults is used to clear the current search
   * @created 21 May 2015
   */
  $scope.clearSearchResults = function () {
    $scope.searchResults = [];
  };
  /**
   * @ngdoc function
   * @name videoListController.function:executeVideoSearch
   * @description executeVideoSearch is search for a particular video
   * @created 22 May 2015
   */
  $scope.executeVideoSearch = function (videoSearchQuery, video_name_only) {
    $scope.searching = true;
    $scope.searchResults = [];
    videoService.videoSearch(videoSearchQuery, video_name_only).then(
      function (response) {
        if (response.success === true) {
          ngNotify.set(response.message, 'success');
          if (video_name_only === false) {
            $scope.searchResults = response.data.videos;
            if (response.data.videos.length > 0) {
              //set the executedSearch param to true so that the searchTab is active
              $scope.executedSearch = true;
            }
          } else {
            $scope.movies = response.data.videos;
          }
        } else {
          ngNotify.set(response.message, 'error');
          $scope.searching = false;
        }
        $scope.searching = false;
      },
      function (response) {
        ngNotify.set(response.message, 'error');
        $scope.searching = false;
      }
    );
  };
  /**
   * load all video names into the system for the auto complete
   */
  $scope.movies = $scope.executeVideoSearch('', true);
  /**
   * @ngdoc function
   * @name videoListController.function:editVideo
   * @description editVideo is used to turn editing on for a particular video.  Also
   * loads the tags of a particular video
   * @created 21 May 2015
   */
  $scope.editVideo = function (video) {
    video.busy = true;
    videoService.getTags(video).then(function (response) {
      video.tags = response.data.tags;
      video.busy = false;
      video.edit = true;
    });
  };
  /**
   * @ngdoc function
   * @name videoListController.function:deleteVideo
   * @description deleteVideo is used to delete videos in the userVideos tab
   * @created 08 May 2015
   */
  $scope.deleteVideo = function (video) {
    videoService.removeVideo(video).then(
      function (response) {
        if (response.success) {
          ngNotify.set(response.message, 'success');
          var index = _.findIndex(videoService.userVideos.videos, {'id': video.id});
          if (index !== -1) {
            videoService.userVideos.videos.splice(index, 1);
          }
          if ($scope.USER.username === 'admin') {
            index = _.findIndex(videoService.mepVideos.videos, {'id': video.id});
            if (index !== -1) {
              videoService.mepVideos.videos.splice(index, 1);
            }
          }

        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );
  };

  /**
   * @ngdoc function
   * @name videoListController.function:multInvite
   * @description multInvite is called when a user clicks the go button after selecting some users they want to share with
   * @created 30 Apr 2015
   */
  $scope.multInvite = function (users, role) {
    var vidArr = [];
    _.each(videoService.userVideos.videos, function (vid) {
      if (vid.selected === true) {
        vidArr.push(vid.id);
      }
    })

    permissionsService.share('Video', vidArr, users, role).then(
      function (response) {
        if (response.success) {
          ngNotify.set(response.message, 'success');
        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );
  };
  /**
   * @ngdoc function
   * @name userListDirective.function:getUserNames
   * @description getUserNames is triggered by the autocomplete field when the user starts entering a username they want to invite
   * @created 16 Apr 2015
   */
  $scope.getUserNames = function ($query) {
    return userManagerService.getUserNamesForAutoComplete($query, false);
  };
  /**
   * @ngdoc function
   * @name videoListController.function:change
   * @description change gets fired when the multipleSelect box is changed, it will
   * reveal an area where the user can add multiple tags for multiple videos
   * @created 11 Apr 2015
   */
  $scope.multipleTags = {}
  $scope.change = function () {
    var action = $('#multipleActionForVideos').val();
    $scope.showSharingUserSelect = false;
    if (action === "share") {
      $scope.showSharingUserSelect = true;
      $scope.usersInvited = [];
      //create tag input field
      $scope.showSharingUserSelect = true;
    } else if (action === "share") {
      $scope.showSharingUserSelect = true;
      $scope.usersInvited = [];
      //create tag input field
      $scope.showSharingUserSelect = true;
    }
  };
  /**
   * @ngdoc function
   * @name videoListController.function:selectAllVideos
   * @description selectAllVideos is used to select all the vids
   * @created 29 Apr 2015
   */
  $scope.selection = {
    userVideos: false,
    sharedVideos: false,
    inviteVideos: false,
    mepVideos: false
  };

  /**
   * @ngdoc function
   * @name videoListController.function:cancelSaveVideo
   * @description cancelSaveVideo is used to toggle addingVideo to false, to close the video creation form
   * @created 07 Apr 2015
   */
  $scope.cancelSaveVideo = function () {

    $scope.newVideo = {
      name: null,
      vidurl: null
    }
    $scope.addingVideo = false;
  }
  /**
   * @ngdoc function
   * @name videoListController.function:reloadPerms
   * @description reloadPerms is used to reload the video permissions for each video loaded
   * this function is only necessary if video permissions were not loaded properly, will be unncessary
   * in production system
   * @created 21 May 2015
   */
  $scope.reloadPerms = function () {
    var vidArr = [];
    _.each(videoService.userVideos.videos, function (vid) {
      if (vid.selected === true) {
        vidArr.push(vid.id);
      }
    });

    permissionsService.reloadVideoPerms(vidArr).then(
      function (response) {
        if (response.success) {
          ngNotify.set(response.message, 'success');
        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );
  };
  // setup up possible locations for the user to copy items to etc
  $scope.locations = [{label: "Select Location", value: "select"}, {label: "My Library", value: "my library"}];//TODO: add users groups here
  $scope.selectedLocation = $scope.locations[0];
  $scope.multAction = {};
  //set the default action in the userVideos select box
  $scope.multAction["userVideos"] = 'Please Select';
  /**
   * @ngdoc function
   * @name videoListController.function:changeMultAction
   * @description changeMultAction is used gets fired on an ng-change
   * @created 21 May 2015
   */
  $scope.changeMultAction = function (theChange, vidType) {
    $scope.multAction[vidType] = theChange[vidType];
  }
  $scope.selectedLocationId = null;
  /**
   * @ngdoc function
   * @name videoListController.function:copyVideos
   * @description copyVideos is used on the shared with me tab when a user selects many videos and presses copy
   * @created 07 May 2015
   */
  $scope.copyVideos = function (destination, destid, videoCategory) {
    var selected = [];
    _.each(videoService[videoCategory].videos, function (video) {
      if (video.selected === true) {
        selected.push(video.id);
      }
    });
    /**
     * @ngdoc function
     * @name videoListController.function:copyMultipleVideos
     * @description copyMultipleVideos is used to copy multiple videos into a dest
     * @created 08 May 2015
     */
    videoService.copyMultipleVideos(selected, destination, destid).then(
      function (response) {
        if (response.success) {
          _.each(response.data.videos, function (video) {
            //remove selected
            var index = _.findIndex(videoService[videoCategory].videos, {'id': video.ref});
            if (index !== -1) {
              videoService[videoCategory].videos[index].selected = false;
            }
            videoService.userVideos.videos.push(video);
            videoService.userVideos.size = parseInt(videoService.userVideos.size) + 1;
          });
          ngNotify.set(response.message, 'success');
        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );
  };
  /**
   * @ngdoc function
   * @name videoListController.function:createVideo
   * @description createVideo is used to toggle a boolean to reveal the addVideo form
   * @created 07 Apr 2015
   */
  $scope.createVideo = function () {
    $scope.filters = "";//clear filters otherwise video will not show
    var newVideo = {
      name: null,
      vidurl: null,
      edit: true
    }
    videoService.userVideos.videos.unshift(newVideo);
  };


  //define the table for userVideos - important for ng-tasty tables
  videoService.userVideos = {
    "page": 0,
    "count": 10,
    "header": [
      {
        "key": "name",
        "name": "Name",
        "style": {},
        "class": []
      }
    ],
    "rows": []
  }
  videoService.sharedVideos = {
    "page": 0,
    "count": 10,
    "header": [
      {
        "key": "name",
        "name": "Name",
        "style": {},
        "class": []
      }
    ],
    "rows": []
  }
  videoService.inviteVideos = {
    "page": 0,
    "count": 10,
    "header": [
      {
        "key": "name",
        "name": "Name",
        "style": {},
        "class": []
      }
    ],
    "rows": []
  }

  $scope.paramsObj = {"pagination": true, "count": 5, "sortBy": "name", "sortOrder": "dsc", "page": 1}
  $scope.params = "page=1&count=5";
  /**
   * @ngdoc function
   * @name videoListController.function:getSelected
   * @description getSelected is used as an ng-if parameter for the multipleSelect form
   * this function checks if ANY of the videos displayed are selected, and returns boolean result
   * @created 30 Apr 2015
   */
  $scope.getSelected = function (vidType) {
    var myReturn = false;
    _.each(videoService[vidType].videos, function (vid) {
      if (vid.selected === true) {
        myReturn = true;
      }
    });
    return myReturn;
  }
  /**
   * @ngdoc function
   * @name videoListController.function:acceptInvites
   * @description acceptInvites is used to accept invites which have been sent to the user
   * @created 08 May 2015
   */
  $scope.acceptInvites = function () {
    var invitesArr = [];
    _.each(videoService.inviteVideos.videos, function (invite) {
      if (invite.selected === true) {
        invitesArr.push(invite.inviteid);
      }
    })

    messageService.acceptMultipleInvites(invitesArr.join(',')).then(
      function (response) {
        if (response.success === true) {
          ngNotify.set(response.message, 'success');
          _.each(response.data.successfulShares, function (video) {
            //remove from inviteVideos pane to shared pain
            var index = _.findIndex(videoService.inviteVideos.videos, {'video_id': video.id});
            if (index !== -1) {
              videoService.inviteVideos.videos.splice(index, 1);
            }
            //now move to shared pane
            videoService.sharedVideos.videos.push(video);
          });

        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );
  };
  /**
   * @ngdoc function
   * @name videoListController.function:publish
   * @description publish is used toggle publishing for selected video
   * @created 21 May 2015
   */
  $scope.publish = function (video) {
    if (video.publish === 'published') {
      video.selected = true;
      $scope.unPublishMultiple([video]);
    } else {
      video.selected = true;
      $scope.publishMultiple([video]);
    }
  };
  /**
   * @ngdoc function
   * @name videoListController.function:publishMultiple
   * @description publishMultiple is used to publish multiple videos
   * @created 08 May 2015
   */
  $scope.publishMultiple = function (videos) {
    var vidArr = [];
    _.each(videos, function (vid) {
      if (vid.selected === true) {
        vidArr.push(vid.id);
      }
    });
    videoService.publish(vidArr, 'published').then(
      function (response) {
        if (response.success) {
          ngNotify.set(response.message, 'success');
          _.each(response.data.successful, function (data) {
            var index = _.findIndex(videos, {'id': data.video.id});
            if (index !== -1) {
              videos[index].selected = false;
              videos[index].publish = data.video.publish;
            }
          });
        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );
  };
  /**
   * @ngdoc function
   * @name videoListController.function:unPublishMultiple
   * @description unPublishMultiple  is used to unpublish multiple videos
   * @created 08 May 2015
   */
  $scope.unPublishMultiple = function (videos) {
    var vidArr = [];
    _.each(videos, function (vid) {
      if (vid.selected === true) {
        vidArr.push(vid.id);
      }
    })

    videoService.publish(vidArr, 'unpublish').then(
      function (response) {
        if (response.success) {
          ngNotify.set(response.message, 'success');
          _.each(response.data.successful, function (data) {
            var index = _.findIndex(videos, {'id': data.video.id});
            if (index !== -1) {
              videos[index].selected = false;
              videos[index].publish = data.video.publish;
            }
          });
        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );

  }
  /**
   * $scope.multipleActionOptions are the options for the userVideos multiple actions select dropdown
   * @type {{label: string, value: string}[]}
   */
  $scope.multipleActionOptions = {
    "userVideos": [
      {label: App.t("ui.PLEASE_SELECT_AN_ACTION"), value: "select"},
      {label: App.t("ui.SHARE_SELECTED"), value: "share"},
      {label: App.t("ui.DELETE_SELECTED"), value: "delete"},
      {label: App.t('ui.PUBLISH_SELECTED'), value: "publish"},
      {label: App.t('ui.UNPUBLISH_SELECTED'), value: "unpublish"}
    ],
    "sharedVideos": [
      {label: App.t("ui.PLEASE_SELECT_AN_ACTION"), value: "select"},
      {label: App.t("ui.COPY_SELECTED"), value: "copy"},
      {label: App.t("ui.LEAVE_SELECTED_VIDEOS"), value: "leave"}
    ],
    "inviteVideos": [
      {label: App.t("ui.ACCEPT_INVITES"), "value": "accept"},
      {label: App.t("ui.REJECT_INVITES"), "value": "reject"}

    ],
    "mepVideos": [
      {label: App.t("ui.COPY_SELECTED"), value: "copy"},
    ]
  }
  // only display RELOAD_VIDEO_PERMISSIONS if user has this system permission
  if (permissionsService.getPerm('RELOAD_VIDEO_PERMISSIONS', 'System', null)) {
    $scope.multipleActionOptions["userVideos"].push({label: App.t("ui.RELOAD_VIDEO_PERMISSIONS"), value: "reload"});
  }
  /**
   * @ngdoc function
   * @name videoListController.function:selectAll
   * @description selectAll is used to toggle the selection of videos on/off for a particular tab specified by vidType
   * @param {string} vidType - the Tab of the videos, can be: userVideos, mepVideos, sharedVideos, inviteVideos
   * @created 21 May 2015
   */
  $scope.selectAll = function (vidType) {
    if (!angular.isUndefined(videoService[vidType].videos)) {
      _.each(videoService[vidType].videos, function (video) {
        video.selected = $scope.selection[vidType];
      });
    }
    $scope.multAction[vidType] = $scope.multipleActionOptions[vidType][0];
  }

  $scope.cancelInvites = function () {
    alert('not implemented yet');
  }

  /**
   * @ngdoc function
   * @name videoListController.function:inviteVideos
   * @description  inviteVideos is a parameter of ng-tasty table. Returns paginated results by making server
   * requests when pagination is changed
   * @created 30 Apr 2015
   */
  $scope.getInviteVideos = function (params, paramsObj) {
    var header = [
      {
        "key": "name",
        "name": "Name",
        "style": {},
        "class": []
      }
    ]
    return videoService.getInviteVideos(params).then(function (response) {
      videoService.inviteVideos = response.data.inviteVideos;
      var pagination = {
        "count": parseInt(videoService.inviteVideos.count),
        "size": parseInt(parseInt(videoService.inviteVideos.size)),
        "page": parseInt(videoService.inviteVideos.page),
        "pages": parseInt(videoService.inviteVideos.pages)
      }
      videoService.inviteVideos.pagination = pagination;
      return {
        'rows': videoService.inviteVideos.videos,
        'header': header,
        'pagination': pagination
        //'sortBy': response.data['sort-by'],
        //'sortOrder': response.data['sort-order']
      }
    });
  }

  /**
   * @ngdoc function
   * @name videoListController.function:getSharedVideos
   * @description  getSharedVideos is a parameter of ng-tasty table. Returns paginated results by making server
   * requests when pagination is changed
   * @created 30 Apr 2015
   */
  $scope.getSharedVideos = function (params, paramsObj) {
    var header = [
      {
        "key": "name",
        "name": "Name",
        "style": {},
        "class": []
      }
    ]
    return videoService.getSharedVideos(params).then(function (response) {
      videoService.sharedVideos = response.data.sharedVideos;
      var pagination = {
        "count": parseInt(videoService.sharedVideos.count),
        "size": parseInt(parseInt(videoService.sharedVideos.size)),
        "page": parseInt(videoService.sharedVideos.page),
        "pages": parseInt(videoService.sharedVideos.pages)
      }
      videoService.sharedVideos.pagination = pagination;
      return {
        'rows': videoService.sharedVideos.videos,
        'header': header,
        'pagination': pagination
        //'sortBy': response.data['sort-by'],
        //'sortOrder': response.data['sort-order']
      };
    });
  }
  /**
   * @ngdoc function
   * @name viewVideoController.function:cancelInvite
   * @description cancelInvite is used to cancel a sent invitation
   * @param {int} gid - the primary key of the groups table
   * @param {function} callback - a success callback
   * @param {function} errback - an error callback
   * @return {json} response
   * @created 28 Apr 2015
   */
  $scope.cancelInvite = function (id) {

    messageService.cancelInvite(id).then(
      function (response) {
        if (response.success) {
          var index = _.findIndex(videoService.inviteVideos.videos, {'inviteid': id});
          if (index !== -1) {
            videoService.inviteVideos.videos = videoService.inviteVideos.videos.splice(index, 1);
          }
          ngNotify.set(response.message, 'success');
        } else {
          ngNotify.set(response.message, 'error');
        }
      },
      function (response) {
        ngNotify.set(response.message, 'error');
      }
    );

  }
  /**
   * @ngdoc function
   * @name videoListController.function:getUserVideos
   * @description  getUserVideos is a parameter of ng-tasty table. Returns paginated results by making server
   * requests when pagination is changed
   * @created 30 Apr 2015
   */
  $scope.getUserVideos = function (params, paramsObj) {
    var header = [
      {
        "key": "name",
        "name": "Name",
        "style": {},
        "class": []
      }
    ]
    return videoService.getUserVideos(params).then(function (response) {
      videoService.userVideos = response.data.userVideos;
      videoService.possibleRoles = {};
      $scope.metaDataTypes = response.data.metaDataTypes;
      videoService.possibleRoles.roles = ["Select Role"];

      _.each(response.data.possibleRoles.roles, function (role) {
        videoService.possibleRoles.roles.push(role);
      });
      $scope.selectedShareRole = videoService.possibleRoles.roles[0];
      var pagination = {
        "count": parseInt(videoService.userVideos.count),
        "size": parseInt(parseInt(videoService.userVideos.size)),
        "page": parseInt(videoService.userVideos.page),
        "pages": parseInt(videoService.userVideos.pages)
      }
      return {
        'rows': videoService.userVideos.videos,
        'header': header,
        'pagination': pagination
        //'sortBy': response.data['sort-by'],
        //'sortOrder': response.data['sort-order']
      };
    });
  }
  /**
   * @ngdoc function
   * @name videoListController.function:getMepVideos
   * @description  getMepVideos is a parameter of ng-tasty table. Returns paginated results by making server
   * requests when pagination is changed
   * @created 30 Apr 2015
   */
  $scope.getMepVideos = function (params, paramsObj) {
    var header = [
      {
        "key": "name",
        "name": "Name",
        "style": {},
        "class": []
      }
    ];
    return videoService.getMepVideos(params).then(function (response) {
      videoService.mepVideos = response.data.mepVideos;
      videoService.possibleRoles = {};

      var pagination = {
        "count": parseInt(videoService.mepVideos.count),
        "size": parseInt(parseInt(videoService.mepVideos.size)),
        "page": parseInt(videoService.mepVideos.page),
        "pages": parseInt(videoService.mepVideos.pages)
      }
      return {
        'rows': videoService.mepVideos.videos,
        'header': header,
        'pagination': pagination
        //'sortBy': response.data['sort-by'],
        //'sortOrder': response.data['sort-order']
      };
    });
  };

});