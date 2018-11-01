import axios from "axios";
import * as xmlJs from "xml-js";

function getLocation(node: any): any {
  return {
    x: parseInt(node.attributes.X, 10) || undefined,
    y: parseInt(node.attributes.Y, 10) || undefined,
    w: parseInt(node.attributes.Width, 10) || undefined,
    h: parseInt(node.attributes.Height, 10) || undefined
  };
}

const BASIC_RULES = [
  ruleWindow,
  ruleUIRoot,
  ruleUIChildren,
  ruleChildren,
  ruleFormElement,
  ruleProperties,
  ruleUIElement,
  ruleFormRoot,
  ruleDataSources,
  ruleComponentBindings,
  ruleConfiguration,
  rulePropertyNames,
  ruleUnknownWarn
];

const UI_ELEMENT_RULES = [
  ruleVBox,
  ruleTab,
  ruleBox,
  ruleVSplit,
  ruleHSplit,
  ruleGrid,
  ruleFormSection,
  ruleUnknownWarn
];

function ruleRoot(node: any, context: any, rules: any[]) {
  node.elements.forEach((element: any) =>
    processNode(element, context, BASIC_RULES)
  );
  return node;
}

function ruleFormRoot(node: any, context: any, rules: any[]) {
  if (node.name === "FormRoot") {
    node.elements.forEach((element: any) => {
      processNode(element, context, BASIC_RULES);
    });
    return node;
  }
  return undefined;
}

function ruleWindow(node: any, context: any, rules: any[]) {
  if (node.name === "Window") {
    const uiNode = {
      type: node.name,
      props: {
        name: node.attributes.Title,
        id: node.attributes.Id
      },
      children: []
    };
    const newContext = { ...context, uiNode };
    node.elements &&
      node.elements.forEach((element: any) =>
        processNode(element, newContext, BASIC_RULES)
      );
    context.uiNode = uiNode;
    return node;
  }
  return undefined;
}

function ruleProperty(node: any, context: any, rules: any[]) {
  if(node.name === "Property") {
    context.collectProperties.push({
      id: node.attributes.Id,
      name: node.attributes.Name,
      entity: node.attributes.Entity,
      column: node.attributes.Column,
    })
    return node;
  }
  return undefined;
}

function ruleProperties(node: any, context: any, rules: any[]) {
  if(node.name === "Properties") {
    node.elements.forEach((element: any) => {
      processNode(element, context, [ruleProperty]);
    })
    return node;
  }
  return undefined;
}

function ruleStringPropertyName(node: any, context: any, rules: any[]) {
  if(node.name === "string") {
    const propertyTarget = context.collectFormChildren || context.uiNode.children;
    context.executeLater.push(() => {
      const foundProperty = context.collectProperties.find((property:any) => {
        return property.id === (node.elements[0] && node.elements[0].text);
      })
      if(foundProperty) {
        propertyTarget.push({
          type: 'FormField',
          props: {
            property: foundProperty
          },
          children: []
        });
      }
    })
    return node;
  }
  return undefined
}

function rulePropertyNames(node: any, context: any, rules: any[]) {
  if(node.name === "PropertyNames") {
    node.elements.forEach((element: any) => [
      processNode(element, context, [ruleStringPropertyName])
    ])
    return node;
  }
  return undefined;
}

function ruleUIRoot(node: any, context: any, rules: any[]) {
  if (node.name === "UIRoot") {
    processNode(node, context, UI_ELEMENT_RULES);
    return node;
  }
  return undefined;
}

function ruleUIChildren(node: any, context: any, rules: any[]) {
  if (node.name === "UIChildren") {
    node.elements.forEach((element: any) => {
      processNode(element, context, BASIC_RULES);
    });
    return node;
  }
  return undefined;
}

function ruleChildren(node: any, context: any, rules: any[]) {
  if (node.name === "Children") {
    node.elements.forEach((element: any) => {
      processNode(element, context, BASIC_RULES);
    });
    return node;
  }
  return undefined;
}

function ruleFormElement(node: any, context: any, rules: any[]) {
  if (node.name === "FormElement") {
    processNode(node, context, UI_ELEMENT_RULES);
    return node;
  }
  return undefined;
}

function ruleUIElement(node: any, context: any, rules: any[]) {
  if (node.name === "UIElement") {
    processNode(node, context, UI_ELEMENT_RULES);
    return node;
  }
  return undefined;
}

function ruleGrid(node: any, context: any, rules: any[]) {
  if (node.attributes.Type === "Grid") {
    const uiNode = {
      type: node.attributes.Type,
      props: {
        name: node.attributes.Name,
        id: node.attributes.Id,
        form: {
          type: "Form",
          props: {},
          children: []
        },
        table: {
          type: "Table",
          props: {},
          children: []
        },
        properties: [],
        ...getLocation(node)
      },
      children: []
    };
    context.uiNode.children.push(uiNode);

    const newContext = {
      ...context,
      collectFormChildren: uiNode.props.form.children,
      collectTableChildren: uiNode.props.table.children,
      collectProperties: uiNode.props.properties,
      uiNode
    };
    node.elements.forEach((element: any) => {
      processNode(element, newContext, BASIC_RULES);
    });

    return node;
  }
  return undefined;
}

