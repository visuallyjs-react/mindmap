import React, { useEffect, useRef } from "react"

import './mindmap.css'

import { BowtieLayout, registerParser, registerExporter, uuid, EVENT_GRAPH_CLEARED, CONNECTOR_TYPE_STRAIGHT, AnchorLocations, EVENT_CANVAS_CLICK, EVENT_UNDO, EVENT_REDO } from "@visuallyjs/browser-ui"
import { SurfaceProvider, SurfaceComponent, ControlsComponent, MiniviewComponent } from "@visuallyjs/browser-ui-react";
import {CLASS_ADD_CHILD, CLASS_MINDMAP_DELETE, CLASS_MINDMAP_INFO, LEFT, RIGHT, SUBTOPIC} from "./definitions";
import {MINDMAP_JSON, mindmapJsonExporter, mindmapJsonParser} from "./parser";
import {MAIN} from "./definitions";

import Inspector from "./InspectorComponent"

function App({url}) {

    const initialized = useRef(false)
    const model = useRef(null)
    const surface = useRef(null)

    registerParser(MINDMAP_JSON, mindmapJsonParser)
    registerExporter(MINDMAP_JSON, mindmapJsonExporter)

    // assign the model ref on load
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            model.current = surface.current.getSurface().model

            model.current.bind(EVENT_UNDO, relayout)
            model.current.bind(EVENT_REDO, relayout)

            // bind to graph cleared event and add a new main node, then center it.
            // the Mindmap always has a center node.
            model.current.bind(EVENT_GRAPH_CLEARED, () => {
                model.current.addNode({
                    id:uuid(),
                    type:MAIN,
                    left:[],
                    right:[],
                    label:"Main"
                })
                surface.current.getSurface().zoomToFit()
            })

            model.current.load({
                url:url,
                type:MINDMAP_JSON
            })

        }
    })

    function addChild(vertex, direction) {
        // for edges from the main node, we attach them to a port on the node, because the main node can
        // have `left` and `right` edges. For subtopic nodes we attach directly to the node. So this code tests
        // for a matching port and uses it as the source if found, otherwise it uses the source node.
        const source = vertex
        const payload = {
            id:uuid(),
            parentId:vertex.id,
            label:"New subtopic",
            children:[],
            type:SUBTOPIC,
            direction
        }

        model.current.transaction(() => {
            const node = model.current.addNode(payload)
            model.current.addEdge({source, target:node})
        })
    }

    function deleteVertex(vertex) {
        // select the node that was clicked and all of its descendants (we get a Selection object back)
        const nodeAndDescendants = model.current.selectDescendants(vertex, true)
        // inside a transaction, remove everything in that selection from the model (including edges to each of the nodes).
        // we do this inside a transaction so we can undo the whole operation as one unit.
        model.current.transaction(() => {
            model.current.remove(nodeAndDescendants)
        })

        relayout()
    }

    function relayout() {
        requestAnimationFrame(() => {
            surface.current.getSurface().relayout()
        })
    }

    function showInfo(vertex) {
        model.current.setSelection(vertex)
    }

    const view = {
        nodes:{
            main:{
                jsx:(ctx) => <div className="vjs-mindmap-main vjs-mindmap-vertex">
                    <div className="vjs-mindmap-title">{ctx.data.label}</div>
                    <div className="vjs-mindmap-notes">{ctx.data.notes}</div>
                    <div className={CLASS_MINDMAP_INFO}/>
                    <div className={CLASS_ADD_CHILD} data-direction={LEFT} onClick={() => addChild(ctx.obj, LEFT)}/>
                    <div className={CLASS_ADD_CHILD} data-direction={RIGHT} onClick={() => addChild(ctx.obj, RIGHT)}/>
                </div>
            },
            subtopic:{
                jsx:(ctx) => <div className="vjs-mindmap-subtopic vjs-mindmap-vertex">
                    <div className="vjs-mindmap-title">{ctx.data.label}</div>
                    <div className="vjs-mindmap-notes">{ctx.data.notes}</div>
                    <div className={CLASS_MINDMAP_INFO} onClick={() => showInfo(ctx.obj)}/>
                    <div className={CLASS_ADD_CHILD} data-direction={ctx.data.direction} onClick={() => addChild(ctx.obj)}/>
                    <div className={CLASS_MINDMAP_DELETE} onClick={() => deleteVertex(ctx.obj)}/>
                </div>
            }
        }
    }

    const renderOptions = {
        // in this app, elements are not draggable; they are fixed by the layout.
        elementsDraggable:false,
        // after load, zoom the display so all nodes are visible.
        zoomToFit:true,
        // Run a relayout whenever a new edge is established, which happens programmatically when the user adds a new subtopic.
        relayoutOnEdgeConnect:true,
        // for the purposes of testing. Without this the right mouse button is disabled by default.
        consumeRightClick:false,
        // Use a bowtie layout.
        layout:{
            type:BowtieLayout.type,
            options:{
                getRootNode:(ds) => ds.getNodes().filter(d => d.data.type === MAIN)[0],
                getUpstream:(ds, v) => v.getAllEdges().filter(e => e.target.data.direction === LEFT).map(e => e.target),
                getDownstream:(ds, v) => v.getAllEdges().filter(e => e.target.data.direction === RIGHT).map(e => e.target)
            }
        },
        edges:{
            connector:{
                type:CONNECTOR_TYPE_STRAIGHT,
                options:{
                    stub:20
                }
            },
            anchor:[ AnchorLocations.Left, AnchorLocations.Right ]
        },
        events:{
            [EVENT_CANVAS_CLICK]:() => model.current.clearSelection()
        }
    }


    return (<>
        <div className="vjs-mindmap">
            <SurfaceProvider>

            <div className="vjs-mindmap-canvas">
                <SurfaceComponent viewOptions={view} renderOptions={renderOptions} ref={surface}/>
                <ControlsComponent/>
                <MiniviewComponent/>
            </div>
            <div className="vjs-mindmap-rhs">

                <div className="description">
                    <h3>Mindmap Builder</h3>
                    <ul>
                        <li>Click the note icon in the upper left to inspect/edit a node.</li>
                        <li>Click the X button to delete a node</li>
                        <li>Click the + button to add a new subtopic. Subtopics can be added to the left or right of the
                            main node.
                        </li>
                    </ul>
                </div>

                <hr/>

                <Inspector/>

            </div>
            </SurfaceProvider>

        </div>
    </>)
}

export default App
