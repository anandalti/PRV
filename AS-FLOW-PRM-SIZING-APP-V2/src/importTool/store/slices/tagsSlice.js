import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchTagsAPI, bomSolveAPI,updateTagNameAPI } from '../api/tags';

const fetchTags = createAsyncThunk(
    'tags/fetchTags',
    async () => {
        const response = await fetchTagsAPI();
        return response;
    }
);

const bomSolve = createAsyncThunk(
    'tags/bomSolve',
    async (payload) => {
        const response = await bomSolveAPI(payload);
        return response;
    }
);
export const updateTagNameThunk = createAsyncThunk(
    'tags/updateTagNameThunk',
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            await updateTagNameAPI(payload);
            await dispatch(fetchTags());
            return payload;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const inferDynamicColumns = (rowList, nestedKey = null) => {
    if (!rowList?.length) return [];

    let sample = rowList[0];
    
    if (nestedKey && sample[nestedKey]?.length) {
        const { modelId, modelNumber, selectedValveId, ...rest } = sample[nestedKey][0];
        const dynamicArray = Object.values(rest).find(Array.isArray);
        sample = dynamicArray && dynamicArray.length ? dynamicArray[0] : sample[nestedKey][0];
    }

    return Object.keys(sample)
        // Automatically exclude ANY nested arrays/objects. Only raw values become columns!
        .filter(key => typeof sample[key] !== 'object' || sample[key] === null)
        .map(key => ({
            name: key,
            label: key
        }));
};

const tagsSlice = createSlice({
    name: 'tags',
    initialState: {
        filterData: { companies: [] },
        sizingDetails: [],
        sizingColumns: [],
        tagDetails: [],
        tagDetailsColumns: [],
        configDetails: [],
        configColumns: [],
        pricingDetails: [],
        pricingColumns: [],
        bomDetails: [],
        bomColumns: [],
        fileUploadId: null,
        isLoading: false,
        error: null,
        importedOrderData: null,
    },
    reducers: {
        updateTagName: (state, action) => {
            const { id, newName } = action.payload;

            // Update tagDetails (for tables only)
            const tagIndex = state.tagDetails.findIndex(t => t.TagId == id || t.tagId == id || t.id == id);
            if (tagIndex !== -1) {
                const tag = state.tagDetails[tagIndex];
                tag.TagNumber = newName;
                tag.tagNumber = newName;
            }
        },
        setImportedOrderData: (state, action) => {
            state.importedOrderData = action.payload;
        }
        ,
        setFileUploadId: (state, action) => {
            state.fileUploadId = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.fulfilled, (state, action) => {
                const payloadData = action.payload || {};
                // Ensure all nodes in the tree have IDs and Names, as the new API payload omits them for containers
                const safeFilterData = payloadData.filterData || { companies: [] };
                (safeFilterData.companies || []).forEach((c, cIdx) => {
                    if (!c.id) c.id = c.companyId || `company_${cIdx}`;
                    if (!c.name) c.name = c.companyName || `Company ${cIdx + 1}`;
                    (c.projects || []).forEach((p, pIdx) => {
                        if (!p.id) p.id = p.projectId || `project_${cIdx}_${pIdx}`;
                        if (!p.name) p.name = p.projectName || `Project ${pIdx + 1}`;
                        (p.tags || []).forEach((t, tIdx) => {
                            if (!t.id) t.id = t.tagId || `tag_${cIdx}_${pIdx}_${tIdx}`;
                            if (!t.name) t.name = t.tagName || `Tag ${tIdx + 1}`;
                        });
                    });
                });

                state.filterData = safeFilterData;
                state.sizingDetails = payloadData.sizingDetails || [];
                state.sizingColumns = inferDynamicColumns(state.sizingDetails);

                state.tagDetails = payloadData.tagDetails || [];
                state.tagDetailsColumns = inferDynamicColumns(state.tagDetails);

                state.configDetails = payloadData.configDetails || [];
                state.configColumns = inferDynamicColumns(state.configDetails, 'models');

                state.pricingDetails = payloadData.pricingDetails || [];
                state.pricingColumns = inferDynamicColumns(state.pricingDetails, 'models');

                state.bomDetails = payloadData.bomDetails || [];
                state.bomColumns = inferDynamicColumns(state.bomDetails, 'models');

                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchTags.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTags.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(bomSolve.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(bomSolve.fulfilled, (state, action) => {
                // Support both direct array and { bomDetails: [] } wrapper
                const newBomDetails = Array.isArray(action.payload) ? action.payload : (action.payload?.bomDetails || []);
                
                const existingBom = [...state.bomDetails];
                newBomDetails.forEach(newItem => {
                    const id = String(newItem.tagId || newItem.TagId || newItem.id);
                    const idx = existingBom.findIndex(item => String(item.tagId || item.TagId || item.id) === id);
                    if (idx !== -1) {
                        existingBom[idx] = newItem;
                    } else {
                        existingBom.push(newItem);
                    }
                });

                state.bomDetails = existingBom;
                state.bomColumns = inferDynamicColumns(state.bomDetails, 'models');
                state.isLoading = false;
            })
            .addCase(bomSolve.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                
                const failedTagIds = action.meta?.arg?.tagIds || [];
                failedTagIds.forEach(id => {
                    const stringId = String(id);
                    const idx = state.bomDetails.findIndex(item => String(item.tagId || item.TagId || item.id) === stringId);
                    
                    const existingTag = state.tagDetails.find(item => String(item.TagId || item.tagId || item.id) === stringId);
                    const tagName = existingTag ? (existingTag.tagName || existingTag.TagName || existingTag.TagNumber || existingTag.tagNumber || existingTag.name || '') : '';

                    const failedEntry = {
                        tagId: Number(id),
                        tagName: tagName,
                        isFailed: true,
                        error: action.error?.message || 'BOM solve failed',
                        models: []
                    };

                    if (idx !== -1) {
                        state.bomDetails[idx] = failedEntry;
                    } else {
                        state.bomDetails.push(failedEntry);
                    }
                });
            })
            .addCase(updateTagNameThunk.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateTagNameThunk.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(updateTagNameThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

    },
});

export const { updateTagName, setImportedOrderData, setFileUploadId } = tagsSlice.actions;
export { fetchTags, bomSolve };
export default tagsSlice.reducer;