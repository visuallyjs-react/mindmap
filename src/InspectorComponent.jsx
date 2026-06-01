import React, {useRef, useState} from "react";

import {InspectorComponent} from "@visuallyjs/browser-ui-react";
import {PROPERTY_LABEL, PROPERTY_NOTES} from "./definitions";

export default function MindmapInspectorComponent() {

    return <InspectorComponent>

        {(current) => <>
            <div className="vjs-mindmap-inspector vjs-node-inspector">
                <div className="vjs-mindmap-inspector-section">
                    <div>Label</div>
                    <input type="text" vjs-att={PROPERTY_LABEL} vjs-focus/>
                </div>

                <div className="vjs-mindmap-inspector-section">
                    <div>Notes</div>
                    <textarea rows="10" vjs-att={PROPERTY_NOTES}/>
                </div>

            </div>

        </>}

    </InspectorComponent>
}
