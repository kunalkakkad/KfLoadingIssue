/*var app = angular.module('app',[]);
app.controller('myController', function($scope){
    $scope.load = function () {
        $rootScope.showSpinner = false;
    }
});*/




(function () {
    "use strict";
    angular.module("app.core", ["app.constants", "app.configs", "app.routes", "ngScrollbars"]);
})();

(function () {
    "use strict";

    angular.module("app.constants", []);
})();
(function () {
    "use strict";

    angular.module("app.constants")
        .constant("appConfig", {
            devMode: false,
            images: {
                site: "assets/img/site/"
            },
            baseTemplateUrl: "app/views/",
            sharedTemplateUrl: "app/shared/",
            //apiUrl: "http://192.168.1.113/kf.cpibusiness-admin/frontend/web/",
            apiUrl: "https://stagebuilder.cpibusiness.net/frontend/web/",
            videoPlayerTheme: 'assets/css/videogular.min.css',
            facebookApplicationId: '438338053199445'
        });
})();
(function () {
    "use strict";
    angular.module("app.configs", ["app.constants"]);

})();
(function () {
    "use strict";

    angular.module("app.configs").config(configApplication);

    configApplication.$inject = ["$locationProvider", "$urlRouterProvider"];
    function configApplication($locationProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $locationProvider.html5Mode(true);
    }
})();
(function () {
    "use strict";

    angular.module("app.configs").config(configScrollBars);

    configScrollBars.$inject = ["ScrollBarsProvider"];
    function configScrollBars(ScrollBarsProvider) {
        ScrollBarsProvider.defaults = {
            autoHideScrollbar: false,
            theme: 'minimal-dark',
            advanced: {
                updateOnContentResize: true,
                updateOnImageLoad: false
            },
            axis: 'y',
            scrollInertia: 0
        };
    }
})();
(function () {
    "use strict";

    angular.module("app.configs").config(configCache);

    configCache.$inject = ["CacheFactoryProvider", "$httpProvider"];
    function configCache(CacheFactoryProvider, $httpProvider) {
        $httpProvider.defaults.cache = true;
        angular.extend(CacheFactoryProvider.defaults, {
            maxAge: 20 * 60 * 1000,
            deleteOnExpire: 'aggressive'
        });
    }
})();
(function () {
    "use strict";

    angular.module("app.configs").config(configTranslate);

    configTranslate.$inject = ["$translateProvider"];
    function configTranslate($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
    }
})();
angular
    .module('app.core')
    .factory(
    'preloader',
    function ($q, $rootScope) {
        // I manage the preloading of image objects. Accepts an array of image URLs.
        function Preloader(imageLocations) {
        	imageLocations = new Array("");
            // I am the image SRC values to preload.
            this.imageLocations = imageLocations;
            // As the images load, we'll need to keep track of the load/error
            // counts when announing the progress on the loading.
            this.imageCount = this.imageLocations.length;
            this.loadCount = 0;
            this.errorCount = 0;
            // I am the possible states that the preloader can be in.
            this.states = {
                PENDING: 1,
                LOADING: 2,
                RESOLVED: 3,
                REJECTED: 4
            };
            // I keep track of the current state of the preloader.
            this.state = this.states.PENDING;
            // When loading the images, a promise will be returned to indicate
            // when the loading has completed (and / or progressed).
            this.deferred = $q.defer();
            this.promise = this.deferred.promise;
        }
        // ---
        // STATIC METHODS.
        // ---
        // I reload the given images [Array] and return a promise. The promise
        // will be resolved with the array of image locations.
        Preloader.preloadImages = function (imageLocations) {
            imageLocations = new Array("");
            var preloader = new Preloader(imageLocations);
            return (preloader.load());
        };
        // ---
        // INSTANCE METHODS.
        // ---
        Preloader.prototype = {
            // Best practice for "instnceof" operator.
            constructor: Preloader,
            // ---
            // PUBLIC METHODS.
            // ---
            // I determine if the preloader has started loading images yet.
            isInitiated: function isInitiated() {
                return (this.state !== this.states.PENDING);
            },
            // I determine if the preloader has failed to load all of the images.
            isRejected: function isRejected() {
                return (this.state === this.states.REJECTED);
            },
            // I determine if the preloader has successfully loaded all of the images.
            isResolved: function isResolved() {
                return (this.state === this.states.RESOLVED);
            },
            // I initiate the preload of the images. Returns a promise.
            load: function load() {
                // If the images are already loading, return the existing promise.
                if (this.isInitiated()) {
                    return (this.promise);
                }
                this.state = this.states.LOADING;
                for (var i = 0; i < this.imageCount; i++) {
                    this.loadImageLocation(this.imageLocations[i]);
                }
                // Return the deferred promise for the load event.
                return (this.promise);
            },
            // ---
            // PRIVATE METHODS.
            // ---
            // I handle the load-failure of the given image location.
            handleImageError: function handleImageError(imageLocation) {
                imageLocation = '';
                this.errorCount++;
                // If the preload action has already failed, ignore further action.
                if (this.isRejected()) {
                    return;
                }
                this.state = this.states.REJECTED;
                this.deferred.reject(imageLocation);
            },
            // I handle the load-success of the given image location.
            handleImageLoad: function handleImageLoad(imageLocation) {
                imageLocation = '';
                this.loadCount++;
                // If the preload action has already failed, ignore further action.
                if (this.isRejected()) {
                    return;
                }
                // Notify the progress of the overall deferred. This is different
                // than Resolving the deferred - you can call notify many times
                // before the ultimate resolution (or rejection) of the deferred.
                this.deferred.notify({
                    percent: Math.ceil(this.loadCount / this.imageCount * 100),
                    imageLocation: imageLocation
                });
                // If all of the images have loaded, we can resolve the deferred
                // value that we returned to the calling context.
                if (this.loadCount === this.imageCount) {
                    this.state = this.states.RESOLVED;
                    this.deferred.resolve(this.imageLocations);
                }
            },
            // I load the given image location and then wire the load / error
            // events back into the preloader instance.
            // --
            // NOTE: The load/error events trigger a $digest.
            loadImageLocation: function loadImageLocation(imageLocation) {
                imageLocation = '';
                var preloader = this;
                // When it comes to creating the image object, it is critical that
                // we bind the event handlers BEFORE we actually set the image
                // source. Failure to do so will prevent the events from proper
                // triggering in some browsers.
                // --
                // The below removes a dependency on jQuery, based on a comment
                // on Ben Nadel's original blog by user Adriaan:
                // http://www.bennadel.com/members/11887-adriaan.htm
                var image = angular.element(new Image())
                    .bind('load', function (event) {
                        // Since the load event is asynchronous, we have to
                        // tell AngularJS that something changed.
                        $rootScope.$apply(
                            function () {
                                preloader.handleImageLoad(event.target.src);
                                // Clean up object reference to help with the
                                // garbage collection in the closure.
                                preloader = image = event = null;
                            }
                        );
                    })
                    .bind('error', function (event) {
                        // Since the load event is asynchronous, we have to
                        // tell AngularJS that something changed.
                        $rootScope.$apply(
                            function () {
                                preloader.handleImageError(event.target.src);
                                // Clean up object reference to help with the
                                // garbage collection in the closure.
                                preloader = image = event = null;
                            }
                        );
                    })
                    .attr('src', imageLocation)
                    ;
            }
        };
        // Return the factory instance.
        return (Preloader);
    }
    );
