const webserverPath = 'http://localhost:8000'
let br_connection_status

setInterval(updateStatus, 1000)

async function updateStatus(){
    const response = await fetch(webserverPath+'/gw_bringup')
    br_connection_status = await response.json()
    //console.log(br_connection_status)
    
    if(br_connection_status)
    {
        console.log("br connected")
        document.getElementById('gw_bringup_label').label = ""
    }
    else
    {
        console.log("br not connected")
        document.getElementById('gw_bringup_label').label = "Please connect a border router"
    }
    
}

const initCytoscape = async () => {
    const response = await fetch('http://127.0.0.1:8000/public/data.json');
    const data = await response.json();

    const cy = cytoscape({
        container: document.getElementById('cy'),
        id: 'wisun_network',
        elements: data.elements,
        layout: {
            'name': 'breadthfirst'
        },
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(label)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ],
    });

    cy.nodes().on('click', e => {
        const node = e.target;
        templateObj.$.id.value   = node.data('id');
        templateObj.$.name.value = node.data('label');
        templateObj.$.ipaddr.value = node.data('ipaddr');
        templateObj.$.iftype.value = node.data('iftype');
        templateObj.$.hwaddr.value = node.data('hwaddr');
        templateObj.$.chspace.value = node.data('chspace');
        
        
        // initialize to false in case no data exists yet in json file
        templateObj.$.led_state_red.value = false;
        templateObj.$.led_state_green.value = false;
        templateObj.$.toggle_led_red = false;
        templateObj.$.toggle_led_green = false;
        
        // when user clicks on a particular node
        // update LEDS to represent state from the json file
        templateObj.$.led_state_red.value = node.data('rled_state');
        templateObj.$.led_state_green.value = node.data('gled_state');
        templateObj.$.toggle_led_red = node.data('rled_state');
        templateObj.$.toggle_led_green = node.data('gled_state');
    
        // http fetch command
        // await fetch('http://127.0.0.1:8000/data.json');
    });

    return cy;
};

// every 500 milliseconds, first call the JS function to
// update the JSON file, then rerender the graph
function intervalFunc() {
  console.log('Calling init cytoscape again using new data');
  initCytoscape();
 
}

//setInterval(intervalFunc, 500);


var initComplete = false;
var templateObj;

// Wait for DOMContentLoaded event before trying to access the application template
var init = function() {
    templateObj = document.querySelector('#template_obj');

    // Wait for the template to fire a dom-change event to indicate that it has been 'stamped'
    // before trying to access components in the application.
	templateObj.addEventListener('dom-change',function(){
	    if (initComplete) return;
	    
	    this.async(() => {
            initComplete = true;
            initCytoscape();
            
            templateObj.$.toggle_led_red.addEventListener('click', function(event)
            {
                // this will trigger whenever toggle_led_red changes state
                
                console.log("Change value of toggle LED red");

                var data = {
                    id: templateObj.$.id.value,
                    name: templateObj.$.name.value,
                    ipaddr: templateObj.$.ipaddr.value,
                    iftype: templateObj.$.iftype.value,
                    hwaddr: templateObj.$.hwaddr.value,
                    chspace: templateObj.$.chspace.value,
                    rled_state: templateObj.$.led_state_red.value,
                    gled_state: templateObj.$.led_state_green.value
                    
                };
                var options = {
                 method: "POST",
                 headers:{
                     'Content-Type':'application/json'
                 },
                 body: JSON.stringify(data)
                };
                console.log("Calling the fetch");
                var response = fetch('http://127.0.0.1:8000/rled', options);
            });
            
            templateObj.$.toggle_led_green.addEventListener('click', function(event)
            {
                // this will trigger whenever toggle_led_red changes state
                
                console.log("Change value of toggle LED green");

                var data = {
                    id: templateObj.$.id.value,
                    name: templateObj.$.name.value,
                    ipaddr: templateObj.$.ipaddr.value,
                    iftype: templateObj.$.iftype.value,
                    hwaddr: templateObj.$.hwaddr.value,
                    chspace: templateObj.$.chspace.value,
                    rled_state: templateObj.$.led_state_red.value,
                    gled_state: templateObj.$.led_state_green.value
                    
                };
                var options = {
                 method: "POST",
                 headers:{
                     'Content-Type':'application/json'
                 },
                 body: JSON.stringify(data)
                };
                console.log("Calling the fetch");
                var response = fetch('http://127.0.0.1:8000/gled', options);
            });
        }, 1);
	});
};

templateObj = document.querySelector('#template_obj');
if (templateObj) {
    init();
} else {
    document.addEventListener('DOMContentLoaded',init.bind(this))
}