/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('resume', this.onResume, false);

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onResume: function() {
        app.resume();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if (id == 'deviceready') {
            app.launchApp();
        }
    },

    isOnline : function(callback) {
        var online = navigator.connection.type != Connection.NONE && navigator.onLine;
        if (!online) {
            navigator.notification.alert("Sudzy requires your mobile to be online, please connect and try again.", callback, "", "Retry");
        }
        return online;
    },

    launchApp: function() {
        var isOnline = app.isOnline(app.launchApp);
        if (!isOnline) {
            return;
        }

        if (typeof(ref) != "undefined") {
            ref.close();
        }
        ref = cordova.InAppBrowser.open('https://www.sudzy.co/register.html?app=true', '_blank', 'location=no,toolbar=no,hardwareback=yes');
        var interval = null;
        ref.addEventListener('loadstop', function() {
            ref.executeScript({ code: "setCordovaMobileApp()" }, function() { });
            ref.executeScript({ code: "getEmail()" },
                function( values ) {
                    var email = values[ 0 ];
                    if ( email && email != "" && email.indexOf("@") > -1) {
                        ref.executeScript({ code: "redirectPersonal('app/');" }, function() { });
                        intercom.registerIdentifiedUser({email: email})
                    }
                }
            );
            // Start an interval
            if (interval) {
                clearInterval(interval);
            }

            interval = setInterval(function() {
                ref.executeScript({ code: "setCordovaMobileApp()" }, function() { });
                ref.executeScript(
                    {
                        code: "getMessage()"
                    },
                    function( values ) {
                        app.processMessage(values);
                    })
            }, 2000);
        });
        console.log("facebook login");
        facebookConnectPlugin.activateApp(function() {}, function() {});
    },

    resume : function() {
        var isOnline = app.isOnline(app.resume);
        if (!isOnline) {
            return;
        }

        ref.executeScript({ code: "getEmail()" },
            function( values ) {
                var email = values[ 0 ];
                if ( email && email != "" && email.indexOf("@") > -1) {
                    ref.executeScript({ code: "refreshOrder();" }, function(values) { });
                }
            }
        );
    },

    processMessage: function(values) {
        if (!values || !values[0]) {
            return;
        }
        var m = values[0].split('|');
        switch(m[0]) {
            case 'clipboard':
                return cordova.plugins.clipboard.copy(m[1]);
            case 'url':
                return window.open(m[1], '_system');
        }
    }
};

app.initialize();