(function () {
    "use strict";
    angular.module("app.routes", ["ui.router", "app.constants"])
})();
(function () {
    "use strict";
    angular.module("app.routes")
        .config(applicationConfig);

    /**
     * application route configuration
     * @param {$stateProvider} The state provider
     * @param {appConfig} The application constant value
     */
    applicationConfig.$inject = ["$stateProvider", "appConfig"];
    function applicationConfig($stateProvider, appConfig) {
        /**
         * initialize the application configuration
         */
        function init() {
            addBasicRoute();
        }

        /**
         * add basic route to state
         */
        function addBasicRoute() {
            var index = {
                name: "index",
                url: "/{lang}",
                templateUrl: appConfig.baseTemplateUrl + "index/index.html",
                controller: "IndexController",
                controllerAs: "indexCtrl",
                resolve: {
                    allData: function (dataService, $location, $stateParams, $q, $rootScope) {
                        var deferred = $q.defer();
                        dataService.getAllData($stateParams.lang, function (data) {
                            var hashTag = $location.hash();
                            //var meta = dataService.getMeta(hashTag);
                           // $rootScope.updateMetaModel(meta);
                            deferred.resolve(data);

                        }, function () {
                            deferred.resolve();
                        })

                        return deferred.promise;
                    }
                },
                data: {
                    header: "home",
                },
                params: {
                    lang: {
                        squash: true,
                        value: "en"
                    }
                }
            }

            $stateProvider.state(index);
        }


        init();
    }
})();
(function () {
    'use strict';

    angular.module('app.core')
        .service('utilService', utilService);

    utilService.$inject = [];
    function utilService(enumProvider, $q) {
        var service = {
            preLoader: preLoader
        };


        function preLoader(url, successCallback, errorCallback) {
            successCallback();
            angular.element(new Image()).bind('load', function () {
                successCallback();
            }).bind('error', function () {
                errorCallback();
            }).attr('src', url);
        }

        return service;
    }
})();
(function () {
    "use strict";

    angular.module("app.filter", ["app.core"]);
})();

