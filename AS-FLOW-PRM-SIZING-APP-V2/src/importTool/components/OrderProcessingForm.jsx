import React from 'react';
import { gv } from '../helpers/importHelpers';

/**
 * Shared Sub-Components
 */

const OpsRow = ({ left, right }) => (
    <tr>
        <td className="ops-lbl" style={{ width: 140 }}>{left.label}</td>
        <td className="ops-val ops-green" style={{ whiteSpace: 'nowrap' }}>{left.val}</td>
        <td className="ops-lbl" style={{ width: 140 }}>{right.label}</td>
        <td className="ops-val ops-green" style={{ whiteSpace: 'nowrap' }}>{right.val}</td>
    </tr>
);

const OpsCheck = ({ label, checked }) => (
    <label className="ops-check-item">
        <input type="checkbox" checked={!!checked} readOnly />
        <span>{label}</span>
    </label>
);

const AddressBlock = ({ company, addr1, addr2, city, state, postal, country }) => {
    const row = (lbl, val) => (
        <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', minHeight: '18px' }}>
            <div style={{ width: '90px', fontSize: '9px', color: '#64748b', borderRight: '1px solid #cbd5e1', padding: '2px 4px', backgroundColor: '#f8fafc' }}>{lbl}</div>
            <div className="ops-green" style={{ flex: 1, padding: '2px 8px', fontSize: '10px', fontWeight: 600 }}>{gv(val)}</div>
        </div>
    );
    return (
        <div style={{ border: '1px solid #cbd5e1', borderBottom: 'none' }}>
            {row('Company Name', company)}
            {row('Address line1', addr1)}
            {row('Address line2', addr2)}
            {row('City', city)}
            {row('State / Province', state)}
            {row('Postal Code', postal)}
            {row('Country', country)}
        </div>
    );
};

const TSFAddrBlock = ({ data }) => {
    const row = (lbl, val) => (
        <tr>
            <td className="ops-lbl" style={{ width: '35%', fontSize: 9 }}>{lbl}</td>
            <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7', minHeight: 18 }}>{gv(val)}</td>
        </tr>
    );
    return (
        <table className="ops-table ops-addr-inner-table">
            <tbody>
                {row('Company Name', data?.companyName)}
                {row('Address line 1', data?.addressLine1)}
                {row('Address line 2', data?.addressLine2)}
                {row('City', data?.city)}
                {row('State/Province', data?.state)}
                {row('Postal Code', data?.postalCode)}
                {row('Country', data?.country)}
            </tbody>
        </table>
    );
};



/** 
 * HEADER BODY
 */
