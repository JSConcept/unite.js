<script type="ts" lang="ts">
    import {onMount} from "svelte";
    import type {Field} from "./ItemEdit.ts";
    
    //
    export let whatEdit: object | any | null = null;
    export let fields: Field[] = [];
    
    //
    export const confirm = ()=>{
        if (whatEdit) {
            for (const F of fields) {
                if (F.name in whatEdit) {
                    whatEdit[F.name] = F.value;
                };
                whatEdit = whatEdit;
            }
        }
    }
    
    //
    export const synchronize = (whatFrom: object | any | null = null)=>{
        //
        if (whatFrom && whatFrom != whatEdit) {
            whatEdit = whatFrom;
        }
        
        //
        if (whatEdit) {
            for (const F of fields) {
                if (F.name in whatEdit) {
                    F.value = whatEdit[F.name];
                };
            }
            fields = fields;
        }
    }
    
    //
    onMount(()=>{
        synchronize();
    });

</script>

<!-- -->
{#if whatEdit}
    <form class="ux-edit-form">
        <div class="ux-edit-desc">
            <slot name="description"/>
        </div>
        {#each fields as F(F.name)}
            <div class="ux-field-block">
                <div inert={true} class="field-label">{F.label}</div>
                <input bind:value={F.value} name={F.name} data-name={F.name} on:change={confirm} class="field-input"/>
            </div>
        {/each}
    </form>
{/if}