(function () {
    "use strict";

    angular.module("app.filter")
        .filter("unsafeHtml", unsafeHtml);

    unsafeHtml.$inject = ["$sce"];
    function unsafeHtml($sce) {
        return $sce.trustAsHtml;
    }

})();
(function () {
    "use strict";

    angular.module("app.filter")
        .filter("i18n", i18nFilter);

    function i18nFilter() {
        return function (input, language) {
            var translations = {
                "en": {
                    "SuccessFullStories": "Successfull Stories",
                    "DiscoverStories": "Discover the stories",
                    "YearOfEstablishment": "Year of establishment",
                    "NoOfEmployees": "Number of employees",
                    "Uniquesellingpoint": "Unique selling point",
                    "Readthisstory": "Read this story",
                    "StoryCount": "Story {{0}} of {{1}}",
                    "SlideLeft": "Slide left for the next story",
                    "ReadThisInterview": "Read this interview",
                    "SlideLeftInterview": "Slide left for the next member interview"
                },
                "ar": {
                    "SuccessFullStories": "قصص ناجحة",
                    "DiscoverStories": "اكتشاف القصص",
                    "YearOfEstablishment": "سنة التأسيس",
                    "NoOfEmployees": "عدد الموظفين",
                    "Uniquesellingpoint": "نقطة بيع فريدة من نوعها",
                    "Readthisstory": "اقرأ هذه القصة",
                    "StoryCount": "{{1}}القصة {{0}} من ",
                    "SlideLeft": "انتقل الشريحة إلى القصة القادمة",
                    "ReadThisInterview": "اقرأ هذه المقابلة",
                    "SlideLeftInterview": "غادر الشريحة لمقابلة العضو التالي"
                }
            };

            var selectedLanguage = language || "en";

            return translations[selectedLanguage][input];
        }
    }
})();
(function () {
    "use strict";

    angular.module("app.service", []);
})();
(function () {
    "use strict";

    angular.module("app.service")
        .service("commonService", commonService);

    commonService.$inject = ['CacheFactory', 'appConfig', '$http'];
    function commonService(cacheFactory, appConfig, $http) {
        if (!cacheFactory.get('commonCache')) {
            cacheFactory.createCache('commonCache');
        }

        var commonCache = cacheFactory.get('commonCache');

        return {
            getLookups: function (language) {
                if (!language) {
                    language = 'en';
                }
                var url = appConfig.apiUrl + "home/lookup?lang=" + language;
                return $http.get(url, { cache: commonCache, offline: true });
            },
            getCount: function (sucess, error) {
                $http.get(appConfig.apiUrl + "home/count", { offline: true }).then(function (data) {
                    if (data.data && data.data.success) {
                        sucess(data.data.data);
                    } else {
                        error(data.data.message)
                    }
                }, function (e) {
                    error(e);
                });
            },
        };
    }

})();
(function () {
    "use strict";

    angular.module("app.service")
        .service("storyService", storyService);

    storyService.$inject = ['CacheFactory', 'appConfig', '$http'];
    function storyService(cacheFactory, appConfig, $http) {
        if (!cacheFactory.get('storyCache')) {
            cacheFactory.createCache('storyCache');
        }

        var storyCache = cacheFactory.get('storyCache');
        var service = {};
        service.getStories = getStories;
        service.getStoryById = getStoryById;

        function getStories(language, sucessCallback, errorCallback) {
            if (!language) {
                language = 'en';
            }
            var url = appConfig.apiUrl + "story/list?lang=" + language;

            var cachedData = storyCache.get(url);
            // Return the data if we already have it
            if (cachedData) {
                sucessCallback(cachedData);
                return;
            }

            $http.get(url, { offline: true }).then(function (data) {
                if (data.data && data.data.success) {
                    storyCache.put(url, data.data.data.items);
                    sucessCallback(data.data.data.items);
                } else {
                    errorCallback(data.data.message)
                }
            }, function (e) {
                errorCallback(e);
            });
        }

        function getStoryById(storyId, language, sucessCallback, errorCallback) {
            var url = appConfig.apiUrl + "story/detail?id=" + storyId;
            if (language) {
                url = url + "&lang=" + language;
            }

            var cachedData = storyCache.get(url);
            // Return the data if we already have it
            if (cachedData) {
                sucessCallback(cachedData);
                return;
            }

            return $http.get(url, { offline: true }).then(function (data) {
                if (data.data && data.data.success) {
                    storyCache.put(url, data.data.data);
                    sucessCallback(data.data.data);
                } else {
                    errorCallback(data.data.message)
                }
            }, function (e) {
                errorCallback(e);
            });
        }


        return service;
    }

})();
(function () {
    "use strict";

    angular.module("app.service")
        .service("memberService", memberService);

    memberService.$inject = ['CacheFactory', 'appConfig', '$http'];
    function memberService(cacheFactory, appConfig, $http) {
        if (!cacheFactory.get('memberCache')) {
            cacheFactory.createCache('memberCache');
        }

        var memberCache = cacheFactory.get('memberCache');
        var service = {};
        service.getMembers = getMembers;
        service.getMemberById = getMemberById;

        function getMembers(language, sucessCallback, errorCallback) {
            if (!language) {
                language = 'en';
            }

            var url = appConfig.apiUrl + "member/list?lang=" + language;

            var cachedData = memberCache.get(url);
            // Return the data if we already have it
            if (cachedData) {
                sucessCallback(cachedData);
                return;
            }

            $http.get(url, { offline: true }).then(function (data) {
                if (data.data && data.data.success) {
                    memberCache.put(url, data.data.data.items);
                    sucessCallback(data.data.data.items);
                } else {
                    errorCallback(data.data.message)
                }
            }, function (e) {
                errorCallback(e);
            });
        }

        function getMemberById(memberId, language, sucessCallback, errorCallback) {
            var url = appConfig.apiUrl + "member/detail?id=" + memberId;
            if (language) {
                url = url + "&lang=" + language;
            }

            var cachedData = memberCache.get(url);
            // Return the data if we already have it
            if (cachedData) {
                sucessCallback(cachedData);
                return;
            }

            return $http.get(url, { offline: true }).then(function (data) {
                if (data.data && data.data.success) {
                    memberCache.put(url, data.data.data);
                    sucessCallback(data.data.data);
                } else {
                    errorCallback(data.data.message)
                }
            }, function (e) {
                errorCallback(e);
            });

        }

        return service;
    }

})();
(function () {
    "use strict";

    angular.module("app.service")
        .service("dataService", dataService);

    dataService.$inject = ['appConfig', '$http', '$linq', 'preloader', '$window', '$location'];
    function dataService(appConfig, $http, $linq, preloader, $window, $location) {
        var service = {};
        service.getAllData = getAllData;
        service.isLoaded = false;
        service.isStaticImageLoaded = false;
        service.swiperData = [];
        service.loadStaticImages = loadStaticImages;
       // service.getMeta = getMeta;
        var origin = $window.location.origin;
        var path = $window.location.pathname.length > 1 ? $window.location.pathname : '';
        var pathName = origin + path;

        function createSliderIndex() {
            service.swiperData = [];
            service.swiperData.push(
                {
                    hash: 'index',
                    isHome: true,
                    nestedSwipe: false,
                    hasPagination: false,
                    hasMemberHome: false,
                    meta: {
                        title: "Khalifa Fund",
                        description: "10 years journey of delivering success",
                        image: pathName + "/assets/img/landing-page-bg.jpg",
                    }
                });

            service.swiperData.push(
                {
                    hash: 'home',
                    isHome: true,
                    nestedSwipe: false,
                    hasPagination: false,
                    hasMemberHome: false,
                    meta: {
                        title: "Success Stories & Board Members Interviews",
                        description: "10 years journey of delivering success",
                        image: pathName + "/assets/img/success-story.jpg",
                    }
                });

            service.swiperData.push(
                {
                    hash: 'stories',
                    hasPagination: true,
                    hasMemberHome: false,
                    meta: {
                        title: "Success Stories",
                        description: "10 years journey of delivering success",
                        image: pathName + "/assets/img/success-story.jpg",
                    }
                });

            service.stories.forEach(function (story, index, arr) {
                service.swiperData.push(
                    {
                        hash: 'story_' + story.slug,
                        storyId: story.storyId,
                        nestedSwipe: true,
                        hasPagination: true,
                        hasMemberHome: false,
                        index: index + 1,
                        meta: {
                            title: "Success Story",
                            description: story.name + ' - ' + story.publisher.uniqueSellingPoint,
                            image: story.bgImage,
                        }
                    });
            });

            service.swiperData.push(
                {
                    hash: 'members',
                    hasPagination: true,
                    hasMemberHome: false,
                    meta: {
                        title: "Board Members Interviews",
                        description: "10 years journey of delivering success",
                        image: pathName + "/assets/img/board-members.jpg",
                    }
                });

            service.members.forEach(function (member, index, arr) {
                service.swiperData.push(
                    {
                        hash: 'member_' + member.publisher.slug,
                        memberId: member.memberId,
                        nestedSwipe: false,
                        hasPagination: true,
                        hasMemberHome: true,
                        index: index + 1,
                        meta: {
                            title: "Board Member Interview",
                            description: member.publisher.name + ' - ' + member.publisher.designation,
                            image: pathName + "/assets/img/board-members.jpg",
                        }
                    });
            });
        }

        /*function getMeta(hasTag) {
            if (hasTag != "") {
                var data = $linq.Enumerable().From(service.swiperData).
                    Where(function (x) {
                        return x.hash == hasTag
                    }).FirstOrDefault();
                if (data && data.meta) {
                    return data.meta;
                } else {
                    return null;
                }
            } else {
                return service.swiperData[0].meta;
            }
        }*/

        function getAllData(language, sucessCallback, errorCallback) {
            if (!language) {
                language = 'en';
            }
            var url = appConfig.apiUrl + "home/all?lang=" + language;

            $http.get(url, { offline: true }).then(function (data) {
                if (data.data && data.data.success) {
                    var response = data.data.data;
                    service.emirate = response.emirate;
                    service.activity = response.activity;
                    service.stories = response.stories;
                    service.storypages = response.storypages;
                    service.questions = response.questions;
                    service.publishers = response.publishers;
                    service.members = response.members;
                    loadImages(sucessCallback);
                    manageData();
                } else {
                    errorCallback(data.data.message)
                }
            }, function (e) {
                errorCallback(e);
            });
        }

        function manageData() {
            service.storypages.forEach(function (storypage, index, arr) {
                storypage.questions = getStoryQuestions(storypage.storyPageId);
            });

            service.stories.forEach(function (story, index, arr) {
                story.no = index + 1;
                story.count = arr.length;
                story.storypages = getStoryPages(story.storyId);
                story.publisher = getPublisher(story.publisherId);
            });

            service.members.forEach(function (member, index, arr) {
                member.no = index + 1;
                member.count = arr.length;
                member.publisher = getPublisher(member.publisherId)
            });
            createSliderIndex();
        }

        function getPublisher(publisherId) {
            if (publisherId) {
                //return $linq.Enumerable().From(service.publishers)
                //	.FirstOrDefault(function (x) {
                //		return x.publisherId == publisherId
                //	});
                return $linq.Enumerable().From(service.publishers).
                    Where(function (x) {
                        return x.publisherId == publisherId
                    }).FirstOrDefault();
            } else {
                return [];
            }
        }

        function getStoryQuestions(storyPageId) {
        	if (storyPageId) {
                return $linq.Enumerable().From(service.questions)
                    .Where(function (x) {
                        return x.storyPageId == storyPageId
                    }).ToArray();
            } else {
                return [];
            }
        }

        function getStoryPages(storyId) {
            if (storyId) {
                return $linq.Enumerable().From(service.storypages)
                    .Where(function (x) {
                        return x.storyId == storyId;
                    }).ToArray();
            } else {
                return [];
            }
        }

        function loadImages(sucessCallback) {
            var storyBgArray = $linq.Enumerable().From(service.stories)
                .Where(function (x) {
                    return 'http://kf.cpibusiness.net/angularv3/assets/img/blue-grad-bg.jpg'
                })
                .Select(function (x) {
                    return 'http://kf.cpibusiness.net/angularv3/assets/img/blue-grad-bg.jpg'
                })
                .ToArray();

            var publishersArray = $linq.Enumerable().From(service.publishers)
                .Where(function (x) {
                    return 'http://kf.cpibusiness.net/angularv3/assets/img/blue-grad-bg.jpg'
                })
                .Select(function (x) {
                    return 'http://kf.cpibusiness.net/angularv3/assets/img/blue-grad-bg.jpg'
                })
                .ToArray();

            var questionsArray = $linq.Enumerable().From(service.questions)
                .Where(function (x) {
                    return x.image
                })
                .Select(function (x) {
                    return x.image
                })
                .ToArray();

            var imageLocations = [];
            imageLocations = imageLocations.concat(storyBgArray);
            imageLocations = imageLocations.concat(publishersArray);
            imageLocations = imageLocations.concat(questionsArray);
            //console.log("imageLocations", imageLocations);

            preloader.preloadImages(imageLocations)
                .then(function () {
                    service.isLoaded = true;
                    sucessCallback(true);
                },
                function () {
                    service.isLoaded = true;
                    sucessCallback(true);
                });
        }

        function loadStaticImages(sucessCallback) {
            var staticImages = [];
            staticImages.push('assets/img/landing-page-bg.jpg');
            staticImages.push('assets/img/blue-grad-bg.jpg');
            staticImages.push('assets/img/success-story.jpg');
            staticImages.push('assets/img/board-members.jpg');


            preloader.preloadImages(staticImages)
                .then(function () {
                    service.isStaticImageLoaded = true;
                    sucessCallback(true);
                },
                function () {
                    service.isStaticImageLoaded = true;
                    sucessCallback(true);
                });
        };

        return service;
    }

})();
(function () {
    "use strict";

    angular.module("app.directives", ["ng.deviceDetector"]);
})();
(function () {
    "use strict";

    angular.module("app.directives").directive("storyBackground", storyBackground);

    storyBackground.$inject = ["appConfig"]
    function storyBackground(appConfig) {
        var directive = {};
        directive.restrict = "A",
            directive.link = storyBackgroundLink;

        function storyBackgroundLink(scope, element, attrs) {
            attrs.$observe("storyBackground", function (src) {
                if (src) {
                    element.css({
                        "background-image": "url('" + src + "')"
                    });
                }
            });
        }

        return directive;
    }
})();
(function () {
    "use strict";

    angular.module("app.directives").directive("verticalAlign", verticalAlign);

    verticalAlign.$inject = ["$window"]
    function verticalAlign($window) {
        var directive = {};
        directive.restrict = "A",
            directive.link = verticalAlignLink;

        function verticalAlignLink(scope, element, attrs) {
            attrs.$observe("verticalAlign", function (height) {
                if (height) {
                    calculateHeight(height);
                    angular.element($window).bind('resize', function () {
                        calculateHeight(height);
                    });
                }
            });

            function calculateHeight(height) {
                if ($window.innerHeight > height) {
                    var diffHeight = ($window.innerHeight - height);
                    element.css({
                        "margin-top": (diffHeight / 2) + "px"
                    });
                } else {
                    element.css({
                        "margin-top": "0px"
                    });
                }

                element.removeClass('vertical-align');
            }
        }

        return directive;
    }
})();
(function () {
    "use strict";

    angular.module("app.directives").directive("storyListHeight", storyListHeight);

    storyListHeight.$inject = []
    function storyListHeight() {
        var directive = {};
        directive.restrict = "A",
            directive.link = storyListHeightLink;

        function storyListHeightLink(scope, element, attrs) {
            attrs.$observe("storyListHeight", function (isCalculate) {
                if (isCalculate == "true") {
                    scope.$watch(function () {
                        var li = element.find('ul li');
                        var paging = element.find('.listing-nav');
                        element.css({
                            "height": li.outerHeight() * attrs.length + paging.outerHeight() * 2 + 40 + "px"
                        });
                    });
                }
            });
        }

        return directive;
    }
})();
(function () {
    "use strict";

    angular.module("app.directives").directive("storyAnswerHeight", storyAnswerHeight);

    storyAnswerHeight.$inject = ["$window", "$timeout", "deviceDetector", "DEVICES"]
    function storyAnswerHeight($window, $timeout, deviceDetector, DEVICES) {
        var directive = {};
        directive.restrict = "A",
            directive.link = storyAnswerHeightLink;

        function storyAnswerHeightLink(scope, element, attrs) {
            attrs.$observe("storyAnswerHeight", function (index) {
                $timeout(function () {
                    calculateHeight();
                    $(element).mCustomScrollbar("scrollTo", "top");
                }, 0);
            });

            // $timeout(function () {
            // calculateHeight();
            // },0);

            function calculateHeight() {
                var storyPage = element.closest('.member_story_content');
                var storyHeader = storyPage.find('h1');
                var storyQuestion = storyPage.find('blockquote');
                var height = storyPage.outerHeight() - storyHeader.outerHeight() - storyQuestion.outerHeight();

                if (deviceDetector.device == DEVICES.ANDROID) {
                    height = height - 45;
                } else {
                    height = height - 30;
                }

                element.css({
                    "max-height": height + "px"
                });
            }
        }

        return directive;
    }
})();
(function () {
    "use strict";

    angular.module("app.directives").directive("memberInterviewHeight", memberInterviewHeight);

    memberInterviewHeight.$inject = ["$window", "$timeout", "deviceDetector", "DEVICES"]
    function memberInterviewHeight($window, $timeout, deviceDetector, DEVICES) {
        var directive = {};
        directive.restrict = "A",
            directive.link = memberInterviewHeightLink;

        function memberInterviewHeightLink(scope, element, attrs) {
            attrs.$observe("memberInterviewHeight", function (index) {
                $timeout(function () {
                    calculateHeight();
                    $(element).mCustomScrollbar("scrollTo", "top");
                }, 0);
            });

            function calculateHeight() {
                var storyPage = element.closest('.member_story_content');
                var storyHeader = storyPage.find('h1');
                var storyQuestion = storyPage.find('blockquote');
                var height = storyPage.innerHeight() - storyHeader.outerHeight() - storyQuestion.outerHeight();

                if (deviceDetector.device == DEVICES.ANDROID) {
                    height = height - 45;
                } else {
                    height = height - 30;
                }
                element.css({
                    "max-height": height + "px"
                });
            }
        }

        return directive;
    }
})();
(function () {
    "use strict";

    angular.module("app.directives").directive("updateScrollbar", updateScrollbar);

    updateScrollbar.$inject = []
    function updateScrollbar() {
        var directive = {};
        directive.restrict = "A",
            directive.link = updateScrollbarLink;

        function updateScrollbarLink(scope, element, attrs) {
            element.bind('load', function () {
                var scroller = element.closest(".member_story_detail")
                console.log("Update scroller on image load");
                $(scroller).mCustomScrollbar("update");
            });
        }

        return directive;
    }
})();
(function () {
    'use strict';

    angular.module('app.directives').directive('setImage', setImage);

    function setImage() {
        var directive = {};
        directive.restrict = 'A';
        directive.link = setImageLink;

        function setImageLink(scope, element, attrs) {
            attrs.$observe('ngSrc', function (value) {
                attrs.$set('src', '');
                if (value) {
                    attrs.$set('src', value);
                }
            });
        }

        return directive;
    }
})();

