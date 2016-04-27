'use strict';

(function (angular, buildfire) {
  angular.module('calendlyPluginContent', ['ui.bootstrap'])
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'STATUS_CODE', 'TAG_NAMES', 'DataStore', 'Utils', '$timeout',
      function ($scope, Buildfire, STATUS_CODE, TAG_NAMES, DataStore, Utils, $timeout) {
        var ContentHome = this;

        ContentHome.validUrl = false;
        ContentHome.inValidUrl = false;

        ContentHome.data = {
          content: {
            "calendar": "",
            "link": ""
          }
        };

        ContentHome.gotToPage = function () {
          window.open('https://calendly.com/signup', '_blank');
        };

        ContentHome.saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
          ContentHome.success = function (result) {
            console.info('Saved data result: ', result);
          };
          ContentHome.error = function (err) {
            console.error('Error while saving data : ', err);
          };
          DataStore.save(newObj, tag).then(ContentHome.success, ContentHome.error);
        };

        ContentHome.validateUrl = function () {
          if (ContentHome.calendar)
            ContentHome.data.content.calendar = ContentHome.calendar;
          if (ContentHome.link && Utils.validateUrl(ContentHome.link)) {
            ContentHome.data.content.link = ContentHome.link;
            ContentHome.validUrl = true;
            $timeout(function () {
              ContentHome.validUrl = false;
            }, 3000);
            ContentHome.inValidUrl = false;
            ContentHome.saveData(ContentHome.data, TAG_NAMES.CALENDLY_INFO);
          } else {
            ContentHome.inValidUrl = true;
            $timeout(function () {
              ContentHome.inValidUrl = false;
            }, 3000);
            ContentHome.validUrl = false;
          }
        };

        ContentHome.addCalendar = function () {
          if (ContentHome.calendar) {
            ContentHome.link = "https://calendly.com/" + ContentHome.calendar;
          }
          else {
            ContentHome.data.content.link = null;
            ContentHome.data.content.calendar = null;
            ContentHome.link = null;
            ContentHome.calendar = null;
            ContentHome.saveData(ContentHome.data, TAG_NAMES.CALENDLY_INFO);
          }
        };

        /*
         * Go pull any previously saved data
         * */
        ContentHome.init = function () {
          ContentHome.success = function (result) {
            console.info('init success result:', result);
            if (result.data && result.id) {
              ContentHome.data = result.data;
              if (!ContentHome.data.content)
                ContentHome.data.content = {};
              if (ContentHome.data.content.calendar)
                ContentHome.calendar = ContentHome.data.content.calendar;
              if (ContentHome.data.content.link)
                ContentHome.link = ContentHome.data.content.link;
            }
            else {
              var dummyData = {
                link: "https://calendly.com/rjaseoud",
                calendar: "rjaseoud"
              };
              ContentHome.calendar = ContentHome.data.content.calendar = dummyData.calendar;
              ContentHome.link = ContentHome.data.content.link = dummyData.link;
            }
          };
          ContentHome.error = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.error('Error while getting data', err);
            }
          };
          DataStore.get(TAG_NAMES.CALENDLY_INFO).then(ContentHome.success, ContentHome.error);
        };
        ContentHome.init();
      }
    ])
})(window.angular, window.buildfire);