const HeaderBody = ({ data }) => {
    const h = data.headerInfo || {};
    const t = data.termsAndShipping || {};
    const a = data.addresses || {};
    const f = data.financials || {};
    const c = data.commissionDistribution || {};
    const d = data.documentsAttached || {};

    return (
        <>
            <table className="ops-table">
                <tbody>
                    <tr>
                        <td className="ops-hint" style={{ width: '50%' }}>Please select from dropdown list</td>
                        <td className="ops-hint" style={{ width: '50%' }}>Please fill in</td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <OpsRow left={{ label: 'KOB Type', val: gv(h.kobType) }} right={{ label: 'Order date', val: gv(h.orderDate) }} />
                    <OpsRow left={{ label: 'Order Type', val: gv(h.orderType) }} right={{ label: 'Rep order no.', val: gv(h.repOrderNo) }} />
                    <OpsRow left={{ label: 'Sub-BU code', val: gv(h.subBuCode) }} right={{ label: 'Revision', val: gv(h.revision) }} />
                    <OpsRow left={{ label: 'Currency code', val: gv(h.currencyCode) }} right={{ label: 'Request date', val: gv(h.requestDate) }} />
                    <OpsRow left={{ label: 'Partial shipment', val: h.partialShipment ? 'Yes' : 'No' }} right={{ label: 'Customer PO no.', val: gv(h.customerPoNo) }} />
                    <OpsRow left={{ label: 'Freight mode', val: gv(h.freightMode) }} right={{ label: 'Our quotation ref.', val: gv(h.ourQuotationRef) }} />
                    <OpsRow left={{ label: 'Packing type', val: gv(h.packingType) }} right={{ label: "Salesman's name", val: gv(h.salesmanName) }} />
                    <OpsRow left={{ label: 'Key account', val: gv(h.keyAccount) }} right={{ label: 'Project name', val: gv(h.projectName) }} />
                    <OpsRow left={{ label: 'SIC code', val: gv(h.sicCode) }} right={{ label: 'Prepared by', val: gv(h.preparedBy) }} />
                    <OpsRow left={{ label: 'Vertical Industry', val: gv(h.verticalIndustry) }} right={{ label: 'Supply Scope', val: gv(h.supplyScope) }} />
                    <tr>
                        <td className="ops-lbl" style={{ width: 140, borderTop: '1.5px solid #64748b' }}>Payment term</td>
                        <td className="ops-val ops-green" style={{ borderTop: '1.5px solid #64748b' }}>{gv(t.paymentTerm)}</td>
                        <td className="ops-lbl" style={{ width: 140, borderTop: '1.5px solid #64748b' }}>Dropshipment</td>
                        <td className="ops-val ops-green" style={{ borderTop: '1.5px solid #64748b' }}>{t.dropshipment ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">IncoTerm 2020</td>
                        <td className="ops-val ops-green">{gv(t.incoTerm2020)}</td>
                        <td className="ops-val ops-muted-note" colSpan="2">&lt;==Specify details at Freight &amp; Insurance</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Named place/port</td>
                        <td className="ops-val ops-green" colSpan="3">{gv(t.namedPlacePort)}</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Penalty(DADE Req'd)</td>
                        <td className="ops-val ops-green">{t.penaltyApplicable ? 'Yes' : 'No'}</td>
                        <td className="ops-val" colSpan="2"></td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Penalty start date</td>
                        <td className="ops-val ops-green">{gv(t.penaltyStartDate)}</td>
                        <td className="ops-lbl" style={{ width: 140 }}>Penalty rate &amp; cap</td>
                        <td className="ops-val ops-green">{gv(t.penaltyRateAndCap)}</td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr>
                        <td className="ops-addr-title" style={{ width: '50%' }}>Invoice to name and address</td>
                        <td className="ops-addr-title">Ship to name and address</td>
                    </tr>
                    <tr>
                        <td className="ops-addr-cell">
                            <AddressBlock company={gv(a.invoiceTo?.companyName)} addr1={gv(a.invoiceTo?.addressLine1)} addr2={gv(a.invoiceTo?.addressLine2)} city={gv(a.invoiceTo?.city)} state={gv(a.invoiceTo?.state)} postal={gv(a.invoiceTo?.postalCode)} country={gv(a.invoiceTo?.country)} />
                        </td>
                        <td className="ops-addr-cell">
                            <AddressBlock company={gv(a.shipTo?.companyName)} addr1={gv(a.shipTo?.addressLine1)} addr2={gv(a.shipTo?.addressLine2)} city={gv(a.shipTo?.city)} state={gv(a.shipTo?.state)} postal={gv(a.shipTo?.postalCode)} country={gv(a.shipTo?.country)} />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr>
                        <td className="ops-addr-title" style={{ width: '50%' }}>End User name and address</td>
                        <td className="ops-addr-title">Shipping mark</td>
                    </tr>
                    <tr>
                        <td className="ops-addr-cell">
                            <AddressBlock company={gv(a.endUser?.companyName)} addr1={gv(a.endUser?.addressLine1)} addr2={gv(a.endUser?.addressLine2)} city={gv(a.endUser?.city)} state={gv(a.endUser?.state)} postal={gv(a.endUser?.postalCode)} country={gv(a.endUser?.country)} />
                        </td>
                        <td className="ops-addr-cell">
                            <div className="ops-val ops-green" style={{ minHeight: 60 }}>{gv(a.shippingMark)}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr><td className="ops-section-hdr" colSpan="6">Documents Attached</td></tr>
                    <tr>
                        <td colSpan="6" style={{ padding: '4px 8px' }}>
                            <div className="ops-checklist">
                                <div className="ops-check-col">
                                    <OpsCheck label="Deal Approval Form" checked={d.dealApprovalForm} />
                                    <OpsCheck label="Signed Customer PO" checked={d.signedCustomerPo} />
                                    <OpsCheck label="Sourcing Deviation F..." checked={d.sourcingDeviationForms} />
                                    <OpsCheck label="Final Data Sheet" checked={d.finalDataSheet} />
                                </div>
                                <div className="ops-check-col">
                                    <OpsCheck label="Customer Supplied ..." checked={d.customerSuppliedProduct} />
                                    <OpsCheck label="T&C Deviation App..." checked={d.tcDeviationApproval} />
                                    <OpsCheck label="Lead Time Quote" checked={d.leadTimeQuote} />
                                    <OpsCheck label="Tiering Matrix" checked={d.tieringMatrix} />
                                </div>
                                <div className="ops-check-col" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                    <OpsCheck label="Other supporting docs" checked={!!d.otherSupportingDocs} />
                                    <span style={{ fontWeight: 700, marginLeft: 20, fontSize: 10 }}>Please specify :</span>
                                    <div style={{ flex: 1, borderBottom: '1px solid #000', marginLeft: 10, height: 16 }}>
                                        {gv(d.otherSupportingDocsSpecify)}
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr>
                        <td className="ops-lbl" style={{ width: '30%' }}>Total Product &amp; Service net price</td>
                        <td className="ops-val ops-green" style={{ width: '20%', color: '#0033cc', fontWeight: 700 }}>{gv(f.productServiceNetPrice)}</td>
                        <td className="ops-lbl" style={{ width: '20%' }}>Vendavo deal #</td>
                        <td className="ops-val ops-green" style={{ width: '30%' }}>{gv(f.vendorDealNumber)}</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Freight &amp; insurance</td>
                        <td className="ops-val ops-green">{gv(f.freightInsurance)}</td>
                        <td className="ops-lbl" style={{ color: 'red', borderTop: '1px solid #e5e7eb' }}>Comm. deducted?</td>
                        <td className="ops-val ops-green" style={{ color: 'red', fontWeight: 700, borderTop: '1px solid #e5e7eb' }}>
                            {f.commDeducted === true || String(f.commDeducted || '').toLowerCase().includes('yes') || String(f.commDeducted || '').toLowerCase() === 'true' ? 'Yes' : 'No'}
                        </td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Others</td>
                        <td className="ops-val ops-green">{gv(f.others)}</td>
                        <td className="ops-lbl" style={{ color: 'red', borderTop: '1px solid #e5e7eb' }}>Payable commission</td>
                        <td className="ops-val ops-green" style={{ color: 'red', fontWeight: 700, borderTop: '1px solid #e5e7eb' }}>{gv(f.payableCommission)}</td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table ops-footer-pricing">
                <tbody>
                    <tr>
                        <td className="ops-lbl" style={{ width: '15%' }}>Total Order Value</td>
                        <td className="ops-lbl" style={{ width: '10%', backgroundColor: '#e2e8f0' }}>before tax</td>
                        <td className="ops-val" style={{ width: '25%', textAlign: 'right', paddingRight: 20, fontWeight: 700, color: '#0033cc', fontSize: 12 }}>{gv(f.totalOrderValueBeforeTax)}</td>
                        <td className="ops-lbl" style={{ width: '15%', backgroundColor: '#e2e8f0' }}>After tax (CNY)</td>
                        <td className="ops-val" style={{ width: '35%', textAlign: 'center', fontWeight: 700, color: '#0033cc' }}>{gv(f.totalOrderValueAfterTax) || '-'}</td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table ops-comm-table">
                <tbody>
                    <tr>
                        <td className="ops-lbl" rowSpan="3" style={{ width: '15%', textAlign: 'center' }}>Commission<br />Distribution</td>
                        <td className="ops-lbl-center" style={{ width: '21.25%' }}>Purchasing (15%)</td>
                        <td className="ops-lbl-center" style={{ width: '21.25%' }}>Sales (35%)</td>
                        <td className="ops-lbl-center" style={{ width: '21.25%' }}>Engineering (35%)</td>
                        <td className="ops-lbl-center" style={{ width: '21.25%' }}>Territorial (15%)</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl-center" style={{ fontSize: 9, fontWeight: 400 }}>Reps Code</td>
                        <td className="ops-lbl-center" style={{ fontSize: 9, fontWeight: 400 }}>Reps Code</td>
                        <td className="ops-lbl-center" style={{ fontSize: 9, fontWeight: 400 }}>Reps Code</td>
                        <td className="ops-lbl-center" style={{ fontSize: 9, fontWeight: 400 }}>Reps Code</td>
                    </tr>
                    <tr>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.purchasing?.repCode) || 'NA'}</td>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.sales?.repCode) || 'NA'}</td>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.engineering?.repCode) || 'NA'}</td>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.territorial?.repCode) || 'NA'}</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl" style={{ textAlign: 'center', fontSize: 9 }}>Reps share %</td>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.purchasing?.sharePercentage) || 'NA'}</td>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.sales?.sharePercentage) || 'NA'}</td>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.engineering?.sharePercentage) || 'NA'}</td>
                        <td className="ops-val ops-center" style={{ color: '#0033cc', fontWeight: 700 }}>{gv(c.territorial?.sharePercentage) || 'NA'}</td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr><td className="ops-lbl" style={{ borderTop: 'none', textAlign: 'left', padding: '2px 8px' }}>Forwarder (Company Name/Address/Contact/Phone/E-mail) :</td></tr>
                    <tr><td className="ops-val" style={{ minHeight: 40, borderTop: 'none', padding: '4px 8px', color: '#0033cc', fontWeight: 700 }}>{gv(data.footerInfo?.forwarderDetails)}</td></tr>
                </tbody>
            </table>
        </>
    );
};