(function () {
    'use strict';

    angular.module('app.directives').directive('toStory', toStory);

    function toStory() {
        var directive = {};
        directive.restrict = 'A';
        directive.link = toStoryLink;

        function toStoryLink(scope, element, attrs) {
            //console.log('element', element);
            //var mySwiper = $('.swiper-container').swiper();
            //element.click(function (e) {
            //    e.preventDefault();
            //    mySwiper.slideNext();
            //})
        }

        return directive;
    }
})();

(function () {
    "use strict";
    angular.module("app.directives")
        .directive("storyItem", storyItem);

    /**
     * Story item directive
     */
    function storyItem() {
        var directive = {};
        directive.templateUrl = "app/shared/story-item/story-item.html";
        directive.restrict = "E";
        directive.replace = true,
            directive.controller = storyItemController;
        directive.controllerAs = "storyItemCtrl";
        directive.bindToController = true;
        directive.scope = {
            storyModel: "=item"
        };

        /**
         * Story item controller
         */
        storyItemController.$inject = ["$rootScope", "$window", "$location", "$scope", "dataService", "$linq"];
        function storyItemController($rootScope, $window, $location, $scope, dataService, $linq) {
            var vm = this;
            vm.loadStory = loadStory;

            function loadStory(slugName) {
                slugName = 'story_' + slugName;
                var index = -1;

                dataService.swiperData.some(function (obj, i) {
                    return obj.hash === slugName ? index = i : false;
                });



                if (index > -1) {
                    $rootScope.slideTo(index);
                }
            }
        }

        return directive;
    }

})();

(function () {
    "use strict";
    angular.module("app.directives")
        .directive("nextPrevStory", nextPrevStory);

    function nextPrevStory() {
        var directive = {};
        directive.templateUrl = "app/shared/next-prev-story/next-prev-story.html";
        directive.restrict = "E";
        directive.controller = nextPrevStoryController;
        directive.controllerAs = "nextPrevCtrl";
        directive.bindToController = true;
        directive.scope = {
            prev: "=",
            next: "=",
            type: "@"
        };

        nextPrevStoryController.$inject = [];
        function nextPrevStoryController() {
            var vm = this;
        }

        return directive;
    }

})();

(function () {
    "use strict";
    angular.module("app.directives")
        .directive("itemNavBar", itemNavBar);

    /**
     * Item nav bar directive
     */
    function itemNavBar() {
        var directive = {};
        directive.templateUrl = "app/shared/item-nav-bar/item-nav-bar.html";
        directive.restrict = "E";
        directive.replace = true,
            directive.controller = itemNavBarController;
        directive.controllerAs = "navCtrl";
        directive.bindToController = true;

        /**
         * Item nav bar controller
         */
        itemNavBarController.$inject = ["$scope", "$rootScope", "dataService"];
        function itemNavBarController($scope, $rootScope, dataService) {
            var vm = this;
            vm.redirectToStory = redirectToStory;
            vm.redirectToMember = redirectToMember;
            //storyService.getStories($rootScope.lang,function(items){
            //	vm.stories = items;				
            //},function(error){
            //	vm.stories = [];				
            //});

            $scope.$watch(function () {
                return dataService.stories
            }, function (newValue, oldValue) {
                vm.stories = newValue;
            });

            $scope.$watch(function () {
                return dataService.members
            }, function (newValue, oldValue) {
                vm.members = newValue;
            });

            //memberService.getMembers($rootScope.lang,function(items){
            //	vm.members = items;				
            //},function(error){
            //	vm.members = [];
            //}); 

            function redirectToStory(slugName) {
                slugName = 'story_' + slugName;
                var index = -1;

                dataService.swiperData.some(function (obj, i) {
                    return obj.hash === slugName ? index = i : false;
                });

                if (index > -1) {
                    $rootScope.slideTo(index);
                }
            }

            function redirectToMember(slugName) {
                slugName = 'member_' + slugName;
                var index = -1;

                dataService.swiperData.some(function (obj, i) {
                    return obj.hash === slugName ? index = i : false;
                });

                if (index > -1) {
                    $rootScope.slideTo(index);
                }
            }

        }

        return directive;
    }

})();

