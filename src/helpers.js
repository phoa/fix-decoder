import 'whatwg-fetch';

/**
 * fetch
 */
export function request(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(readXml)
    .catch((error) => ({ error }));
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;

  throw error;
}

function readXml (response) {
  return response.text();
}

/**
 * Parse XML to JSON
 * https://davidwalsh.name/convert-xml-json
 * @param  {[type]} xml [description]
 * @return {[type]}     [description]
 */

export function xmlToJson(xml) {

  // Create the return object
  var obj = {};

  const fieldsNodes = xml.getElementsByTagName('fields');
  if (fieldsNodes.length > 0) {
    const fieldsNode = fieldsNodes[0];
    // const childNodesLength = xml.childNodes.length;
    obj.fields = {};

    // get <fields> element
    const fieldNodes = fieldsNode.getElementsByTagName('field');
    const fieldNodesLength = fieldNodes.length;

    for(let i = 0; i < fieldNodesLength; i++) {
      // loop <fields> children

      // get <field> element
      const field = fieldNodes[i];
      // const nodeName = field.nodeName;
      const number = field.getAttribute('number');
      const fieldAttributesLength = field.attributes.length;

      obj.fields[number] = {}
      for (let j = 0; j < fieldAttributesLength; j++) {
        // loop <field> attributes
        const attribute = field.attributes.item(j);
        obj.fields[number][attribute.nodeName] = attribute.nodeValue;
      }

      const valueNodes = field.getElementsByTagName('value');
      const valueNodesLength = valueNodes.length;

      if (valueNodesLength > 0) {
        obj.fields[number]['values'] = {};
        for (let k = 0; k < valueNodesLength; k++) {
          // loop <field> children

          // get <value> field
          const value = valueNodes[k];
          const enumAttribute = value.getAttribute('enum');
          const valueAttributesLength  = value.attributes.length;

          obj.fields[number]['values'][enumAttribute] = {};
          for (let l = 0; l < valueAttributesLength; l++) {
            // loop <field> attributes
            const attribute = value.attributes.item(l);
            obj.fields[number]['values'][enumAttribute][attribute.nodeName] = attribute.nodeValue;
          }
        }
      }
    }
  }

  // if (xml.nodeType === 1) { // element
  //   // do attributes
  //   if (xml.attributes.length > 0) {
  //   obj["@attributes"] = {};
  //     for (var j = 0; j < xml.attributes.length; j++) {
  //       var attribute = xml.attributes.item(j);
  //       obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
  //     }
  //   }
  // }
  // // else if (xml.nodeType === 3) { // text
  // //   obj = xml.nodeValue;
  // // }

  // // do children
  // if (xml.hasChildNodes()) {

  //   for(var i = 0; i < xml.childNodes.length; i++) {
  //     var item = xml.childNodes.item(i);
  //     var nodeName = item.nodeName;

  //     // only process node name "fields"
  //     if (nodeName !== '#text') {
  //       if (typeof(obj[nodeName]) === "undefined") {
  //         obj[nodeName] = xmlToJson(item);
  //       } else {
  //         if (typeof(obj[nodeName].push) === "undefined") {
  //           var old = obj[nodeName];
  //           obj[nodeName] = [];
  //           obj[nodeName].push(old);
  //         }
  //         obj[nodeName].push(xmlToJson(item));
  //       }
  //     }

  //   }
  // }
  return obj;
};

// export function xmlToJson(xml) {

//   // Create the return object
//   var obj = {};

//   if (xml.nodeType === 1) { // element
//     // do attributes
//     if (xml.attributes.length > 0) {
//     obj["@attributes"] = {};
//       for (var j = 0; j < xml.attributes.length; j++) {
//         var attribute = xml.attributes.item(j);
//         obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
//       }
//     }
//   } else if (xml.nodeType === 3) { // text
//     obj = xml.nodeValue;
//   }

//   // do children
//   if (xml.hasChildNodes()) {
//     for(var i = 0; i < xml.childNodes.length; i++) {
//       var item = xml.childNodes.item(i);
//       var nodeName = item.nodeName;
//       if (typeof(obj[nodeName]) === "undefined") {
//         obj[nodeName] = xmlToJson(item);
//       } else {
//         if (typeof(obj[nodeName].push) === "undefined") {
//           var old = obj[nodeName];
//           obj[nodeName] = [];
//           obj[nodeName].push(old);
//         }
//         obj[nodeName].push(xmlToJson(item));
//       }
//     }
//   }
//   return obj;
// };