/**
 * TSF BODY
 */
const TSFBody = ({ data }) => {
    const h = data.header || {};
    const p = data.purchaser || {};
    const c = data.consignee || {};
    const e = data.endUser || {};
    const a = data.additionalParties || {};
    const u = data.endUseInfo || {};
    const f = data.completedBy || {};
    const i = data.internalUseOnly || {};

    const formatDisplayDate = (val) => {
        if (!val || isNaN(val)) return val;
        try {
            // Excel serial dates start at 1900-01-01
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + val * 86400000);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dd = String(date.getDate()).padStart(2, '0');
            const mmm = months[date.getMonth()];
            const yy = String(date.getFullYear()).slice(-2);
            return `${dd}-${mmm}-${yy}`;
        } catch (e) {
            return val;
        }
    };

    return (
        <>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px', tableLayout: 'fixed' }}>
                <tbody>
                    <tr style={{ display: 'table-row' }}>
                        <td className="ops-lbl" style={{ display: 'table-cell', width: '25%', border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Date:</td>
                        <td className="ops-lbl" style={{ display: 'table-cell', width: '50%', border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Purchase/Sales Order/RFQ Number:</td>
                        <td className="ops-lbl" style={{ display: 'table-cell', width: '25%', border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Project Name/Number:</td>
                    </tr>
                    <tr style={{ display: 'table-row' }}>
                        <td className="ops-val ops-green" style={{ display: 'table-cell', width: '25%', border: '1px solid #000', padding: '8px', backgroundColor: '#dcfce7', height: '30px', wordWrap: 'break-word' }}>{gv(formatDisplayDate(h.date))}</td>
                        <td className="ops-val ops-green" style={{ display: 'table-cell', width: '50%', border: '1px solid #000', padding: '8px', backgroundColor: '#dcfce7', height: '30px', wordWrap: 'break-word' }}>{gv(h.orderNumber)}</td>
                        <td className="ops-val ops-green" style={{ display: 'table-cell', width: '25%', border: '1px solid #000', padding: '8px', backgroundColor: '#dcfce7', height: '30px', wordWrap: 'break-word' }}>{gv(h.projectName)}</td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr>
                        <td className="ops-section-hdr" style={{ width: '50%' }}>A. Purchaser</td>
                        <td className="ops-section-hdr">B. Consignee/Ship To</td>
                    </tr>
                    <tr>
                        <td style={{ verticalAlign: 'top', padding: '4px 8px' }}>
                            <OpsCheck label="Check if included on purchase order or complete below" checked={p.includedOnPO} />
                            <div style={{ marginTop: 8 }}><TSFAddrBlock data={p} /></div>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '4px 8px' }}>
                            <OpsCheck label="Check if same as Block A" checked={c.sameAsPurchaser} />
                            <OpsCheck label="Check if included on purchase order or complete below" checked={c.includedOnPO} />
                            <div style={{ marginTop: 8 }}><TSFAddrBlock data={c} /></div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr>
                        <td className="ops-section-hdr" style={{ width: '50%' }}>C. End User/Ultimate Destination</td>
                        <td className="ops-section-hdr">D. Additional Parties</td>
                    </tr>
                    <tr>
                        <td style={{ verticalAlign: 'top', padding: '4px 8px' }}>
                            <OpsCheck label="Check if same as A. Purchaser" checked={e.sameAsPurchaser} />
                            <OpsCheck label="Check if same as B. Consignee/Ship To" checked={e.sameAsConsignee} />
                            <OpsCheck label="Check if included on purchase order or complete below" checked={e.includedOnPO} />
                            <div style={{ marginTop: 8 }}><TSFAddrBlock data={e} /></div>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '4px 8px' }}>
                            <OpsCheck label="Check if included on purchase order or complete below" checked={a.includedOnPO} />
                            <div style={{ display: 'flex', gap: '20px', margin: '4px 0' }}>
                                <OpsCheck label="Freight Forwarder" checked={a.freightForwarder} />
                                <OpsCheck label="Other" checked={a.other} />
                            </div>
                            <div style={{ display: 'flex', gap: '20px', margin: '4px 0' }}>
                                <OpsCheck label="Bank" checked={a.Bank} />
                                <OpsCheck label="Carrier" checked={a.Carrier} />
                            </div>
                            <div style={{ marginTop: 8 }}><TSFAddrBlock data={a} /></div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr><td className="ops-section-hdr">E. End-Use Information</td></tr>
                    <tr><td style={{ fontSize: 10, padding: '4px 8px', fontStyle: 'italic' }}>Explain in detail the end-use of the supplied product:</td></tr>
                    <tr><td className="ops-val ops-green" style={{ minHeight: 40, padding: 8, backgroundColor: '#dcfce7' }}>{gv(u.detailedExplanation)}</td></tr>
                    <tr>
                        <td style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ fontWeight: 700, fontSize: 11 }}>End-use:</span>
                                <span style={{ backgroundColor: 'red', color: 'white', padding: '2px 8px', fontWeight: 700, fontSize: 10 }}>PLEASE TICK</span>
                                <OpsCheck label="Chemical Weapons / Biological" checked={u.chemicalWeapons} />
                                <OpsCheck label="Military" checked={u.military} />
                                <OpsCheck label="Rockets/Missiles" checked={u.rocketsMissiles} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: 8 }}>
                                <OpsCheck label="Nuclear" checked={u.nuclear} />
                                <OpsCheck label="Space" checked={u.space} />
                                <OpsCheck label="Stock" checked={u.stock} />
                                <OpsCheck label="Others (specify)" checked={u.others} />
                                <div style={{ flex: 1, borderBottom: '1px solid #000', marginLeft: 8, height: 18 }}>{gv(u.othersSpecify)}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr><td className="ops-section-hdr" colSpan="4">F. Form Completed By</td></tr>
                    <tr>
                        <td className="ops-lbl" style={{ width: '15%' }}>Name</td>
                        <td className="ops-val ops-green" style={{ width: '35%', backgroundColor: '#dcfce7' }}>{gv(f.name)}</td>
                        <td className="ops-lbl" style={{ width: '15%' }}>City</td>
                        <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7' }}>{gv(f.city)}</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Company Name</td>
                        <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7' }}>{gv(f.companyName)}</td>
                        <td className="ops-lbl">State/Province</td>
                        <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7' }}>{gv(f.stateProvince)}</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Phone</td>
                        <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7' }}>{gv(f.phone)}</td>
                        <td className="ops-lbl">Country</td>
                        <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7' }}>{gv(f.country)}</td>
                    </tr>
                    <tr>
                        <td className="ops-lbl">Email</td>
                        <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7' }}>{gv(f.email)}</td>
                        <td className="ops-lbl">Signature</td>
                        <td className="ops-val ops-green" style={{ backgroundColor: '#dcfce7' }}>{gv(f.signature)}</td>
                    </tr>
                </tbody>
            </table>

            <table className="ops-table">
                <tbody>
                    <tr><td className="ops-section-hdr ops-internal-hdr" colSpan="4">For Internal Use Only</td></tr>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <td style={{ padding: '20px 8px', fontSize: 11 }}>
                            <span style={{ fontWeight: 700 }}>Reviewed by:</span>
                            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '300px', marginLeft: 10 }}>{gv(i.reviewedBy)}</span>
                        </td>
                        <td style={{ padding: '20px 8px', fontSize: 11, textAlign: 'right' }}>
                            <span style={{ fontWeight: 700 }}>Date:</span>
                            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '200px', marginLeft: 10 }}>{gv(i.reviewedDate)}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