(function () {
    angular.module("app.directives").directive("homePage", homePageDirective);

    function homePageDirective() {
        var directive = {};
        directive.templateUrl = "app/shared/homePage/homePage.html";
        directive.restrict = "E";
        directive.controller = homeController;
        directive.controllerAs = "homeCtrl";
        directive.bindToController = true;

        homeController.$inject = ["$linq", "dataService", "$rootScope", "$location"];
        function homeController($linq, dataService, $rootScope, $location) {
            var vm = this;
            vm.storiesIndex = 2;
            vm.slideToStoriesIndex = slideToStoriesIndex;
            vm.slideToMembersIndex = slideToMembersIndex;
            /*$rootScope.$on('$locationChangeSuccess', function () {
                if ($location.url() === '/#home') {
                    var enjoyhint_instance = new EnjoyHint({});
                    var enjoyhint_script_steps = [
                        {
                            'click #hint2': 'Click Here To Read All Stories.'
                        }
                    ];
                    enjoyhint_instance.set(enjoyhint_script_steps);
                    enjoyhint_instance.run();
                }
            });*/
            function slideToStoriesIndex() {
                $rootScope.slideTo(vm.storiesIndex);
            }

            function slideToMembersIndex() {
                if (!vm.membersIndex) {
                    vm.membersIndex = dataService.stories.length + 3;
                    console.log("membersIndex", vm.membersIndex)
                }
                $rootScope.slideTo(vm.membersIndex);
            }
        }

        return directive;
    }
})();
(function () {
    angular.module("app.directives").directive("indexPage", indexPageDirective);

    function indexPageDirective() {
        var directive = {};
        directive.templateUrl = "app/shared/indexPage/indexPage.html";
        directive.restrict = "E";
        directive.controller = indexController;
        directive.controllerAs = "indexCtrl";
        directive.bindToController = true;

        indexController.$inject = ['$rootScope', '$scope', "$state", "dataService", "$location", "commonService","ngProgressFactory"];
        function indexController($rootScope, $scope, $state, dataService, $location, commonService,ngProgressFactory) {
            var vm = this;
            vm.stories = 0;
            vm.changeLanguage = changeLanguage;

            function init() {
                watchStories();
            }
            /*if ($location.url() === '/') {
                $rootScope.progressbar.complete();
                var enjoyhint_instance = new EnjoyHint({});
                var enjoyhint_script_steps = [
                    {
                        'click #hint1': 'Please Select Language'
                    }
                ];
                enjoyhint_instance.set(enjoyhint_script_steps);
                enjoyhint_instance.run();
            }*/
            function watchStories() {
                var watchStory = $scope.$watch(function () {
                    return dataService.stories;
                }, function () {
                    if (dataService && dataService.stories) {
                        vm.stories = dataService.stories.length;
                        watchStory();
                    }
                })
            }

            function changeLanguage(selectedLanguage) {
                if (selectedLanguage == $rootScope.lang) {
                    $rootScope.slideTo(1);
                }
                else {
                    $rootScope.progressbar = ngProgressFactory.createInstance();
                    $rootScope.progressbar.setColor('#6dbe48');
                    $rootScope.progressbar.setHeight('5px');
                    $rootScope.progressbar.start();
                    $rootScope.showSpinner = true;
                    //$('body').append('<div class="loader-container" style="display:block;"><div class="abs_center"><h1 class="text-uppercase">Test</h1><div class="loading"><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div></div > </div> </div>');
                    //  $rootScope.progressbar.reset();
                    var url = $state.href('index', { lang: selectedLanguage, '#': 'home' });
                    if (selectedLanguage == 'en') {
                        url = "/" + url;
                    }
                    url = url.replace('/angularv3', '');
                    $location.url(url);

                }
            }

            init();
        }

        return directive;
    }
})();
(function () {
    angular.module("app.directives")
        .directive("memberPage", memberPageDirective);

    function memberPageDirective() {
        var directive = {};
        directive.templateUrl = "app/shared/memberPage/memberPage.html";
        directive.restrict = "E";
        directive.controller = memberController;
        directive.controllerAs = "memberCtrl";
        directive.bindToController = true;
        directive.scope = {
            memberDetail: "=",
            no: "@"
        };

        memberController.$inject = ["$scope", "$state", "appConfig", "$stateParams", "$http", "$rootScope", "angularPlayer", "$sce", "memberService", "$timeout", "deviceDetector", "dataService", "$linq","$location"];
        function memberController($scope, $state, appConfig, $stateParams, $http, $rootScope, angularPlayer, $sce, memberService, $timeout, deviceDetector, dataService, $linq, $location) {
            var vm = this;
            $scope.effect = "slide";
            vm.swiper = {};
            vm.currentLanguage = "en"
            vm.isMobile = deviceDetector.isMobile() && !deviceDetector.isTablet();
            var events = [];
            vm.videoConfig = {
                sources: [
                ],
                theme: appConfig.videoPlayerTheme,
                plugins: {
                    poster: ""
                }
            };
            vm.isVideoPlay = false;
            vm.API = null
            vm.onReadySwiper = onReadySwiper;
			/*$rootScope.hideUpArrow = true;
			$rootScope.hideDownArrow = true;*/

            function init() {
                $scope.$on("$destroy", destroy);
                loadMember();
            }

             /*$rootScope.$on('$locationChangeSuccess', function () {
                if ($location.url() === '/#member_ahmad_bin_ali') {
                    var enjoyhint_instance = new EnjoyHint({});
                    var enjoyhint_script_steps = [
                        {
                            'click .btn_header': 'Click here to return back to homepage'
                        }
                    ];
                    enjoyhint_instance.set(enjoyhint_script_steps);
                    enjoyhint_instance.run();
                }
            });*/

            $scope.$watch(swiperWatch, function (newVal, oldVal) {
                init();
            })

            function swiperWatch() {
                return vm.swiper;
            }

            function onReadySwiper(swiper) {
                vm.swiper = swiper;
                $timeout(function () {
                    $rootScope.pageIndex.column = vm.swiper.activeIndex + 1;
                    vm.swiper.on('slideChangeEnd', function () {
                        $timeout(function () {
                            $rootScope.pageIndex.column = vm.swiper.activeIndex + 1;
                            //   $rootScope.hideUpArrow = swiper.activeIndex == 0 ? true : false;
                            //   $rootScope.hideDownArrow = swiper.isEnd;
                        })
                    });
                });
            }

            function loadMember() {
                var memberId = $stateParams.id;

                $scope.$watch(function () { return vm.memberDetail }, function (newValue, oldValue) {
                    var memberData = getMember(newValue.memberId);
                    if (memberData.nestedSwipe) {
                        memberData.swiper = vm.swiper;
                    }

                    if (vm.memberDetail.audioUrl) {
                        vm.audioConfig = [{
                            "id": "audioPlayer",
                            "url": vm.memberDetail.audioUrl
                        }];

                        events.push($scope.$on('music:isPlaying', function (event, data) {
                            $scope.$apply(function () {
                                vm.isAudioPlay = data;
                            });
                        }));
                    }

                    if (vm.memberDetail.videoUrl) {
                        var videoSource = {};
                        videoSource.src = $sce.trustAsResourceUrl(vm.memberDetail.videoUrl.url);
                        if (vm.memberDetail.videoUrl.type) {
                            videoSource.type = vm.memberDetail.videoUrl.type;
                        }
                        vm.videoConfig.sources.push(videoSource);

                        if (vm.memberDetail.videoUrl.poster) {
                            vm.videoConfig.plugins.poster = vm.memberDetail.videoUrl.poster
                        }
                    }
                });


                function getMember(memberId) {
                    return $linq.Enumerable().From(dataService.swiperData).
                        Where(function (x) {
                            return x.memberId == memberId
                        }).FirstOrDefault();
                }
            }

            vm.onPlayerReady = function (API) {
                vm.API = API;
            };

            vm.close = function () {
                vm.isVideoPlay = false;
                vm.API.stop();
            }

            vm.playVideo = function () {
                vm.isVideoPlay = true;
                vm.API.play();
            }

            vm.completeVideo = function () {
                $scope.$apply(function () {
                    vm.isVideoPlay = false;
                });
            }

            vm.selectLanguage = function (language) {
                $rootScope.currentLanguage = language;
                vm.currentLanguage = language;
                loadStory();
            }

            vm.readInterview = function () {
                vm.swiper.slideNext();
            }

            vm.slideUp = function () {
                vm.swiper.slidePrev();
            }

            function destroy() {
                if (events.length > 0) {
                    events.forEach(function (event) {
                        if (event) {
                            event(); // destroy event
                        }
                    });
                }

                if (angularPlayer.isPlayingStatus()) {
                    angularPlayer.clearPlaylist(function (hasClear) {
                        angularPlayer.stop();
                    });
                }
            }


        }

        return directive;
    }
})();
(function () {
    angular.module("app.directives")
        .directive("members", membersDirective);

    function membersDirective() {
        var directive = {};
        directive.templateUrl = "app/shared/members/members.html";
        directive.restrict = "E";
        directive.controller = membersController;
        directive.controllerAs = "membersCtrl";
        directive.bindToController = true;

        membersController.$inject = ["$scope", "$rootScope", "$state", "dataService", "$location"];
        function membersController($scope, $rootScope, $state, dataService, $location) {
            var vm = this;
            vm.addMembersRoute = addMembersRoute;
            vm.swiper = {};
            $scope.effect = "slide";
            vm.loadMember = loadMember;

            function loadMember(slugName) {
                slugName = 'member_' + slugName;
                var index = -1;

                dataService.swiperData.some(function (obj, i) {
                    return obj.hash === slugName ? index = i : false;
                });

                if (index > -1) {
                    resetHeight();
                    $rootScope.slideTo(index);
                }
            }

            function resetHeight() {
                var swidth;
                if ($(window).outerWidth < 768) { swidth = 30; } else { swidth = 50; }
                $('member-page .swiper-slide').css({
                    'height': $(window).outerHeight() - $('#header').outerHeight() - swidth
                });
            }

            $scope.$watch(returnMembers, function () {
                init();
            })

            function init() {
                loadMembers();
            }

            function returnMembers() {
                return dataService.members;
            }

            function loadMembers() {
                vm.members = dataService.members;
            }

            function addMembersRoute(memberId) {
                $rootScope.membersRoute.push("member/" + memberId);
            }

            //init();
        }
        return directive;
    }
})();

