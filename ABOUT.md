# Mindmap Builder Implementation

This document describes how the Mindmap Builder is implemented using `@visuallyjs/browser-ui-react` and `@visuallyjs/browser-ui`.

## Components

The application is built using several core components from `@visuallyjs/browser-ui-react`:

- **`SurfaceProvider`**: Provides context and state management for the mindmap.
- **`SurfaceComponent`**: The main canvas area where the mindmap is rendered.
- **`ControlsComponent`**: Provides zoom and pan controls.
- **`MiniviewComponent`**: Provides a navigation map of the mindmap.

### Custom Components
- **`Inspector`**: A property editor for updating node labels and notes.

## Implementation Details

- **Custom Layout**: Uses a specialized `MindmapLayout` to automatically position nodes in a tree structure originating from a central "Main" node.
- **JSX Rendering**: Nodes are rendered using custom JSX templates defined in the `view` object, allowing for rich interactive elements like "Add Child" and "Delete" buttons directly on the nodes.
- **Parser/Exporter**: Implements a custom JSON format for mindmaps, handled by `mindmapJsonParser` and `mindmapJsonExporter`.
- **Interaction**: Features custom logic for adding children nodes, deleting entire subtrees, and managing "left" vs "right" branching from the main node.

## Configuration Options

The `renderOptions` include:
- **`elementsDraggable: false`**: Node positions are managed entirely by the `MindmapLayout`.
- **`logicalPorts: true`**: Allows connecting edges to logical locations on the main node without physical port elements.
- **`refreshLayoutOnEdgeConnect: true`**: Automatically triggers a relayout when the tree structure changes.

## CSS Integration
- **VisuallyJS Core**: The core styles are included in `src/index.css` via `@import "@visuallyjs/browser-ui/css/visuallyjs.css";`.
- **App Styles**: Custom styles for the mindmap nodes, connectors, and editor layout are imported from `mindmap.css`.