const OrderProcessingForm = ({ data = {}, mode = 'header', title = 'Order Processing Sheet' }) => {
    const isTSF = mode === 'tsf';
    return (
        <div className="ops-wrap">
            <table className="ops-table">
                <tbody>
                    <tr>
                        <td className="ops-logo-cell" rowSpan="2"><div className="ops-emerson-logo">EMERSON</div></td>
                        <td className="ops-title-cell" colSpan="5">EMERSON AUTOMATION SOLUTIONS - PRESSURE MANAGEMENT</td>
                        <td className="ops-send-btn-cell" rowSpan="2">{!isTSF && <div className="ops-send-btn">SEND ORDER</div>}</td>
                    </tr>
                    <tr><td colSpan="5" className="ops-subtitle-cell">{isTSF ? 'Transaction Screening Form (TSF)' : title}</td></tr>
                </tbody>
            </table>
            {isTSF ? <TSFBody data={data} /> : <HeaderBody data={data} />}
            <table className="ops-table ops-footer-row">
                <tbody>
                    <tr>
                        <td style={{ textAlign: 'left', fontWeight: 400, fontSize: 9, width: '33.33%' }}>EMR - ITCG - F1001</td>
                        <td style={{ textAlign: 'center', fontWeight: 400, fontSize: 9, width: '33.33%' }}>Page 1 of 1</td>
                        <td style={{ textAlign: 'right', fontWeight: 400, fontSize: 9, width: '33.33%' }}>Last Revised 26-Oct-2015</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default OrderProcessingForm;
