/*global angular, FormData, FileReader*/

angular.module("forms", ["api"])
  .config(function ($httpProvider) {
    "use strict";
    $httpProvider.defaults.withCredentials = true;
  })
  .controller("cmsPostListCtrl", ["$http", "apiUrl", function ($http, apiUrl) {
    "use strict";
    var ctrlScope = this;
    ctrlScope.posts = [{title: "loading"}];
    $http.post(
      apiUrl,
      {
        "request": "getAllBlogs"
      }
    ).then(function successCallback(response) {
      var blogNum, responseMessage, responseData, tempKeywords, keyword, keywords;
      responseMessage = response.data.message;
      responseData = response.data.data;
      
      ctrlScope.posts = [];
      for (blogNum in responseData) {
        ctrlScope.posts.push(
          {
            title: responseData[blogNum].Title,
            author: responseData[blogNum].Author,
            description: responseData[blogNum].Description,
            keywords: responseData[blogNum].Keywords.join(", "),
            id: responseData[blogNum].ID,
            date: responseData[blogNum].SavedDate
          }
        );
      }
    }, function errorCallback(response) {
      ctrlScope.posts = [
        {
          title: response.data.error,
          author: response.data.error,
          description: response.data.error,
          keywords: response.data.error,
          id: response.data.error,
          date: response.data.error
        }
      ];
    });
  }])
  .controller("cmsPageListCtrl", ["$http", "apiUrl", function ($http, apiUrl) {
    "use strict";
    var ctrlScope = this;
    ctrlScope.pages = [{name: "loading"}];
    $http.post(
      apiUrl,
      {
        "request": "getAllPages"
      }
    ).then(function successCallback(response) {
      var pageNum, responseMessage, responseData, tempKeywords, keyword, keywords;
      responseMessage = response.data.message;
      responseData = response.data.data;
      
      ctrlScope.pages = [];
      for (pageNum in responseData) {
        ctrlScope.pages.push(
          {
            name: responseData[pageNum].Name,
            description: responseData[pageNum].Description,
            keywords: responseData[pageNum].Keywords.join(", "),
            date: responseData[pageNum].SavedDate
          }
        );
      }
    }, function errorCallback(response) {
      ctrlScope.pages = [
        {
          name: response.data.error,
          description: response.data.error,
          keywords: response.data.error,
          date: response.data.error
        }
      ];
    });
  }])
  .controller("cmsUploadImageCtrl", ["$http", "apiUrl", "$scope", function ($http, apiUrl, $scope) {
    "use strict";
    var ctrlScope = this;
    var reader = new FileReader();
    reader.onload = function(event) {
      ctrlScope.imageUrl = event.target.result;
      $scope.$apply();
    }
    
    ctrlScope.refreshPreview = function () {
      if (ctrlScope.image instanceof Blob) {
        reader.readAsDataURL(ctrlScope.image);
      }
    };
    
    ctrlScope.upload = function () {
      if (ctrlScope.image === undefined) {
        ctrlScope.status = "No image selected";
        return;
      }
      ctrlScope.contentType = ctrlScope.image.type;
      
      waitingDialog.show("Fetching presigned URL");

      var presignedRequest = {
        "request": "getPresignedPostImage",
        "filename": ctrlScope.image.name,
        "acl": "public-read"
      };

      $http.post(
        apiUrl,
        presignedRequest,
        {
          withCredentials: true
        }
      ).then(function successCallback(response) {
        waitingDialog.update("Uploading image to s3");

        var responseData, fields, postData, key, postConfig, field, uploadForm;
        responseData = response.data;
        fields = responseData.fields;

        postData = new FormData();
        postData.append("key", fields.key);
        postData.append("Content-Type", ctrlScope.image.type);
        postData.append("AWSAccessKeyId", fields.AWSAccessKeyId);
        postData.append("acl", fields.acl);
        postData.append("policy", fields.policy);
        postData.append("signature", fields.signature);
        postData.append("x-amz-security-token", fields["x-amz-security-token"]);
        postData.append("file", ctrlScope.image);

        $http({
          method: "POST",
          url: responseData.url,
          data: postData,
          headers: {"Content-Type": undefined,
                    "Cache-Control": "max-age=0",
                    "Upgrade-Insecure-Requests": "1"},
          transformRequest: angular.identity,
          withCredentials: false
        }).then(function successCallback(response) {
          waitingDialog.update("Successfully uploaded " + ctrlScope.image.name);
          setTimeout(waitingDialog.hide, 1000);
        }, function errorCallback(response) {
          var error = "Something went wrong";
          if (response.hasOwnProperty("data.error")) {
            error = respone.data.error;
          }
          waitingDialog.update(error);
          setTimeout(waitingDialog.hide, 1000);
        });
      }, function errorCallback(response) {
        var error = "";
        if (response.hasOwnProperty("data.error")) {
          error = respone.data.error;
        }
        waitingDialog.update("Unable to fetch presigned URL" + error);
        setTimeout(waitingDialog.hide, 1000);
      });
    };
  }])
  .directive("fileModel", [
    "$parse",
    function ($parse) {
      "use strict";
      return {
        restrict: "A",
        link: function (scope, element, attrs) {
          var model, modelSetter;
          model = $parse(attrs.fileModel);
          modelSetter = model.assign;
          element.bind("change", function () {
            scope.$apply(function () {
              if (attrs.multiple) {
                modelSetter(scope, element[0].files);
              } else {
                modelSetter(scope, element[0].files[0]);
              }
            });
          });
        }
      };
    }
  ]);




/**
 * Module for displaying "Waiting for..." dialog using Bootstrap
 *
 * @author Eugene Maslovich <ehpc@em42.ru>
 */

var waitingDialog = waitingDialog || (function ($) {
    'use strict';

	// Creating modal dialog's DOM
	var $dialog = $(
		'<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
		'<div class="modal-dialog modal-m">' +
		'<div class="modal-content">' +
			'<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
			'<div class="modal-body">' +
				'<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
			'</div>' +
		'</div></div></div>');

	return {
		/**
		 * Opens our dialog
		 * @param message Custom message
		 * @param options Custom options:
		 * 				  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
		 * 				  options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning".
		 */
		show: function (message, options) {
			// Assigning defaults
			if (typeof options === 'undefined') {
				options = {};
			}
			if (typeof message === 'undefined') {
				message = 'Loading';
			}
			var settings = $.extend({
				dialogSize: 'm',
				progressType: '',
				onHide: null // This callback runs after the dialog was hidden
			}, options);

			// Configuring dialog
			$dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
			$dialog.find('.progress-bar').attr('class', 'progress-bar');
			if (settings.progressType) {
				$dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
			}
			$dialog.find('h3').text(message);
			// Adding callbacks
			if (typeof settings.onHide === 'function') {
				$dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
					settings.onHide.call($dialog);
				});
			}
			// Opening dialog
			$dialog.modal();
		},
		/**
		 * Closes dialog
		 */
		hide: function () {
			$dialog.modal('hide');
		},
        update: function (message) {
          $dialog.find('h3').text(message);
        }
	};

})(jQuery);