function ruleVSplit(node: any, context: any, rules: any[]) {
  if(node.attributes.Type ==="VSplit") {
    const uiNode = {
      type: node.attributes.Type,
      props: {
        name: node.attributes.Name,
        id: node.attributes.Id,
        ...getLocation(node)
      },
      children: []
    }
    context.uiNode.children.push(uiNode);

    const newContext = { ...context, uiNode };
    node.elements.forEach((element: any) => {
      processNode(element, newContext, BASIC_RULES);
    });

    return node;    
  }
  return undefined;
}

function ruleHSplit(node: any, context: any, rules: any[]) {
  if(node.attributes.Type ==="HSplit") {
    const uiNode = {
      type: node.attributes.Type,
      props: {
        name: node.attributes.Name,
        id: node.attributes.Id,
        ...getLocation(node)
      },
      children: []
    }
    context.uiNode.children.push(uiNode);

    const newContext = { ...context, uiNode };
    node.elements.forEach((element: any) => {
      processNode(element, newContext, BASIC_RULES);
    });

    return node;    
  }
  return undefined;
}

function ruleVBox(node: any, context: any, rules: any[]) {
  if (node.attributes.Type === "VBox") {
    const uiNode = {
      type: node.attributes.Type,
      props: {
        name: node.attributes.Name,
        id: node.attributes.Id,
        ...getLocation(node)
      },
      children: []
    };
    context.uiNode.children.push(uiNode);

    const newContext = { ...context, uiNode };
    node.elements.forEach((element: any) => {
      processNode(element, newContext, BASIC_RULES);
    });

    return node;
  }
  return undefined;
}

function ruleFormSection(node: any, context: any, rules: any[]) {
  if (node.attributes.Type === "FormSection") {
    const uiNode = {
      type: node.attributes.Type,
      props: {
        name: node.attributes.Name,
        id: node.attributes.Id,
        ...getLocation(node)
      },
      children: []
    };
    if (context.collectFormChildren) {
      context.collectFormChildren.push(uiNode);
    } else {
      context.uiNode.children.push(uiNode);
    }

    const newContext = { ...context, uiNode };
    delete newContext.collectFormChildren;
    node.elements.forEach((element: any) => {
      processNode(element, newContext, BASIC_RULES);
    });

    return node;
  }
  return undefined;
}

function ruleBox(node: any, context: any, rules: any[]) {
  if (node.attributes.Type === "Box") {
    const uiNode = {
      type: node.attributes.Type,
      props: {
        name: node.attributes.Name,
        id: node.attributes.Id,
        ...getLocation(node)
      },
      children: []
    };
    context.uiNode.children.push(uiNode);

    if (context.uiNode.type === "Tab") {
      context.uiNode.props.handles.push({
        type: "TabHandle",
        props: {
          name: node.attributes.Name,
          id: node.attributes.Id
        },
        children: []
      });
    }
    const newContext = { ...context, uiNode };
    node.elements.forEach((element: any) => {
      processNode(element, newContext, BASIC_RULES);
    });

    return node;
  }
  return undefined;
}

function ruleTab(node: any, context: any, rules: any[]) {
  if (node.attributes.Type === "Tab") {
    const uiNode = {
      type: node.attributes.Type,
      props: {
        name: node.attributes.Name,
        id: node.attributes.Id,
        handles: [],
        ...getLocation(node)
      },
      children: []
    };
    context.uiNode.children.push(uiNode);

    const newContext = { ...context, uiNode };
    node.elements.forEach((element: any) => {
      processNode(element, newContext, BASIC_RULES);
    });
    if (uiNode.props.handles[0]) {
      uiNode.props.firstTabId = uiNode.props.handles[0].props.id;
    }

    return node;
  }
  return undefined;
}

function ruleDataSources(node: any, context: any, rules: any[]) {
  if (node.name === "DataSources") {
    console.warn(`No processing for ${node.name} so far.`);
    return node;
  }
  return undefined;
}

function ruleComponentBindings(node: any, context: any, rules: any[]) {
  if (node.name === "ComponentBindings") {
    console.warn(`No processing for ${node.name} so far.`);
    return node;
  }
  return undefined;
}

function ruleConfiguration(node: any, context: any, rules: any[]) {
  if (node.name === "Configuration") {
    console.warn(`No processing for ${node.name} so far.`);
    return node;
  }
  return undefined;
}

function ruleUnknownWarn(node: any, context: any) {
  console.log(node, context);
  console.warn(
    `Unknown node ${node.name} ${node.attributes &&
      node.attributes.Id} ${node.attributes && node.attributes.Type}`
  );
  return node;
}

function processNode(node: any, context: any, rules: any[]) {
  for (const rule of rules) {
    const ruleResult = rule(node, context, rules);
    if (ruleResult !== undefined) {
      return ruleResult;
    }
  }
  throw new Error("No rulle triggered.");
}

function parseScreenDef(o: any) {
  const context = {
    uiNode: null,
    executeLater: [],
  };
  processNode(o, context, [ruleRoot, ruleUnknownWarn]);
  context.executeLater.forEach((run: any) => run());
  return context;
}

export async function main() {
  const xml = (await axios.get("/screen03.xml")).data;
  const xmlObj = xmlJs.xml2js(xml, { compact: false });
  const interpretedResult = parseScreenDef(xmlObj);
  console.log(interpretedResult);
}
