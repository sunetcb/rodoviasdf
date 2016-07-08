 // Initialise some variables
	    var directionsService = new google.maps.DirectionsService();
	    var num, map, data;
	    var requestArray = [], renderArray = [];

	    // A JSON Array containing some people/routes and the destinations/stops



	    var jsonArray = {
	       "DF001": [("-15.885216, -48.059539"), ("-15.961196, -48.025033"), ("-15.925645, -47.830672"), ("-15.867529, -47.821343"), ("-15.726126, -47.790540"), ("-15.581818, -48.016418"), ("-15.885216, -48.059539")],
	       "DF002": [("-15.860265, -47.934780"), ("-15.732868, -47.893459")],
	       "DF003": [("-15.688032, -47.858485"), ("-15.969965, -47.991038")],
	       "DF004": [("-15.845456, -47.926902"), ("-15.826644, -47.888193"), ("-15.733750, -47.897083"), ("-15.771947, -47.863954"), ("-15.845322, -47.926407")],
	       "DF005": [("-15.792660, -47.783015"), ("-15.721739, -47.884161")],
	       "DF006": [("-15.715653, -47.882081"), ("-15.711938, -47.889420"), ("-15.719115, -47.896328")],
	       "DF007": [("-15.732087, -47.893689"), ("-15.714121, -47.899281"), ("-15.714537, -47.899646"), ("-15.732221, -47.893812")],
	       "DF009": [("-15.724533, -47.906211"), ("-15.725335, -47.897689"), ("-15.726898, -47.873788"), ("-15.769944, -47.832703"), ("-15.724751, -47.899741")],
	       "DF010": [("-15.784255, -47.909867"), ("-15.771307, -47.909759"), ("-15.756017, -47.930191"), ("-15.783480, -47.978837")],
	       "DF011": [("-15.810551, -47.946160"), ("-15.810551, -47.946160"), ("-15.791391, -47.911510"), ("-15.810376, -47.945973")],
	       "DF015": [("-15.758615, -47.778956"), ("-15.757684, -47.812442")],
	       "DF025": [("-15.874184, -47.955850"), ("-15.861834, -47.936123"), ("-15.830491, -47.874130"), ("-15.856019, -47.859344"), ("-15.806642, -47.798103"), ("-15.834869, -47.823257"), ("-15.858880, -47.867691"), ("-15.830911, -47.870398"), ("-15.874553, -47.957489")],
	       "DF027": [("-15.834364, -47.824783"), ("-15.848641, -47.815449")],
	       "DF035": [("-15.863781, -47.820913"), ("-15.843610, -47.850430")],
	       "DF047": [("-15.851386, -47.932392"), ("-15.851577, -47.932295")],
	       "DF051": [("-15.840451, -47.953964"), ("-15.845181, -47.931957")],
	       "DF055": [("-15.981086, -47.924782"), ("-15.981086, -47.924782")],
	       "DF065": [("-15.946306, -47.993542"), ("-15.965893, -48.020674")],
	       "DF075": [("-15.863200, -47.959179"), ("-15.875501, -48.028786")],
	       "DF079": [("-15.875330, -47.989806"), ("-15.875330, -47.989806")],
	       "DF085": [("-15.832007, -48.050309"), ("-15.810208, -47.948326")],
	       "DF087": [("-15.813568, -47.999987"), ("-15.786472, -47.997296")],
	       "DF095": [("-15.791994, -48.052380"), ("-15.786622, -47.944243")],
	       "DF097": [("-15.783846, -47.979313"), ("-15.785365, -47.980859")]
	     }
	 			
	     console.log(jsonArray);
	        
	    // 25 Standard Colours for navigation polylines
	    var colourArray = ['#D89B26', '#710CA5', '#3DDE8D', '#D83216', '#003AA5', '#A9DE2D', '#D80C71', '#1A93A5', '#DEC923', '#78FFDD', '#D87150', '#8B3318', '#8B073D', '#158B1B', '#35D83E', '#4E68D8', '#FFDC75', '#FF632B', '#42E597', '#4281E5', '#EFBF0C', '#EF09B1', '#EF1B09', '#918EE5', '#E5D88E'];

	    // Let's make an array of requests which will become individual polylines on the map.
	    function generateRequests(){

	        requestArray = [];

	        for (var route in jsonArray){
	            // This now deals with one of the people / routes

	            // Somewhere to store the wayoints
	            var waypts = [];
	            
	            // 'start' and 'finish' will be the routes origin and destination
	            var start, finish
	            
	            // lastpoint is used to ensure that duplicate waypoints are stripped
	            var lastpoint

	            data = jsonArray[route]

	            limit = data.length
	            for (var waypoint = 0; waypoint < limit; waypoint++) {
	                if (data[waypoint] === lastpoint){
	                    // Duplicate of of the last waypoint - don't bother
	                    continue;
	                }
	                
	                // Prepare the lastpoint for the next loop
	                lastpoint = data[waypoint]

	                // Add this to waypoint to the array for making the request
	                waypts.push({
	                    location: data[waypoint],
	                    stopover: true
	                });
	            }

	            // Grab the first waypoint for the 'start' location
	            start = (waypts.shift()).location;
	            // Grab the last waypoint for use as a 'finish' location
	            finish = waypts.pop();
	            if(finish === undefined){
	                // Unless there was no finish location for some reason?
	                finish = start;
	            } else {
	                finish = finish.location;
	            }

	            // Let's create the Google Maps request object
	            var request = {
	                origin: start,
	                destination: finish,
	                waypoints: waypts,
	                travelMode: google.maps.TravelMode.DRIVING
	            };

	            // and save it in our requestArray
	            requestArray.push({"route": route, "request": request});
	        }



	        processRequests();
	    }

	    function processRequests(){

	        // Counter to track request submission and process one at a time;
	        var i = 0;

	        // Used to submit the request 'i'
	        function submitRequest(){
	            directionsService.route(requestArray[i].request, directionResults);
	        }

	        // Used as callback for the above request for current 'i'
	        function directionResults(result, status) {
	            if (status == google.maps.DirectionsStatus.OK) {
	                
	                // Create a unique DirectionsRenderer 'i'
	                renderArray[i] = new google.maps.DirectionsRenderer();
	                renderArray[i].setMap(map);

	                // Some unique options from the colorArray so we can see the routes
	                renderArray[i].setOptions({
	                    preserveViewport: true,
	                    suppressInfoWindows: true,
	                    polylineOptions: {
	                        strokeWeight: 4,
	                        strokeOpacity: 1,
	                        strokeColor: colourArray[i]
	                    },
	                    markerOptions:{
	                         icon: url='http://stat.correioweb.com.br/cbonline/rodovias/img/high-beam2.png'
	                     }
	                });

	                // Use this new renderer with the result
	                renderArray[i].setDirections(result);
	                // and start the next request
	                nextRequest();
	            }

	        }

	        function nextRequest(){
	            // Increase the counter
	            i++;
	            // Make sure we are still waiting for a request
	            if(i >= requestArray.length){
	                // No more to do
	                return;
	            }
	            // Submit another request
	            submitRequest();
	        }

	        // This request is just to kick start the whole process
	        submitRequest();
	    }

	    // Called Onload
	    function init() {

	        // Some basic map setup (from the API docs) 
	        var mapOptions = {
	            center: new google.maps.LatLng(-15.810139, -47.945982),
	            zoom: 11,
	            mapTypeControl: false,
	            streetViewControl: false,
	            mapTypeId: google.maps.MapTypeId.ROADMAP
	        };


	     	// Create an array of styles.
			var styles = [
			  {
			    stylers: [
			      { hue: "#cccccc" },
			      { saturation: -100 }
			    ]
			  },{
			    featureType: "road.local",
			    elementType: "geometry",
			    stylers: [
			      { lightness: 0 },
			      { visibility: "simplified" }
			    ]
			  },{
			    featureType: "road.local",
			    elementType: "labels.text",
			    stylers: [
			      { visibility: "on" }
			    ]
			  }
			];

			            
	        map = new google.maps.Map(document.getElementById('map'), mapOptions);

	        map.setOptions({styles: styles});

	        // Start the request making
	        generateRequests()
	    };



	    // Get the ball rolling and trigger our init() on 'load'
	    google.maps.event.addDomListener(window, 'load', init);