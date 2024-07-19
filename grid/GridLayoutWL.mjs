registerLayout('grid-page', class {
    static get inputProperties() { return ['--columns', '--rows', '--orient']; }
    static get childInputProperties() { return ['--grid-column', '--grid-row', '--cell-x', '--cell-y']; }
    
    static layoutOptions = {
        childDisplay: 'block',
        sizing: 'manual'
    };
    
    //
    async intrinsicSizes(children, edges, styleMap) {
        const childrenSizes = await Promise.all(children.map((child) => {
            return child.intrinsicSizes();
        }));

        const maxContentSize = childrenSizes.reduce((max, childSizes) => {
            return Math.max(max, childSizes.maxContentSize);
        }, 0);

        const minContentSize = childrenSizes.reduce((max, childSizes) => {
            return Math.max(max, childSizes.minContentSize);
        }, 0);

        return {maxContentSize, minContentSize};
    }

    //
    async layout(children, edges, constraints, styleMap) {
        const availableInlineSize = constraints.fixedInlineSize; //- edges.all.inline;
        const availableBlockSize = constraints.fixedBlockSize; //- edges.all.block;
        
        //
        const orient = parseInt(styleMap.get("--orient").value);
        const columns = styleMap.get(["--columns", "--rows"][orient%2]).value;
        const rows = styleMap.get(["--rows", "--columns"][orient%2]).value;
        
        //
        const columnSize = availableInlineSize / columns;
        const rowSize = availableBlockSize / rows;
        
        //
        const cellMin = Math.min(columnSize, rowSize);
        const childConstraints = {availableInlineSize: cellMin, availableBlockSize: cellMin};

        //
        const childFragments = await Promise.all(children.map(async (child)=>{
            const column = (child.styleMap.get(["--grid-column", "--grid-row"][orient%2])?.value || 1) - 1;
            const row = (child.styleMap.get(["--grid-row", "--grid-column"][orient%2])?.value || 1) - 1;

            //
            const fragment = await child.layoutNextFragment(childConstraints);
            
            //
            if (orient == 0 || orient == 1) {
                fragment.inlineOffset = (column * columnSize + (columnSize - fragment.inlineSize) / 2); //+ edges.all.inlineStart;
            } else {
                fragment.inlineOffset = ((columns - column - 1) * columnSize + (columnSize - fragment.inlineSize) / 2);
            }
            
            //
            if (orient == 0 || orient == 3) {
                fragment.blockOffset = (row * rowSize + (rowSize - fragment.blockSize) / 2); //+ edges.all.blockStart;
            } else {
                fragment.blockOffset = ((rows - row - 1) * rowSize + (rowSize - fragment.blockSize) / 2); 
            }
            
            return fragment;
        }));

        //
        return {
            childFragments
        };
    }
});