(function () {
    angular.module("app.directives")
        .directive("stories", storiesDirective);

    function storiesDirective() {
        var directive = {};
        directive.templateUrl = "app/shared/stories/stories.html";
        directive.restrict = "E";
        directive.controller = storiesController;
        directive.controllerAs = "storiesCtrl";
        directive.bindToController = true;

        storiesController.$inject = ["$scope", "$location", "$rootScope", "$state", "$filter", "$document", "$timeout", "$translate", "dataService", "deviceDetector"];
        function storiesController($scope, $location, $rootScope, $state, $filter, $document, $timeout, $translate, dataService, deviceDetector) {
            var vm = this;
            vm.search = "";
            vm.locations = [];
            vm.selectLocation = selectLocation;
            vm.businesses = [];
            vm.selectBusiness = selectBusiness;
            vm.swiper = {};
            vm.filterByFounderName = filterByFounderName;
            vm.filterByCompanyName = filterByCompanyName;
            vm.clearFilters = clearFilters;
            vm.storyCount = 0;
            vm.filteredData = [];
            vm.filterStories = filterStories;
            vm.searchVal = searchVal;
            vm.onReadySwiper = onReadySwiper;
            $scope.effect = "slide";
            vm.addStoriesRoute = addStoriesRoute;
            vm.isMobile = deviceDetector.isMobile() && !deviceDetector.isTablet();

            function init() {
                loadLookups();
                loadStories();
            }

            $scope.$watch(returnStories, function (newVal) {
                if (newVal) {
                    init();
                }
            })

            function returnStories() {
                return dataService.stories;
            }

            function onReadySwiper(swiper) {



                $timeout(function () {

                    /*$('.left-arrow-child').show();
                    $('.right-arrow-child').show();*/

                    vm.swiper.on('slideChangeStart', function () {
                        $timeout(function () {

                            if (vm.swiper.activeIndex == 0) {
                                $('.left-arrow-child').hide();
                                $('.right-arrow-child').show();
                            }
                            // most right postion
                            else if ((vm.swiper.activeIndex + 3) >= vm.swiper.slides.length) {
                                //alert((vm.swiper.activeIndex + 1)*3);
                                //alert(vm.swiper.slides.length);
                                $('.left-arrow-child').show();
                                $('.right-arrow-child').hide();
                            }
                            // middle positions
                            else {
                                $('.left-arrow-child').show();
                                $('.right-arrow-child').show();
                            }
                        })
                    });


                    vm.swiper.on('onReachEnd', function () {
                        $timeout(function () {

                            $('.left-arrow-child').show();
                            $('.right-arrow-child').hide();
                        })
                    });

                    vm.swiper.on('onReachBeginning', function () {
                        $timeout(function () {

                            $('.left-arrow-child').hide();
                            $('.right-arrow-child').show();
                        })
                    });

                });
            }

            vm.pageNext = function () {
                vm.swiper.slideNext();
            }

            vm.pagePrev = function () {
                vm.swiper.slidePrev();
            }

            function getDefaultValue() {
                return {
                    id: 0,
                    value: $translate.instant("Common.All")
                };
            }

            function loadLookups() {
                var defaultValue = getDefaultValue();

                vm.locations = dataService.emirate;
                vm.locations.unshift(defaultValue)
                vm.businesses = dataService.activity;
                vm.businesses.unshift(defaultValue)

                vm.location = defaultValue;
                vm.business = defaultValue;
            }

            function loadStories() {
                vm.stories = dataService.stories;
                vm.filterStories();
                if (vm.stories.length > 0) {
                    //$rootScope.pageNext = $state.href('storyPage', { id: vm.stories[0].Id, lang: $rootScope.lang });
                }
            }

            function filterByFounderName() {
                if (vm.order == "publisher.name") {
                    vm.order = "-publisher.name";
                }
                else {
                    vm.order = "publisher.name";
                }
            }

            function filterByCompanyName() {
                if (vm.order == "publisher.company") {
                    vm.order = "-publisher.company";
                }
                else {
                    vm.order = "publisher.company";
                }
            }

            function clearFilters() {
                vm.order = "";
                var defaultValue = getDefaultValue();
                vm.location = defaultValue;
                vm.business = defaultValue;
                vm.search = "";
                vm.filterStories();
            }

            function filterStories(arr) {
                if (vm.stories !== undefined) {
                    var indexList = [];
                    if (arr) {
                        //vm.filteredData = arr;
                        arr.forEach(function (data) {
                            var index = vm.stories.indexOf(data);
                            if (index != -1) {
                                indexList.push(index);
                            }
                        });

                        vm.storyCount = arr.length;
                    } else {
                        vm.storyCount = vm.stories.length;
                    }

                    vm.stories.forEach(function (data, index) {
                        data.hideStory = false;

                        if (indexList.length > 0 && indexList.indexOf(index) == -1) {
                            data.hideStory = true;
                        }
                    });

                    $timeout(function () {
                        if (vm.swiper.update) {
                            vm.swiper.update(true);
                        }
                    });
                }
            };

            function searchVal() {
                filterRecord();
            }

            function selectLocation(location) {
                vm.location = location;
                filterRecord();
            }

            function filterRecord() {
                var filteredArr = [];
                var filter = {};
                filter.publisher = {};


                if (vm.location && vm.location.id != 0) {
                    filter.publisher.emirate = vm.location.id;
                }

                if (vm.business && vm.business.id != 0) {
                    filter.publisher.companyActivity = vm.business.id;
                }

                filteredArr = $filter("filter")(vm.stories, filter);
                if (vm.search) {
                    filteredArr = $filter("filter")(filteredArr, vm.search);
                }

                vm.filterStories(filteredArr);
            }

            function selectBusiness(business) {
                vm.business = business;
                filterRecord();
            }

            function addStoriesRoute(storyId) {
                $rootScope.storiesRoute.push("story/" + storyId);
            }

            //init();
        }

        return directive;
    }
})();

