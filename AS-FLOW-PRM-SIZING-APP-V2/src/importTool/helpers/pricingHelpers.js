export const processPricingData = (rows, expandedTags) => {
    const tableData = [];
    const pricingGroups = [
        {
            groupName: 'Adders',
            items: [
                { field: 'PLNetAdders', category: 'Net Adder' },
                { field: 'PLListAdders', category: 'List Adder' }
            ]
        },
        {
            groupName: 'Discounts',
            items: [
                { field: 'PLTransferDiscounts', category: 'Transfer Discount' },
                { field: 'PLCustomerDiscounts', category: 'Customer Discount' },
                { field: 'PLSurchargeDiscounts', category: 'Surcharge Discount' }
            ]
        },
        {
            groupName: 'Special Pricing',
            items: [
                { field: 'PLPOAs', category: 'POA' },
                { field: 'SplPLPOAs', category: 'Special POA' },
                { field: 'PLPriceItems', category: 'Price Item' },
                { field: 'PLNetPriceItems', category: 'Net Price Item' },
                { field: 'PricingNotes', category: 'Pricing Note', type: 'notes' },
                { field: 'BacklogItems', category: 'Backlog Item', type: 'strings' }
            ]
        }
    ];

    rows.forEach(tag => {
        const pricingList = tag.PricingData && tag.PricingData.length ? tag.PricingData : [];
        const tagId = tag.tagId || tag.TagId || tag.id;

        if (pricingList.length === 0) {
            tableData.push({
                tagId: `${tagId}-empty`,
                baseTagId: tagId,
                tagName: tag.tagName || tag.name,
                model: 'No Pricing Data',
                isParent: true,
                isExpanded: false
            });
            return;
        }

        pricingList.forEach((p, index) => {
            const modelId = `${tagId}-plant${index}`;
            const isExpanded = expandedTags.has(modelId);

            tableData.push({
                tagId: modelId,
                baseTagId: tagId,
                tagName: index === 0 ? (tag.tagName || tag.name) : '',
                model: p.PlantName || `Plant ${index + 1}`,
                isParent: true,
                isExpanded,
                DeliveryTime: p.DeliveryTime || 'N/A',
                BacklogTime: p.BacklogTime || 'N/A',
                Tariffs: `Trans: $${p.TariffTransferValue || 0} | Cust: $${p.TariffCustomerValue || 0}`,
                Indicators: {
                    PricingSeen: p.PricingSeen,
                    CustomerLoaded: p.CustomerLoaded,
                    TransferLoaded: p.TransferLoaded,
                    SurchargeLoaded: p.SurchargeLoaded,
                    DeliveryOverridden: p.DeliveryOverridden
                }
            });

            if (!isExpanded) {
                return;
            }

            const pushItems = (items, category) => {
                // API returns { Items: [...], Total: ... } — extract the array
                const itemsArray = items?.Items ?? (Array.isArray(items) ? items : null);
                if (!itemsArray || itemsArray.length === 0) return [];
                return itemsArray.map(item => ({
                    tagId: modelId,
                    baseTagId: tagId,
                    tagName: '',
                    model: '',
                    isChild: true,
                    Category: category,
                    Detail1: item.RowName || item.BIPriceGroupName || '-',
                    Detail2: item.Type || '-',
                    Detail3: item.Value !== undefined ? item.Value : '-',
                    Detail4: item.RowId !== undefined ? `ID: ${item.RowId}` : '-'
                }));
            };

            const pushNotes = (notes) => {
                if (!notes || notes.length === 0) return [];
                return notes.map(note => ({
                    tagId: modelId,
                    baseTagId: tagId,
                    tagName: '',
                    model: '',
                    isChild: true,
                    Category: 'Pricing Note',
                    Detail1: note.AdditionalNotes || '-',
                    Detail2: note.DateCreated || '-',
                    Detail3: note.ApprovedBy || '-',
                    Detail4: note.NoteType || '-'
                }));
            };

            const pushStrings = (items, category) => {
                // API may return { Items: [...] } — extract the array just like pushItems does
                const itemsArray = items?.Items ?? (Array.isArray(items) ? items : null);
                if (!itemsArray || itemsArray.length === 0) return [];
                return itemsArray.map(item => ({
                    tagId: modelId,
                    baseTagId: tagId,
                    tagName: '',
                    model: '',
                    isChild: true,
                    Category: category,
                    Detail1: item,
                    Detail2: '-',
                    Detail3: '-',
                    Detail4: '-'
                }));
            };

            pricingGroups.forEach(group => {
                const groupRows = [];

                group.items.forEach(itemDef => {
                    const value = p[itemDef.field];
                    if (itemDef.type === 'notes') {
                        groupRows.push(...pushNotes(value));
                    } else if (itemDef.type === 'strings') {
                        groupRows.push(...pushStrings(value, itemDef.category));
                    } else {
                        groupRows.push(...pushItems(value, itemDef.category));
                    }
                });

                if (groupRows.length > 0) {
                    groupRows.forEach((row, rowIndex) => {
                        tableData.push({
                            ...row,
                            isSectionEnd: rowIndex === groupRows.length - 1,
                            sectionName: group.groupName
                        });
                    });
                }
            });
        });
    });

    return tableData;
};
