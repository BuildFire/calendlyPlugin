'use strict';

(function (angular, buildfire) {
  angular.module('calendlyPluginWidget', ['ui.bootstrap'])
    .controller('WidgetHomeCtrl', ['$scope', 'Buildfire', 'DataStore', 'TAG_NAMES', 'STATUS_CODE',
      function ($scope, Buildfire, DataStore, TAG_NAMES, STATUS_CODE) {
        var WidgetHome = this;
        WidgetHome.isWebPlatform = false;
        /*
         * Fetch user's data from datastore
         */
        WidgetHome.init = function () {
          WidgetHome.success = function (result) {
            if (result.data && result.id) {
              WidgetHome.data = result.data;
              if (!WidgetHome.data.content)
                WidgetHome.data.content = {};
            } else {
              WidgetHome.data = {
                content: {}
              };
              var dummyData = {
                link: "https://calendly.com/rjaseoud",
                calendar: "rjaseoud"
              };
              WidgetHome.data.content.link = dummyData.link;
              WidgetHome.data.content.calendar = dummyData.calendar;
            }

            buildfire.getContext(function (err, context) {
              if (context) {
                if (WidgetHome.data.content.link && context.device.platform == "web") {
                  WidgetHome.isWebPlatform = true;
                  renderiFrame({url: WidgetHome.data.content.link});
                } else {
                  if (WidgetHome.data.content.link)
                    buildfire.navigation.openWindow(WidgetHome.data.content.link, "_blank", function(){
                      //Go back due to issue with popup
                      buildfire.navigation.goBack();
                    });
                }
              }
              else {
                console.log("Error getting context: ", err);
              }
            });

          };
          WidgetHome.error = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.error('Error while getting data', err);
            }
          };
          DataStore.get(TAG_NAMES.CALENDLY_INFO).then(WidgetHome.success, WidgetHome.error);
        };

        const removeLoadingText = () => {
          let loadingText = window.document.getElementById('loadingText');
          if (loadingText) loadingText.remove();
        }
        const renderiFrame = (props) =>{
          let currentIframe = window.document.getElementById('webviewIframe');
          if (currentIframe) {
            currentIframe.remove();
          }
          removeLoadingText();
        
          window.document.body.appendChild((() => {
            let p = window.document.createElement('p');
            p.innerHTML = 'Loading...';
            p.className = 'bodyTextTheme backgroundColorTheme';
            p.style.padding = '8px 0';
            p.style.display = 'inline-block';
            p.style.width = '100%';
            p.style.left= 0;
            p.style.background = '#eef0f0';
            p.style.textAlign = 'center';
            p.style.color = '#5f5f5f';
            p.id = 'loadingText';
            return p;
          })());
        
          let container =  window.document.body;
        
          container.appendChild((() => {
        
            let modal = (document.querySelectorAll('div[id^="confirm"]') || [])[0];
            if (modal) {
              let confirm = (modal.querySelectorAll('.approve-confirmation') || [])[0];
              if (confirm && confirm.click) confirm.click();
            }
      
            const targetProtocol = (/[a-z]{4,5}:/g.exec(props.url) || [])[0] || false;
            let url = (/(http|https):\/\/\S+\.[a-z]+/g.exec(props.url) || [])[0] || 'this site';
      
            if (window.location.protocol === 'https:' && targetProtocol === 'http:') {
              buildfire.messaging.sendMessageToControl({ tag: 'mixedContent', url: url });
            }
        
            let iFrame = window.document.createElement('iframe');
            iFrame.id = 'webviewIframe';
            iFrame.src = props.url;
            iFrame.scrolling = 'auto';
            iFrame.style.height = '100%';
            iFrame.style.width = '1px';
            iFrame.style.position = 'absolute';
            iFrame.style.top = 0;
            iFrame.style.minWidth = '100%';
            iFrame.onload = () => {
              removeLoadingText();
              buildfire.messaging.sendMessageToControl({ tag: 'displayWarning' });
            };
            setTimeout(() => {
              removeLoadingText();
            }, 3000);
        
            return iFrame;
          })());
        };

        WidgetHome.onUpdateCallback = function (event) {
          if (event && event.tag === TAG_NAMES.CALENDLY_INFO) {
            WidgetHome.data = event.data;
            if (WidgetHome.data && !WidgetHome.data.design)
              WidgetHome.data.design = {};
            if (WidgetHome.data && !WidgetHome.data.content)
              WidgetHome.data.content = {};
          }
        };

        DataStore.onUpdate().then(null, null, WidgetHome.onUpdateCallback);

        WidgetHome.init();

      }])
    .filter('returnUrl', ['$sce', function ($sce) {
      return function (url) {
        return $sce.trustAsResourceUrl(url + "?noframe=true&skipHeaderFooter=true");
      }
    }]);
})(window.angular, window.buildfire);
