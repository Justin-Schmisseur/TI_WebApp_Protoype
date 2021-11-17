const idMainPropMap = {
  network_protocolversion_1: "NCP:ProtocolVersion",
  ncp_version_1: "NCP:Version",
  ncp_interfacetype_1: "NCP:InterfaceType",
  ncp_hardwareaddress_1: "NCP:HardwareAddress",
  ncp_ccathreshold_1: "NCP:CCAThreshold",
  ncp_txpower_1: "NCP:TXPower",
  ncp_region_1: "NCP:Region",
  ncp_modeid_1: "NCP:ModeID",
  unicastchlist_1: "unicastchlist",
  broadcastchlist_1: "broadcastchlist",
  asynchchlist_1: "asyncchlist",
  chspacing_1: "chspacing",
  ch0centerfreq_1: "ch0centerfreq",
  network_panid_1: "Network:Panid",
  bcdwellinterval_1: "bcdwellinterval",
  ucdwellinterval_1: "ucdwellinterval",
  bcintervall_1: "bcinterval",
  ucchfunction_1: "ucchfunction",
  bcchfunction_1: "bcchfunction",
  macfiltermode_1: "macfiltermode",
  network_nodetype_1: "Network:NodeType",
  network_name_1: "Network:Name"
};
const idStartPropMap = {
  interfaceup_1: "Interface:Up",
  stackup_1: "Stack:Up"
}
const idOtherPropMap = {
  get_numconnecteddevices_1: "numconnected",
  get_connecteddevices_1: "connecteddevices",
  get_dodagroute_1: "dodagroute",
  get_ipv6alladdresses_1: "IPv6:AllAddresses",
  get_macfilterlist_1: "macfilterlist"
}
function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

const webserverPath = "http://localhost:8000";
let br_connection_status, propValues;
let noUpdateProps = [];

/********* Filling in Properties every 15s *********/
setInterval(function () {
  getProps();
}, 1000);

/********** Backend setProp and getProps *************/
function setProp(property, newValue) {
  fetch(
    webserverPath + "/setProp?property=" + property + "&newValue=" + newValue
  );
}

async function getProps() {
  const response = await fetch(webserverPath + "/getProps");
  propValues = await response.json();
  fillInMainProps();
  fillInStartProps()
  fillInOtherProps()
}

/************** Main Prop Handling ******************/
// Handles clicking inside and outside of textboxes
window.addEventListener("click", function (e) {
  for (let id in idMainPropMap) {
    const _id = "#" + id, prop = idMainPropMap[id];
    // if clicked on textbox
    if (e.target.parentNode.id == id) {
      // Reset text for user to type into
      $(_id).val("");
      // Add prop to noUpdateProps so it doesn't auto-update while user is typing
      noUpdateProps.push(prop);
    }
    // if clicked outside textbox
    else {
      if ($(_id).val() === "") {
        // Set value to the default
        $(_id).val(propValues[prop]);
        // Remove item from noUpdateProps so it can update next time
        noUpdateProps = noUpdateProps.filter((item) => item !== prop);
      }
    }
  }
});

// When save button is pressed, all changed properties are set to new values
function setMainProps() {
  for (let index in noUpdateProps) {
    const prop = noUpdateProps[index],
      _id = "#" + getKeyByValue(idMainPropMap, prop);
    // Set the property to the user specified value
    setProp(prop, $(_id).val());
  }
  // Reset noUpdateProps
  noUpdateProps = [];
}

//When get button is pressed, all changed properties are refreshed to old values
function getMainProps() {
  noUpdateProps = [];
  fillInMainProps();
}

function fillInMainProps() {
//   console.log(noUpdateProps.length);
  for (let id in idMainPropMap) {
    const _id = "#" + id, prop = idMainPropMap[id];
    // If property isn't in noUpdateProps then update it
    if (!noUpdateProps.includes(prop)) {
        $(_id).val(propValues[prop]);
    }
  }
}

/********* Start Prop Handling ***********/
function fillInStartProps() {
    for (let id in idStartPropMap) {
        // Turn lights for interface:up and stack:up on or off depending on their states
        const _id = "#" + id, prop = idStartPropMap[id];
        $(_id).prop('on', propValues[prop] == 'true')
    }
}