(function () {
    angular.module("app.directives").directive("storyPage", storyPageDirective);

    function storyPageDirective() {
        var directive = {};
        directive.templateUrl = "app/shared/storyPage/storyPage.html";
        directive.restrict = "E";
        directive.controller = storyController;
        directive.controllerAs = "storyCtrl";
        directive.bindToController = true;
        directive.scope = {
            storyDetail: "=",
            no: "@"
        };

        storyController.$inject = ["$scope", "$stateParams", "$location", "$state", "$rootScope", "utilService", "storyService", "$timeout", "deviceDetector", "dataService", "$linq"];
        function storyController($scope, $stateParams, $location, $state, $rootScope, utilService, storyService, $timeout, deviceDetector, dataService, $linq) {
            var vm = this;
            $scope.effect = "slide";
            vm.swiper = {};
            vm.isMobile = deviceDetector.isMobile() && !deviceDetector.isTablet();
            vm.onReadySwiper = onReadySwiper;
            $rootScope.hideUpArrow = true;

            function init() {
                loadStory();
            }

            /*$rootScope.$on('$locationChangeSuccess', function () {
                if ($location.url() === '/#stories') {
                    var enjoyhint_instance = new EnjoyHint({});
                    var enjoyhint_script_steps = [
                        {
                            'click #hint3': 'Click here to view more stories.'
                        },
                        {
                            'click #redefining_luxury_chocolates': 'Click here to view particular story.'
                            
                        }
                    ];
                    enjoyhint_instance.set(enjoyhint_script_steps);
                    enjoyhint_instance.run();
                } else if ($location.url() === '/#story_redefining_luxury_chocolates') {
                    var enjoyhint_instance = new EnjoyHint({});
                    var enjoyhint_script_steps = [
                        {
                            'click #down_2': 'Click here to know more about it.',
                            'shape': 'circle',
                            'radius': 40
                        },
                        {
                            'click #column-next': 'Click here to view questions & answers'
                        },
                        {
                            'click #question_2_1': 'Click here to view a different question'
                        },
                        {
                            'click #next_2': 'Click here to move to next story'
                        }
                    ];
                    enjoyhint_instance.set(enjoyhint_script_steps);
                    enjoyhint_instance.run();
                } else if ($location.url() === '/#story_powered_up') {
                    var enjoyhint_instance = new EnjoyHint({});
                    var enjoyhint_script_steps = [
                        {
                            'click .list-contents': 'Click here to open menu'
                        },
                        {
                            'click .members-tabs': 'Click here to view board members interviews'
                        },
                        {
                           'click .member-item-enjoy': 'Click here to view this particular interview'  
                        }
                    ];
                    enjoyhint_instance.set(enjoyhint_script_steps);
                    enjoyhint_instance.run();
                }
            });*/
            $scope.$watch(swiperWatch, function (newVal, oldVal) {
                init();
            })

            function swiperWatch() {
                return vm.swiper;
            }

            function onReadySwiper(swiper) {
                $timeout(function () {
                    vm.swiper.on('slideChangeEnd', function () {
                        $timeout(function () {
                            $rootScope.pageIndex.column = vm.swiper.activeIndex + 1;
                            $rootScope.hideUpArrow = swiper.activeIndex == 0 ? true : false;
                            //  $rootScope.hideDownArrow = swiper.isEnd;
                        })
                    });

                });
            }

            function loadStory() {
                var storyId = $stateParams.id;

                $scope.$watch(function () {
                    return vm.storyDetail
                }, function (newValue, oldValue) {
                    //$rootScope.pageIndex.row = vm.no;

                    var storyData = getStorySwiperData(newValue.storyId);
                    if (storyData.nestedSwipe) {
                        storyData.swiper = vm.swiper;
                    }

                    if (vm.storyDetail.storypages) {
                        vm.storyDetail.storypages.forEach(function (page) {
                            if (page.questions && page.questions.length > 0) {
                                page.activeQuestionIndex = 0;
                            }
                        });
                    }
                    else {
                        vm.storyDetail.storypages = [];
                    }
                });
            }

            function getStorySwiperData(storyId) {
                return $linq.Enumerable().From(dataService.swiperData).
                    Where(function (x) {
                        return x.storyId == storyId
                    }).FirstOrDefault();
            }

            vm.readStory = function () {
                vm.swiper.slideNext();
            }

            vm.slideUp = function () {
                vm.swiper.slidePrev();
            }

            vm.pageChange = function (page, index) {
                page.activeQuestionIndex = index;
            };

            //init();
        }

        return directive;
    }

})();
(function () {
    "use strict";
    angular.module("app.directives")
        .directive("shareNavBar", shareNavBar);

    /**
     * sharenav bar directive
     */
    function shareNavBar() {
        var directive = {};
        directive.templateUrl = "app/shared/share-nav-bar/share-nav-bar.html";
        directive.restrict = "E";
        directive.replace = true,
            directive.controller = shareNavBarController;
        directive.controllerAs = "shareNavCtrl";
        directive.bindToController = true;

        /**
         * Share nav bar controller
         */
        shareNavBarController.$inject = ["$scope", "$rootScope"];
        function shareNavBarController($scope, $rootScope) {
            var vm = this;
        }

        return directive;
    }

})();

