const idPropMap = {
    network_protocolversion_1: 'NCP:ProtocolVersion',
    ncp_version_1: 'NCP:Version',
    ncp_interfacetype_1: 'NCP:InterfaceType',
    ncp_hardwareaddress_1: 'NCP:HardwareAddress',
    ncp_ccathreshold_1: 'NCP:CCAThreshold',
    ncp_txpower_1: 'NCP:TXPower',
    ncp_region_1: 'NCP:Region',
    ncp_modeid_1: 'NCP:ModeID',
    unicastchlist_1: 'unicastchlist',
    broadcastchlist_1: 'broadcastchlist',
    asynchchlist_1: 'asyncchlist',
    chspacing_1: 'chspacing',
    ch0centerfreq_1: 'ch0centerfreq',
    network_panid_1: 'Network:Panid',
    bcdwellinterval_1: 'bcdwellinterval',
    ucdwellinterval_1: 'ucdwellinterval',
    bcintervall_1: 'bcinterval',
    ucchfunction_1: 'ucchfunction',
    bcchfunction_1: 'bcchfunction',
    macfiltermode_1: 'macfiltermode',
    interfaceup_1: 'Interface:Up',
    stackup_1: 'Stack:Up',
    network_nodetype_1: 'Network:NodeType',
    network_name_1: 'Network:Name',
    get_numconnecteddevices_1: 'numconnected',
    get_connecteddevices_1: 'connecteddevices',
    get_dodagroute_1: 'dodagroute',
    get_ipv6alladdresses_1: 'IPv6:AllAddresses',
    get_macfilterlist_1: 'macfilterlist'
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const webserverPath = "http://localhost:8000";
let br_connection_status, propValues;

let noUpdateProps = []

// setInterval(updateStatus, 1000);

async function updateStatus() {
  const response = await fetch(webserverPath + "/gw_bringup");
  br_connection_status = await response.json();
  //console.log(br_connection_status)

  if (br_connection_status) {
    console.log("br connected");
    document.getElementById("gw_bringup_label").label = "";
  } else {
    console.log("br not connected");
    document.getElementById("gw_bringup_label").label =
      "Please connect a border router";
  }
}


/********* Filling in Properties *********/
// // Get properties and fillIn every 2s
// setInterval(getProps, 2000)
// // Update properties every 30s
// setInterval(updateProps, 30000)

setInterval(function() {
    getProps()
    updateProps()
}, 5000)


// Handles clicking inside and outside of textboxes
window.addEventListener('click', function(e){
    for(let id in idPropMap) {
        const _id = '#' + id, prop = idPropMap[id]

        // if clicked on textbox
        if (document.getElementById(id).contains(e.target)){
            // Reset text for user to type into
            $(_id).val('')
            // Add prop to noUpdateProps so it doesn't auto-update while user is typing
            noUpdateProps.push(prop)
        }
        // if clicked outside textbox
        else{
            if( $(_id).val() === '' ) {
                // Set value to the default
                $(_id).val(propValues[ prop ])
                // Remove item from noUpdateProps so it can update next time
                noUpdateProps = noUpdateProps.filter(item => item !== prop)
            } else {
                // setProp(prop,$(_id).val())
            }
        }
    }
});

// When save button is pressed, all changed properties are set to new values
function setMainProps() {
    for(let index in noUpdateProps) {
        const prop = noUpdateProps[index], _id = '#' + getKeyByValue(idPropMap, prop)
        // Set the property to the user specified value
        setProp(prop, $(_id).val())
    }
    // Reset noUpdateProps
    noUpdateProps = []
}

//When refresh button is pressed, all changed properties are refreshed to old values
function resetMainProps() {
    noUpdateProps = []
    fillIn()
}

function fillIn() {

    console.log(noUpdateProps.length)

    for(let id in idPropMap) {
        const _id = '#' + id, prop = idPropMap[id]
        // If property isn't in noUpdateProps then update it
        if(!noUpdateProps.includes(prop)) {
            if(_id == '#ncp_txpower_1') {
                console.log(propValues[prop])
            }
            $(_id).val(propValues[prop])
        }
    }
}

function setProp(property, newValue) {
    fetch(webserverPath + '/setProp?property=' + property + '&newValue=' + newValue)
}

async function getProps() {
  const response = await fetch(webserverPath + '/getProps')
  propValues = await response.json()
  console.log(propValues)
  fillIn()
}

function updateProps() {
  fetch(webserverPath + '/updateProps')
}
/*****************************************/


//******* Cytoscape stuff ************
const initCytoscape = async () => {
  const response = await fetch("http://127.0.0.1:8000/public/data.json");
  const data = await response.json();

  const cy = cytoscape({
    container: document.getElementById("cy"),
    id: "wisun_network",
    elements: data.elements,
    layout: {
      name: "breadthfirst",
    },
    style: [
      {
        selector: "node",
        style: {
          "background-color": "#666",
          label: "data(label)",
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
        },
      },
    ],
  });

  cy.nodes().on("click", (e) => {
    const node = e.target;
    templateObj.$.id.value = node.data("id");
    templateObj.$.name.value = node.data("label");
    templateObj.$.ipaddr.value = node.data("ipaddr");
    templateObj.$.iftype.value = node.data("iftype");
    templateObj.$.hwaddr.value = node.data("hwaddr");
    templateObj.$.chspace.value = node.data("chspace");

    // initialize to false in case no data exists yet in json file
    templateObj.$.led_state_red.value = false;
    templateObj.$.led_state_green.value = false;
    templateObj.$.toggle_led_red = false;
    templateObj.$.toggle_led_green = false;

    // when user clicks on a particular node
    // update LEDS to represent state from the json file
    templateObj.$.led_state_red.value = node.data("rled_state");
    templateObj.$.led_state_green.value = node.data("gled_state");
    templateObj.$.toggle_led_red = node.data("rled_state");
    templateObj.$.toggle_led_green = node.data("gled_state");

    // http fetch command
    // await fetch('http://127.0.0.1:8000/data.json');
  });

  return cy;
};

// every 500 milliseconds, first call the JS function to
// update the JSON file, then rerender the graph
function intervalFunc() {
  console.log("Calling init cytoscape again using new data");
  initCytoscape();
}

//setInterval(intervalFunc, 500);

function waitForElementToDisplay(selector, callback, checkFrequencyInMs) {
  (function loopSearch() {
    if (document.querySelector(selector) != null) {
      callback();
      return;
    } else {
      setTimeout(loopSearch, checkFrequencyInMs);
    }
  })();
}

waitForElementToDisplay(
  ".iron-selected #ping_iframe",
  () => {
    document.getElementById("ping_iframe").contentWindow.location.reload();
  },
  100
);

var initComplete = false;
var templateObj;

// Wait for DOMContentLoaded event before trying to access the application template
var init = function () {
  templateObj = document.querySelector("#template_obj");

  // Wait for the template to fire a dom-change event to indicate that it has been 'stamped'
  // before trying to access components in the application.
  templateObj.addEventListener("dom-change", function () {
    if (initComplete) return;

    this.async(() => {
      initComplete = true;
      initCytoscape();

      templateObj.$.toggle_led_red.addEventListener("click", function (event) {
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
          gled_state: templateObj.$.led_state_green.value,
        };
        var options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };
        console.log("Calling the fetch");
        var response = fetch("http://127.0.0.1:8000/rled", options);
      });

      templateObj.$.toggle_led_green.addEventListener(
        "click",
        function (event) {
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
            gled_state: templateObj.$.led_state_green.value,
          };
          var options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          };
          console.log("Calling the fetch");
          var response = fetch("http://127.0.0.1:8000/gled", options);
        }
      );
    }, 1);
  });
};

templateObj = document.querySelector("#template_obj");
if (templateObj) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init.bind(this));
}
