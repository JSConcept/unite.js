<script type="ts" lang="ts">
    import {writable} from "svelte/store";
    import Frame from "../design/Frame.svelte";
import ItemEdit from "../forms/ItemEdit.svelte";
    import type {Field} from "../forms/ItemEdit.ts";
    import {makeReactiveObject} from "../reactive/ReactiveObject.ts";
//import ContextMenu from "../contextmenu/ContextMenu.svelte";
//import MultiPage from "../grid/MultiPage.svelte";
//import InputEditor from "../editor/InputEditor.svelte";
//import AppFrame from "../appframe/AppFrame.svelte";
//import {state} from "./GridState"

    //
    const isFocused = writable(true);

    //
    const testObj = makeReactiveObject({
        icon: "wallpaper",
        label: "Test"
    });
    
    //
    testObj["@subscribe"]((v, p) => {
        console.log(p, v);
    });

    //
    const fieldSet: Field[] = [
        {"name": "icon", "label": "Icon: ", "icon": "", "value": ""},
        {"name": "label", "label": "Label: ", "icon": "", "value": "RX"},
    ]
</script>

<!-- -->
<!--<MultiPage state={state}></MultiPage>
<ContextMenu></ContextMenu>
-->

<Frame focused={isFocused}>
    <ItemEdit whatEdit={testObj} fields={fieldSet}></ItemEdit>
</Frame>