(function () {
    "use strict";

    angular.module("app.controllers", ["app.constants"]);
})();
(function () {
    angular.module("app.controllers").controller("IndexController", indexController);
    indexController.$inject = ['$rootScope', '$scope', "$state", "dataService", "$filter", "$location", "$window", "$stateParams", "$timeout", "$translate", "ngMeta", "$sce", "allData","deviceDetector"];
    function indexController($rootScope, $scope, $state, dataService, $filter, $location, $window, $stateParams, $timeout, $translate, ngMeta, $sce, allData,deviceDetector) {
        var vm = this;
        $rootScope.isHome = true;
        vm.onReadySwiper = onReadySwiper;
        vm.isDataLoaded = false;
        vm.isMobile = deviceDetector.isMobile() && !deviceDetector.isTablet();
        function init() {
            if ($stateParams && $stateParams.lang) {
                $rootScope.lang = $stateParams.lang
            }
            $translate.use($rootScope.lang);
            //getAllData();     
            if (allData) {
                vm.stories = dataService.stories;
                vm.members = dataService.members;
                vm.isDataLoaded = true;
            }
        }

        function getAllData() {
            dataService.getAllData($rootScope.lang, function (data) {
                vm.stories = dataService.stories;
                vm.members = dataService.members;
                vm.isDataLoaded = true;
            }, function (message) {
            });
        }

        function onReadySwiper(swiper) {
            vm.swiper = swiper;
            //swiper.initObservers();
            //$rootScope.shareUrl = $location.absUrl().replace('#', '');
            swiper.on('slideChangeEnd', function (data) {
                // $rootScope.isLastSlide = data.isEnd;
                getSwiperData(data.activeIndex);
            });

            var images = vm.swiper.imagesToLoad.length;
            //$scope.$watch(function () {
            //    return vm.swiper.imagesLoaded;
            //}, function (newvalue, oldvalue) {

            //	var timeoutval = 200;
            //	if(vm.isMobile) {
            //		timeoutval = 200;
            //	}

            //	if (newvalue >= vm.swiper.imagesToLoad.length - 2) {

            //    	$timeout(function () {
            //            if (vm.swiper) {
            //                getSwiperData(vm.swiper.activeIndex);
            //            }
            //        },200);

            //	}

            //    if (newvalue >= vm.swiper.imagesToLoad.length) {

	           //     $timeout(function () {
	           //             // $rootScope.showSpinner = false;
	           //             $('.loader-container').fadeOut();
	           //             //  $rootScope.progressbar = ngProgressFactory.createInstance();
	           //             $rootScope.progressbar.complete();
	           //         },timeoutval);
            //	}
            //}) 
        }

        function getSwiperData(index) {
            var currentSlide = dataService.swiperData[index];
            $scope.currentSlide = currentSlide;
            $rootScope.isHome = currentSlide.isHome;
            $rootScope.hasPagination = currentSlide.hasPagination;
            $rootScope.hasMemberHome = currentSlide.hasMemberHome;
            $rootScope.nestedSwipe = currentSlide.nestedSwipe;
            $rootScope.pageIndex.row = currentSlide.index;
            $rootScope.pageIndex.column = 1;

          //  updateMetaModel(currentSlide.meta);
        }

        function updateMetaModel(meta) {
            //ngMeta.setTitle(meta.title);
            //ngMeta.setTag('og:title', meta.title);
            //ngMeta.setTag('og:description', meta.description);
            //ngMeta.setTag('og:secureImage', meta.image);
            //ngMeta.setTag('og:image', meta.image);

        /*    $rootScope.title = meta.title;
            $rootScope.text = meta.title;
            $rootScope.description = meta.description;
            $rootScope.media = meta.image;
            $rootScope.hashTags = 'KFED_Official';
            $rootScope.shareUrl = $location.absUrl().replace('#', '');*/
        }

        $rootScope.pagePrev = function () {
            vm.swiper.slidePrev();
        }

        $rootScope.pageNext = function () {
            vm.swiper.slideNext();
        }

        $rootScope.nextColumn = function () {
            $scope.currentSlide.swiper.slideNext();
        }

        $rootScope.prevColumn = function () {
            $scope.currentSlide.swiper.slidePrev();
        }

        $rootScope.slideTo = function (index) {
            vm.swiper.slideTo(index)
        }

        init();
    }
})();
(function () {
    "use strict";

    angular.module("app", [
        "ui.router",
        "ui.bootstrap",
        "ngAnimate",
        "ksSwiper",
        "angularSoundManager",
        "ngSanitize",
        "com.2fdevs.videogular",
        "com.2fdevs.videogular.plugins.controls",
        "com.2fdevs.videogular.plugins.overlayplay",
        "com.2fdevs.videogular.plugins.poster",
        "info.vietnamcode.nampnq.videogular.plugins.youtube",
        "ng.deviceDetector",
        "swipe",
        "ngScrollbars",
        "angular-cache",
        "offline",
        "pascalprecht.translate",
        "angular-linq",
        "ngMeta",
        "720kb.socialshare",
        "ngProgress",
        /* Shared modules */
        "app.core",
        "app.filter",
        "app.service",
        "app.directives",
        "app.controllers"
    ]).run(appRun);

    appRun.$inject = ["$rootScope", "appConfig", "$document", "$state", "$timeout", "deviceDetector", 'connectionStatus', 'offline', '$http', '$cacheFactory', 'CacheFactory', '$translate', '$location', 'ngMeta', '$window', 'ngProgressFactory']
    function appRun($rootScope, appConfig, $document, $state, $timeout, deviceDetector, connectionStatus, offline, $http, $cacheFactory, CacheFactory, $translate, $location, ngMeta, $window, ngProgressFactory) {

        ngMeta.init();
        $rootScope.appConfig = appConfig;
        $rootScope.lang = 'en';
         $rootScope.showSpinner = true;
       // $('body').append('<div class="loader-container" style="display:block;"><div class="abs_center"><h1 class="text-uppercase">Test</h1><div class="loading"><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div></div > </div> </div>');

        $rootScope.device = deviceDetector.device;
        $rootScope.isMobile = deviceDetector.isMobile() && !deviceDetector.isTablet();
        $rootScope.removeReverse = function () {
            $document.find("main.container").removeClass("reverse");
        }

        $rootScope.addReverse = function () {
            $document.find("main.container").addClass("reverse");
        }

        $rootScope.hasPagination = false;
        $rootScope.hasMemberHome = false;
        $rootScope.pageIndex = {
            row: 1,
            column: 1,
        }
        $rootScope.prevColumn;
        $rootScope.nextColumn;

        $rootScope.isOnline = true;
        $rootScope.isRetry = false;
        $rootScope.connectionStatus = "";
        $rootScope.storiesRoute = [];
        $rootScope.membersRoute = [];
       // $rootScope.updateMetaModel = updateMetaModel;

        //$rootScope.title = "Khalifa fund";
        //$rootScope.text = "Khalifa fund";
        //$rootScope.description = "Khalifa Fund for Enterprise Development was launched on 3 June 2007 to help develop local enterprises in Abu Dhabi, with a total capital investment of AED 2 billion.";
        //$rootScope.media = "http://kf.cpibusiness.net/angularv3/assets/img/landing-page-bg.jpg";
        //$rootScope.hashTags = "KFED_Official";

        $http.defaults.cache = $cacheFactory('custom');
        offline.stackCache = CacheFactory.createCache('my-cache', {
            storageMode: 'localStorage'
        });
        offline.start($http);
        connectionStatus.$on('online', function () {
            $rootScope.isOnline = true;
            $rootScope.isRetry = false;
            $rootScope.connectionStatus = "Your device is connected to internet.";
            offline.processStack();
            $timeout(function () {
                $rootScope.connectionStatus = "";
            }, 3000);
        });

        connectionStatus.$on('offline', function () {
            $rootScope.isOnline = false;
            $rootScope.connectionStatus = "Your device lost its internet connection.";
            offline.processStack();
            $timeout(retryConnection, 3000);
        });

        function retryConnection() {
            if (!$rootScope.isOnline) {
                $rootScope.isRetry = true;
                $rootScope.connectionStatus = "Attempting to reconnect....";
            }
        }

        $rootScope.$on('$locationChangeSuccess', function () {
            $rootScope.shareUrl = $location.absUrl();
        });

        function updateMetaModel(meta) {
            //ngMeta.setTitle(meta.title);
            //ngMeta.setTag('og:title', meta.title);
            //ngMeta.setTag('og:description', meta.description);
            //ngMeta.setTag('og:secureImage', meta.image);
            //ngMeta.setTag('og:image', meta.image);
            /*if (meta) {
                $rootScope.title = meta.title;
                $rootScope.text = meta.title;
                $rootScope.description = meta.description;
                $rootScope.media = meta.image;
                $rootScope.hashTags = 'KFED_Official';
            }*/
        }

        //var origin = $window.location.origin;
        //var path = $window.location.pathname.length > 1 ? $window.location.pathname : '';
        //var pathName = origin + path;
        //var meta = {
        //    title: "Khalifa Fund",
        //    description: "10 years journey of delivering success",
        //    image: pathName + "/assets/img/landing-page-bg.jpg",
        //}

        //updateMetaModel(meta);



        ////$rootScope.$on("$stateChangeSuccess", stateChangeSuccess);
        ////function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {            
        ////    if (toParams && toParams.lang && toParams.lang != $rootScope.lang) {
        ////        $rootScope.lang = toParams.lang;
        ////        $translate.use($rootScope.lang);
        ////    }            
        ////}

        ////function triggerButton(elementId) {
        ////    var e = $document.find(elementId);
        ////    if (e && e.length > 0) {
        ////        $timeout(function () {
        ////            if (!$rootScope.nestedSwipe) {
        ////                var result = angular.element(e).triggerHandler("click");
        ////                if (result == undefined) {
        ////                    $(e).click();
        ////                }
        ////            }
        ////        }, 0);
        ////    }
        ////}

        ////$document.bind("keydown", function (e) {
        ////    if (e.keyCode == 39) {
        ////        triggerButton("#page-next");
        ////    }
        ////    else if (e.keyCode == 37) {
        ////        triggerButton("#page-previous");
        ////    }
        ////});

        $rootScope.progressbar = ngProgressFactory.createInstance();
        $rootScope.progressbar.setColor('#6dbe48');
        $rootScope.progressbar.setHeight('5px');
        $rootScope.progressbar.start();
      

    }
})();