// Used for set and reset buttons
function setStartProps(onOrOff) {
    for (let id in idStartPropMap) {
        prop = idStartPropMap[id];
        setProp(prop, onOrOff)
    }
}

/************ Other Prop Handling ************/
function fillInOtherProps() {
  for (let id in idOtherPropMap) {
    const _id = "#" + id, prop = idOtherPropMap[id];
    // If property isn't in noUpdateProps then update it
    if (prop == "numconnected") {
        $(_id).val(propValues[prop]);
    } else {
        const propArray = propValues[prop]
        let labelString = ''
        for (let item in propArray) {
            labelString += propArray[item] + '|'
        }
        $(_id).prop('labels', labelString)
    }
  }
}


/******* Cytoscape stuff ************/
var cy;

function update_coap_node_panel_by_node(node) {}

const initCytoscape = async () => {
  const ti_gray = "#555555";
  const ti_blue = "#007C8C";
  const ti_red = "#CC0000";
  const ti_stylesheet = [
    {
      selector: "node",
      style: {
        "background-color": ti_gray,
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": ti_gray,
        "target-arrow-color": ti_gray,
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
    {
      selector: "node:selected",
      style: {
        "background-color": ti_blue,
      },
    },
  ];
  cy = cytoscape({
    container: document.getElementById("cy"),
    id: "wisun_network",
    elements: { nodes: [], edges: [] },
    layout: {
      name: "breadthfirst",
    },
    wheelSensitivity: 0.1,
    style: ti_stylesheet,
  });

  cy.on("click", "node", (e) => {
    const node = e.target;
    // templateObj.$.id.value = node.data("id");
    // templateObj.$.name.value = node.data("label");
    templateObj.$.ip_address.value = node.data("id");
    // when user clicks on a particular node
    // update LEDS to represent state from the json file
    //  the node data || false pattern ensures the value is never undefined
    templateObj.$.led_state_red.value = node.data("rled_state") || false;
    templateObj.$.led_state_green.value = node.data("gled_state") || false;
    templateObj.$.toggle_led_red.value = node.data("rled_state") || false;
    templateObj.$.toggle_led_green.value = node.data("gled_state") || false;
  });

  function updateLayout(e) {
    let layout = cy.layout({ name: "breadthfirst" });
    layout.run();
  }
  cy.on("add", updateLayout);
  cy.on("remove", updateLayout);
  async function updateCytoscape() {
    const response = await fetch(webserverPath + "/topology");
    const data = await response.json();
    cy.json({ elements: data });
  }

  async function updateGWBringup() {
    const response = await fetch(webserverPath + "/gw_bringup");
    br_connection_status = await response.json();
    //console.log(br_connection_status)
    if (br_connection_status) {
      // console.log("br connected");
      document.getElementById("gw_bringup_label").label = "";
    } else {
      // console.log("br not connected");
      document.getElementById("gw_bringup_label").label =
        "Please connect a border router";
    }
  }

  async function update_topology() {
    //if these arn't together the "connect br " label appears before topology updates
    await updateCytoscape();
    await updateGWBringup();
  }

  update_topology().catch((e) => console.log(e));
  setInterval(update_topology, 2000);
};

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

async function post_json(url, obj) {
  try {
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    };
    let response_raw = await fetch(url, options);
    const response = await response_raw.json();
    return response;
  } catch (e) {
    console.log(e);
  }
}

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

      async function propogate_led_state() {
        let ip_address = templateObj.$.ip_address.value;
        let current_node =
          cy.$(`[id = "${ip_address}"]`) && cy.$(`[id = "${ip_address}"]`)[0];
        update_coap_node_panel_by_node(current_node);

        if (ip_address.length === 0) {
          return;
        }
        const data = {
          ip_address,
          rled_state: templateObj.$.toggle_led_red.value,
          gled_state: templateObj.$.toggle_led_green.value,
        };
        const { success } = await post_json(webserverPath + "/led", data);
        templateObj.$.led_state_red.value = templateObj.$.toggle_led_red.value;
        templateObj.$.led_state_green.value =
          templateObj.$.toggle_led_green.value;
      }
      templateObj.$.toggle_led_red.addEventListener(
        "click",
        propogate_led_state
      );
      templateObj.$.toggle_led_green.addEventListener(
        "click",
        propogate_led_state
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
