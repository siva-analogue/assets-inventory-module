import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardList,
  Package,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  formatMoney,
  getApprovalPlan,
  initialApprovalRules,
  initialAssets,
  initialInventory,
  nextInventoryId,
  validateIndent,
} from "./workflow.js";

const today = () => new Date().toISOString().slice(0, 10);
const makeId = (indents) =>
  `IND-${String(indents.length + 1).padStart(3, "0")}`;
const nextPurchaseOrderId = (indents) => {
  const usedIds = new Set(indents.map((indent) => indent.purchaseOrder?.id).filter(Boolean));
  let number = 1;
  while (usedIds.has(`PO-${String(number).padStart(3, "0")}`)) number += 1;
  return `PO-${String(number).padStart(3, "0")}`;
};

function StatusBadge({ status }) {
  return <span className={`p2-status ${status.toLowerCase()}`}>{status}</span>;
}

function Phase2App({
  section,
  currentRole,
  onCurrentRoleChange,
  workspaceAssets,
  workspaceInventory,
  workspaceCategories = [],
  workspaceVendors = [],
  onInventoryChange,
}) {
  const rules = initialApprovalRules;
  const [currentAdmin, setCurrentAdmin] = useState(initialApprovalRules.selectedAdmins[0]);
  const [indents, setIndents] = useState([]);
  const [localInventory, setLocalInventory] = useState(initialInventory);
  const [showIndentForm, setShowIndentForm] = useState(false);
  const [indentType, setIndentType] = useState("Inventory");
  const [addingInventoryItem, setAddingInventoryItem] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [toast, setToast] = useState("");
  const inventory = workspaceInventory || localInventory;
  const assets = workspaceAssets || initialAssets;
  const updateInventory = onInventoryChange || setLocalInventory;
  const inventoryIdPreview = nextInventoryId(inventory);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const submitIndent = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const amount = Number(data.get("amount"));
    const quantity = Number(data.get("quantity"));
    let itemName = String(data.get("itemName") || "").trim();

    if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(quantity) || quantity < 1) {
      notify("Enter a non-negative amount and a whole-number quantity of at least 1.");
      return;
    }

    const type = String(data.get("type"));
    const requesterRole = String(data.get("requesterRole"));
    let inventoryItem = null;
    let inventoryForValidation = inventory;
    if (type === "Inventory") {
      if (addingInventoryItem) {
        itemName = String(data.get("newInventoryName") || "").trim();
        if (
          inventory.some(
            (item) => item.name.toLocaleLowerCase() === itemName.toLocaleLowerCase(),
          )
        ) {
          notify("This inventory item already exists. Select it from the inventory list.");
          return;
        }
        inventoryItem = {
          id: inventoryIdPreview,
          name: itemName,
          category: String(data.get("newInventoryCategory") || "Other"),
          unit: String(data.get("newInventoryUnit") || "Nos"),
          stock: 0,
          min: 0,
          location: String(data.get("newInventoryLocation") || "").trim(),
          vendor: "",
          approval: "No",
          active: true,
        };
        inventoryForValidation = [...inventory, inventoryItem];
      } else {
        const selectedId = String(data.get("inventoryItemId") || "");
        inventoryItem = inventory.find((item) => item.id === selectedId);
        if (!inventoryItem) {
          notify("Select an inventory item or add a new item before submitting.");
          return;
        }
        itemName = inventoryItem.name;
      }
    }

    if (!itemName) {
      notify("Enter an item or asset name.");
      return;
    }
    const checks = validateIndent(
      { type, itemName, quantity },
      inventoryForValidation,
      assets,
    );
    if (inventoryItem) checks.inventoryId = inventoryItem.id;
    const approvers = getApprovalPlan(type, requesterRole, amount, rules);
    const indent = {
      id: makeId(indents),
      inventoryItemId: type === "Inventory" ? inventoryItem.id : "",
      type,
      itemName,
      quantity,
      amount,
      reason: String(data.get("reason") || "").trim(),
      priority: String(data.get("priority")),
      requestedBy: String(data.get("requestedBy") || "").trim(),
      requesterRole,
      date: String(data.get("date")),
      photos: data.getAll("photos").filter((file) => file.size > 0).map((file) => file.name),
      checks,
      approvalSteps: approvers.map((approver) => ({
        approver,
        status: "Pending",
        comment: "",
        timestamp: "",
        actor: "",
        actorRole: "",
      })),
      currentLevel: 0,
      status: approvers.length ? "Pending" : "Approved",
      preferredVendor: (() => {
        const selectedVendorId = String(data.get("preferredVendorId") || "");
        const selectedVendor = workspaceVendors.find((vendor) => vendor.id === selectedVendorId);
        return selectedVendor ? { ...selectedVendor } : null;
      })(),
      purchaseStatus: checks.recommendation === "Move to purchase"
        ? approvers.length ? "Awaiting indent approval" : "Pending purchase approval"
        : "",
      purchaseApproval: null,
      quotations: [],
      purchaseOrder: null,
      paymentStatus: "Pending",
      invoiceName: "",
      autoApproved: approvers.length === 0 && requesterRole === "Admin" && rules.adminAutoApprove,
      closedAt: "",
    };

    if (addingInventoryItem && inventoryItem) {
      updateInventory((previous) => [...previous, inventoryItem]);
    }
    setIndents((previous) => [indent, ...previous]);
    setShowIndentForm(false);
    setAddingInventoryItem(false);
    setSelectedInventoryId("");
    notify(indent.autoApproved ? `${indent.id} submitted and auto-approved` : `${indent.id} submitted for approval`);
  };

  const canApproveStep = (step) => {
    if (currentRole === "Admin") {
      return step?.approver === "Admin" || step?.approver === currentAdmin;
    }
    return currentRole === "Committee Member" && step?.approver === "Committee";
  };

  const decideIndent = (indent, decision, comment) => {
    if (currentRole === "Staff") {
      notify("Staff do not have approval permission.");
      return;
    }
    const activeStep = indent.approvalSteps[indent.currentLevel];
    if (!canApproveStep(activeStep)) {
      notify(`This approval is assigned to ${activeStep?.approver || "another approver"}.`);
      return;
    }

    if (decision === "Rejected" && !comment.trim()) {
      notify("A rejection note is required.");
      return;
    }

    setIndents((previous) =>
      previous.map((record) => {
        if (record.id !== indent.id || record.status !== "Pending") return record;
        const level = record.currentLevel;
        const approvalSteps = record.approvalSteps.map((step, index) =>
          index === level
            ? {
                ...step,
                status: decision,
                comment: comment.trim(),
                timestamp: new Date().toISOString(),
                actor: currentRole === "Admin" ? currentAdmin : currentRole,
                actorRole: currentRole,
              }
            : step,
        );
        const finished = decision === "Rejected" || level === approvalSteps.length - 1;
        const status = decision === "Rejected" ? "Rejected" : finished ? "Approved" : "Pending";
        return {
          ...record,
          approvalSteps,
          currentLevel: decision === "Approved" && !finished ? level + 1 : level,
          status,
          purchaseStatus: record.purchaseStatus
            ? decision === "Rejected"
              ? "Indent rejected"
              : status === "Approved"
                ? "Pending purchase approval"
                : record.purchaseStatus
            : "",
        };
      }),
    );
    notify(decision === "Approved" ? "Approval recorded." : "Indent rejected.");
  };

  const closeIndent = (indent) => {
    if (indent.status !== "Approved") return;
    if (currentRole === "Staff") {
      const approvedByAdmin = indent.approvalSteps.some(
        (step) => step.status === "Approved" && step.actorRole === "Admin",
      );
      if (
        indent.type !== "Inventory" ||
        indent.checks.recommendation !== "Issue from stock" ||
        !approvedByAdmin
      ) {
        notify("Staff may issue stock only through an indent approved by an admin.");
        return;
      }
    } else if (currentRole === "Committee Member") {
      const approvedByCommittee = indent.approvalSteps.some(
        (step) =>
          step.status === "Approved" && step.actor === "Committee Member",
      );
      if (
        indent.type === "Inventory" &&
        indent.checks.recommendation === "Issue from stock" &&
        !approvedByCommittee
      ) {
        notify("Committee stock issues require approval from an authorized committee member.");
        return;
      }
    }

    if (indent.type === "Inventory" && indent.checks.recommendation === "Issue from stock") {
      const item = inventory.find((record) => record.id === indent.checks.inventoryId);
      if (!item || item.stock < indent.quantity) {
        notify("Available stock changed; this indent can no longer be issued from stock.");
        return;
      }
      updateInventory((previous) =>
        previous.map((record) =>
          record.id === item.id ? { ...record, stock: record.stock - indent.quantity } : record,
        ),
      );
    }

    setIndents((previous) =>
      previous.map((record) =>
        record.id === indent.id
          ? { ...record, status: "Closed", closedAt: new Date().toISOString() }
          : record,
      ),
    );
    notify("Indent closed.");
  };

  const openIndentForm = () => {
    setIndentType("Inventory");
    setAddingInventoryItem(inventory.length === 0);
    setSelectedInventoryId(inventory[0]?.id || "");
    setShowIndentForm(true);
  };

  const decidePurchase = (indent, decision) => {
    if (currentRole === "Staff") {
      notify("Staff do not have purchase approval permission.");
      return;
    }
    if (indent.status !== "Approved" || indent.purchaseStatus !== "Pending purchase approval") return;
    const approval = {
      decision,
      actor: currentRole === "Admin" ? currentAdmin : currentRole,
      role: currentRole,
      timestamp: new Date().toISOString(),
    };
    setIndents((previous) =>
      previous.map((record) =>
        record.id === indent.id
          ? {
              ...record,
              purchaseStatus: decision === "Approved" ? "Quotation collection" : "Purchase rejected",
              purchaseApproval: approval,
            }
          : record,
      ),
    );
    notify(decision === "Approved" ? "Purchase approved. Add vendor quotations to continue." : "Purchase request rejected.");
  };

  const updatePurchase = (indentId, fields) => {
    setIndents((previous) =>
      previous.map((record) => record.id === indentId ? { ...record, ...fields } : record),
    );
  };

  const addQuotation = (indent, vendorId, unitPrice, quantity) => {
    const vendor = workspaceVendors.find((item) => item.id === vendorId);
    if (!vendor || !Number.isFinite(unitPrice) || unitPrice <= 0 ||
      !Number.isInteger(quantity) || quantity < (indent.checks.purchaseQuantity ?? indent.quantity)) {
      notify("Select a vendor and enter a valid price and quantity that covers the purchase request.");
      return;
    }
    if (indent.quotations.some((quote) => quote.vendor.id === vendorId)) {
      notify("A quotation from this vendor has already been added.");
      return;
    }
    const quotation = {
      id: `${indent.id}-Q${String(indent.quotations.length + 1).padStart(2, "0")}`,
      vendor: { ...vendor },
      unitPrice,
      quantity,
      total: unitPrice * quantity,
      createdAt: new Date().toISOString(),
    };
    updatePurchase(indent.id, { quotations: [...indent.quotations, quotation] });
    notify(`Quotation added from ${vendor.name}.`);
  };

  const generatePurchaseOrder = (indent, quotationId) => {
    if (currentRole === "Staff" || indent.purchaseStatus !== "Quotation collection") return;
    if (indent.quotations.length < 2) {
      notify("Add quotations from at least two different vendors before generating a PO.");
      return;
    }
    const quotation = indent.quotations.find((quote) => quote.id === quotationId);
    if (!quotation) {
      notify("Select a valid vendor quotation.");
      return;
    }
    const purchaseOrder = {
      id: nextPurchaseOrderId(indents),
      quotationId: quotation.id,
      vendor: quotation.vendor,
      unitPrice: quotation.unitPrice,
      quantity: quotation.quantity,
      total: quotation.total,
      generatedAt: new Date().toISOString(),
    };
    updatePurchase(indent.id, {
      purchaseOrder,
      purchaseStatus: "PO generated",
      paymentStatus: "Pending",
    });
    notify(`${purchaseOrder.id} generated for ${quotation.vendor.name}.`);
  };

  const markPurchased = (indent) => {
    if (currentRole === "Staff" || indent.purchaseStatus !== "PO generated") return;
    updatePurchase(indent.id, {
      purchaseStatus: "Purchased",
      purchasedAt: new Date().toISOString(),
    });
    notify("Purchase recorded. Complete stock-in when the goods arrive.");
  };

  const receiveStock = (indent) => {
    if (currentRole === "Staff" || indent.purchaseStatus !== "Purchased") return;
    if (indent.type === "Inventory" && indent.inventoryItemId) {
      const itemExists = inventory.some((item) => item.id === indent.inventoryItemId);
      if (!itemExists) {
        notify("The linked inventory item no longer exists; stock-in was not recorded.");
        return;
      }
      updateInventory((previous) =>
        previous.map((item) =>
          item.id === indent.inventoryItemId
            ? {
                ...item,
                stock: item.stock + indent.purchaseOrder.quantity,
                vendor: indent.purchaseOrder.vendor.name,
              }
            : item,
        ),
      );
    }
    setIndents((previous) =>
      previous.map((record) =>
        record.id === indent.id
          ? { ...record, purchaseStatus: "Stock received", stockInAt: new Date().toISOString() }
          : record,
      ),
    );
    notify("Stock-in recorded and inventory updated.");
  };

  return (
    <div className="p2-shell p2-embedded">
      <main className="p2-main">
        <div className="p2-content">
          {section === "Purchases" ? (
            <Purchases
              indents={indents}
              currentRole={currentRole}
              vendors={workspaceVendors}
              decidePurchase={decidePurchase}
              addQuotation={addQuotation}
              generatePurchaseOrder={generatePurchaseOrder}
              markPurchased={markPurchased}
              receiveStock={receiveStock}
              updatePurchase={updatePurchase}
            />
          ) : <IndentManagement
            indents={indents}
            openIndentForm={openIndentForm}
            closeIndent={closeIndent}
            currentRole={currentRole}
            currentAdmin={currentAdmin}
            onCurrentAdminChange={setCurrentAdmin}
            onCurrentRoleChange={onCurrentRoleChange}
            canApproveStep={canApproveStep}
            decideIndent={decideIndent}
          />
          }
        </div>
      </main>

      {showIndentForm && (
        <div className="p2-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowIndentForm(false);
        }}>
          <section className="p2-modal">
            <div className="p2-modal-head">
              <div><span className="p2-eyebrow">NEW REQUEST</span><h2>Raise an indent</h2><p>System checks run when the request is submitted.</p></div>
              <button className="p2-close" aria-label="Close form" onClick={() => setShowIndentForm(false)}><X size={18} /></button>
            </div>
            <form className="p2-form" onSubmit={submitIndent}>
              <label className="p2-field"><span>Type</span>
                <select
                  name="type"
                  value={indentType}
                  onChange={(event) => {
                    setIndentType(event.target.value);
                    setAddingInventoryItem(false);
                  }}
                  required
                >
                  <option>Inventory</option><option>Asset</option><option>Repair</option>
                </select>
              </label>
              {indentType === "Inventory" ? (
                <>
                  {!addingInventoryItem ? (
                    <div className="p2-field p2-inventory-picker">
                      <label className="p2-field"><span>Inventory item</span>
                        <select
                          name="inventoryItemId"
                          value={selectedInventoryId}
                          onChange={(event) => setSelectedInventoryId(event.target.value)}
                          required
                        >
                          <option value="">Select an inventory item</option>
                          {inventory.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.id} · {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="p2-button secondary p2-add-inventory"
                        onClick={() => setAddingInventoryItem(true)}
                      >
                        <Plus size={14} /> Add inventory item
                      </button>
                      {!inventory.length && (
                        <small>No inventory items yet. Add one to create the indent.</small>
                      )}
                    </div>
                  ) : (
                    <div className="p2-inventory-create p2-span-two">
                      <div className="p2-inventory-create-head">
                        <div>
                          <strong>New inventory item</strong>
                          <span>It will be added to Inventory Master when you submit this indent.</span>
                        </div>
                        {inventory.length > 0 && (
                          <button
                            type="button"
                            className="p2-text-button"
                            onClick={() => setAddingInventoryItem(false)}
                          >
                            Choose existing item
                          </button>
                        )}
                      </div>
                      <div className="p2-inventory-create-fields">
                        <label className="p2-field"><span>Inventory ID</span><input value={inventoryIdPreview} readOnly /></label>
                        <label className="p2-field"><span>Item name</span><input name="newInventoryName" placeholder="Enter new stock item" required /></label>
                        <label className="p2-field"><span>Category</span>
                          <select name="newInventoryCategory" defaultValue={workspaceCategories[0]?.name || "Other"}>
                            {(workspaceCategories.length ? workspaceCategories : [{ name: "Other" }]).map((category) => (
                              <option key={category.name}>{category.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="p2-field"><span>Unit</span>
                          <select name="newInventoryUnit" defaultValue="Nos">
                            {["Nos", "Liters", "Kg", "Meters", "Rolls", "Packs", "Boxes"].map((unit) => <option key={unit}>{unit}</option>)}
                          </select>
                        </label>
                        <label className="p2-field p2-span-two"><span>Storage location</span><input name="newInventoryLocation" placeholder="Store room / location" required /></label>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <label className="p2-field"><span>Item / asset name</span><input name="itemName" placeholder="Enter item or registered asset name" required /></label>
              )}
              <label className="p2-field p2-span-two"><span>Preferred vendor</span>
                <select name="preferredVendorId" defaultValue="">
                  <option value="">No preferred vendor</option>
                  {workspaceVendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {[
                        vendor.id,
                        vendor.name,
                        vendor.type,
                        vendor.service,
                        `Contact: ${vendor.contact}`,
                        `Phone: ${vendor.phone}`,
                        `Email: ${vendor.email}`,
                        `Address: ${vendor.address}`,
                        `GST: ${vendor.gst}`,
                        `Rating: ${vendor.rating}`,
                      ].join(" · ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="p2-field"><span>Quantity</span><input name="quantity" type="number" min="1" step="1" defaultValue="1" required /></label>
              <label className="p2-field"><span>Estimated amount (₹)</span><input name="amount" type="number" min="0" step="0.01" defaultValue="0" required /></label>
              <label className="p2-field"><span>Priority</span>
                <select name="priority" defaultValue="Medium">
                  <option>Low</option><option>Medium</option><option>High</option><option>Emergency</option>
                </select>
              </label>
              <label className="p2-field"><span>Requested by</span><input name="requestedBy" placeholder="Your name" required /></label>
              <label className="p2-field"><span>Requester role</span><input name="requesterRole" value={currentRole} readOnly /></label>
              <label className="p2-field"><span>Date</span><input name="date" type="date" defaultValue={today()} required /></label>
              <label className="p2-field p2-span-two"><span>Reason</span><textarea name="reason" rows="3" placeholder="Explain why this request is needed" required /></label>
              <label className="p2-field p2-span-two"><span>Photos</span><input name="photos" type="file" accept="image/*" multiple /></label>
              <div className="p2-form-note p2-span-two"><ShieldCheck size={16} /> Inventory stock, asset existence, warranty and AMC are checked automatically.</div>
              <div className="p2-form-actions p2-span-two">
                <button type="button" className="p2-button secondary" onClick={() => setShowIndentForm(false)}>Cancel</button>
                <button type="submit" className="p2-button primary"><Plus size={16} /> {addingInventoryItem ? "Create item & raise indent" : "Submit indent"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && <div className="p2-toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

function PageHeader({ title, description, action }) {
  return (
    <div className="p2-page-head">
      <div><span className="p2-eyebrow">PHASE 2 · OPERATIONS</span><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

function IndentManagement({
  indents,
  openIndentForm,
  closeIndent,
  currentRole,
  currentAdmin,
  onCurrentAdminChange,
  onCurrentRoleChange,
  canApproveStep,
  decideIndent,
}) {
  const counts = {
    total: indents.length,
    pending: indents.filter((indent) => indent.status === "Pending").length,
    approved: indents.filter((indent) => indent.status === "Approved").length,
    closed: indents.filter((indent) => indent.status === "Closed").length,
  };
  return (
    <>
      <PageHeader
        title="Indent Management"
        description="Raise and track purchase, usage, asset and repair requests."
        action={(
          <div className="p2-indent-header-actions">
            <label className="p2-field">
              <span>Acting role</span>
              <select value={currentRole} onChange={(event) => onCurrentRoleChange(event.target.value)}>
                {["Admin", "Committee Member", "Staff"].map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            {currentRole === "Admin" && initialApprovalRules.selectedAdmins.length > 1 && (
              <label className="p2-field">
                <span>Acting admin</span>
                <select value={currentAdmin} onChange={(event) => onCurrentAdminChange(event.target.value)}>
                  {initialApprovalRules.selectedAdmins.map((admin) => <option key={admin}>{admin}</option>)}
                </select>
              </label>
            )}
            <button className="p2-button primary" onClick={openIndentForm}><Plus size={16} /> Raise indent</button>
          </div>
        )}
      />
      <div className="p2-stats">
        <Stat label="Total indents" value={counts.total} />
        <Stat label="Pending review" value={counts.pending} />
        <Stat label="Approved" value={counts.approved} />
        <Stat label="Closed" value={counts.closed} />
      </div>
      <div className="p2-list">
        {indents.map((indent) => (
          <IndentCard
            key={indent.id}
            indent={indent}
            currentRole={currentRole}
            action={indent.status === "Pending" ? (
              canApproveStep(indent.approvalSteps[indent.currentLevel]) ? (
                <ApprovalActions
                  key={`${indent.id}-${indent.currentLevel}`}
                  indent={indent}
                  decideIndent={decideIndent}
                />
              ) : (
                <div className="p2-form-note">
                  <ShieldCheck size={16} />
                  Awaiting approval from {indent.approvalSteps[indent.currentLevel]?.approver}.
                </div>
              )
            ) : indent.status === "Approved" ? (
              <button className="p2-button primary" onClick={() => closeIndent(indent)}>
                {indent.type === "Inventory" && indent.checks.recommendation === "Issue from stock" ? "Issue stock & close" : "Close indent"}
              </button>
            ) : null}
          />
        ))}
        {!indents.length && <EmptyCard text="No indents yet. Raise a request to start the approval workflow." />}
      </div>
    </>
  );
}

function Purchases({
  indents,
  currentRole,
  vendors,
  decidePurchase,
  addQuotation,
  generatePurchaseOrder,
  markPurchased,
  receiveStock,
  updatePurchase,
}) {
  const purchaseRequests = indents.filter((indent) => indent.purchaseStatus);
  const pendingApproval = purchaseRequests.filter((indent) => indent.purchaseStatus === "Pending purchase approval");
  const activeRequests = purchaseRequests.filter((indent) =>
    ["Awaiting indent approval", "Pending purchase approval", "Quotation collection", "Purchase rejected", "Indent rejected"].includes(indent.purchaseStatus),
  );
  const purchaseOrders = purchaseRequests.filter((indent) =>
    ["PO generated", "Purchased"].includes(indent.purchaseStatus),
  );
  const purchasedHistory = purchaseRequests.filter((indent) => indent.purchaseStatus === "Stock received");
  const renderPurchaseCard = (indent) => (
    <article className="p2-card" key={indent.id}>
      <div className="p2-card-head">
        <div>
          <span className="p2-indent-id">{indent.id} · {indent.type}{indent.inventoryItemId ? ` · ${indent.inventoryItemId}` : ""}</span>
          <h2>{indent.itemName}</h2>
          <p>{indent.checks.purchaseQuantity ?? indent.quantity} to purchase <i>·</i> {indent.quantity} requested <i>·</i> {formatMoney(indent.amount)} estimate <i>·</i> {indent.date}</p>
        </div>
        <StatusBadge status={indent.purchaseStatus} />
      </div>
      <div className="p2-request-info">
        <div><span>Requested by</span><strong>{indent.requestedBy}</strong></div>
        <div><span>Preferred vendor</span><strong>{indent.preferredVendor ? `${indent.preferredVendor.name} · ${indent.preferredVendor.contact} · ${indent.preferredVendor.phone} · ${indent.preferredVendor.email}` : "Not specified"}</strong></div>
        <div><span>Purchase reason</span><strong>{indent.reason}</strong></div>
        <div><span>Indent approval</span><strong>{indent.status}</strong></div>
      </div>
      {indent.purchaseApproval && (
        <div className="p2-form-note">
          <ShieldCheck size={16} />
          {indent.purchaseApproval.decision} by {indent.purchaseApproval.actor} · {new Date(indent.purchaseApproval.timestamp).toLocaleString()}
        </div>
      )}
      {indent.purchaseStatus === "Pending purchase approval" && currentRole !== "Staff" && (
        <div className="p2-card-actions">
          <button className="p2-button danger" onClick={() => decidePurchase(indent, "Rejected")}>Reject purchase</button>
          <button className="p2-button primary" onClick={() => decidePurchase(indent, "Approved")}>Approve purchase</button>
        </div>
      )}
      {indent.purchaseStatus === "Quotation collection" && currentRole !== "Staff" && (
        <QuotationManager indent={indent} vendors={vendors} addQuotation={addQuotation} generatePurchaseOrder={generatePurchaseOrder} />
      )}
      {indent.purchaseOrder && (
        <PurchaseOrderDetails
          indent={indent}
          currentRole={currentRole}
          markPurchased={markPurchased}
          receiveStock={receiveStock}
          updatePurchase={updatePurchase}
        />
      )}
    </article>
  );

  return (
    <>
      <PageHeader title="Purchases" description="Compare quotations, generate purchase orders, record invoices and payment, then receive stock." />
      <div className="p2-stats">
        <Stat label="Purchase requests" value={purchaseRequests.length} />
        <Stat label="Awaiting approval" value={pendingApproval.length} />
        <Stat label="Active purchase orders" value={purchaseOrders.length} />
        <Stat label="Stock received" value={purchasedHistory.length} />
      </div>
      <section className="p2-purchase-section">
        <h2>Purchase requests</h2>
        <div className="p2-list">
          {activeRequests.map(renderPurchaseCard)}
          {!activeRequests.length && <EmptyCard text="Purchase requests from indents will appear here." />}
        </div>
      </section>
      <section className="p2-purchase-section">
        <h2>Purchase orders</h2>
        <div className="p2-list">
          {purchaseOrders.map(renderPurchaseCard)}
          {!purchaseOrders.length && <EmptyCard text="Approved quotations will generate purchase orders here." />}
        </div>
      </section>
      <section className="p2-purchase-section">
        <h2>Purchased history</h2>
        <div className="p2-list">
          {purchasedHistory.map(renderPurchaseCard)}
          {!purchasedHistory.length && <EmptyCard text="Received purchases will be listed here." />}
        </div>
      </section>
    </>
  );
}

function QuotationManager({ indent, vendors, addQuotation, generatePurchaseOrder }) {
  const [vendorId, setVendorId] = useState(indent.preferredVendor?.id || "");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState(String(indent.checks.purchaseQuantity ?? indent.quantity));
  const requiredQuantity = indent.checks.purchaseQuantity ?? indent.quantity;

  const submitQuotation = (event) => {
    event.preventDefault();
    addQuotation(indent, vendorId, Number(unitPrice), Number(quantity));
    setVendorId("");
    setUnitPrice("");
  };

  return (
    <div className="p2-procurement">
      <h3>Vendor quotations ({indent.quotations.length}/2 minimum)</h3>
      {indent.quotations.length > 0 && (
        <div className="p2-quotation-list">
          {indent.quotations.map((quote) => (
            <div className="p2-quotation" key={quote.id}>
              <div>
                <strong>{quote.vendor.name}</strong>
                <span>{quote.vendor.contact} · {quote.vendor.phone} · {quote.vendor.email}</span>
                <span>GST: {quote.vendor.gst} · {quote.vendor.address}</span>
              </div>
              <div><strong>{formatMoney(quote.unitPrice)} / unit</strong><span>Qty {quote.quantity} · Total {formatMoney(quote.total)}</span></div>
              <button
                className="p2-button secondary"
                disabled={indent.quotations.length < 2}
                onClick={() => generatePurchaseOrder(indent, quote.id)}
              >
                Generate PO
              </button>
            </div>
          ))}
        </div>
      )}
      {vendors.length > indent.quotations.length ? (
        <form className="p2-quotation-form" onSubmit={submitQuotation}>
          <label className="p2-field"><span>Vendor</span>
            <select value={vendorId} onChange={(event) => setVendorId(event.target.value)} required>
              <option value="">Select vendor</option>
              {vendors.filter((vendor) => !indent.quotations.some((quote) => quote.vendor.id === vendor.id)).map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {[vendor.id, vendor.name, vendor.type, vendor.service, vendor.contact, vendor.phone, vendor.email, vendor.address, `GST ${vendor.gst}`, `Rating ${vendor.rating}`].join(" · ")}
                </option>
              ))}
            </select>
          </label>
          <label className="p2-field"><span>Unit price (₹)</span>
            <input type="number" min="0.01" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required />
          </label>
          <label className="p2-field"><span>Quantity (minimum {requiredQuantity})</span>
            <input type="number" min={requiredQuantity} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
          </label>
          <button className="p2-button primary" type="submit">Add quotation</button>
        </form>
      ) : <div className="p2-form-note">No additional vendors are available for quotations.</div>}
      {indent.quotations.length < 2 && <div className="p2-inline-help">Collect quotes from at least two different vendors before generating a purchase order.</div>}
    </div>
  );
}

function PurchaseOrderDetails({ indent, currentRole, markPurchased, receiveStock, updatePurchase }) {
  const purchaseOrder = indent.purchaseOrder;
  const isPurchased = ["Purchased", "Stock received"].includes(indent.purchaseStatus);
  const isReceived = indent.purchaseStatus === "Stock received";
  return (
    <div className="p2-procurement">
      <div className="p2-po-heading">
        <div><h3>Purchase order {purchaseOrder.id}</h3><span>Generated {new Date(purchaseOrder.generatedAt).toLocaleString()}</span></div>
        <strong>{formatMoney(purchaseOrder.total)}</strong>
      </div>
      <div className="p2-request-info">
        <div><span>Selected vendor</span><strong>{purchaseOrder.vendor.name} · {purchaseOrder.vendor.contact} · {purchaseOrder.vendor.phone} · {purchaseOrder.vendor.email}</strong></div>
        <div><span>Unit price</span><strong>{formatMoney(purchaseOrder.unitPrice)}</strong></div>
        <div><span>Quantity</span><strong>{purchaseOrder.quantity}</strong></div>
        <div><span>GST / address</span><strong>{purchaseOrder.vendor.gst} · {purchaseOrder.vendor.address}</strong></div>
      </div>
      <div className="p2-po-fields">
        <label className="p2-field"><span>Payment status</span>
          <select
            value={indent.paymentStatus || "Pending"}
            onChange={(event) => updatePurchase(indent.id, { paymentStatus: event.target.value })}
          >
            {["Pending", "Partially Paid", "Paid"].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        {isPurchased && (
          <label className="p2-field"><span>Invoice upload</span>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => updatePurchase(indent.id, { invoiceName: event.target.files?.[0]?.name || "" })}
            />
          </label>
        )}
      </div>
      {indent.invoiceName && <div className="p2-photos">Invoice: {indent.invoiceName} (file name only; not uploaded)</div>}
      {indent.purchasedAt && <div className="p2-closed">Purchased {new Date(indent.purchasedAt).toLocaleString()}</div>}
      {indent.stockInAt && <div className="p2-closed">Stock received {new Date(indent.stockInAt).toLocaleString()}</div>}
      {!isPurchased && currentRole !== "Staff" && (
        <div className="p2-card-actions">
          <button className="p2-button primary" onClick={() => markPurchased(indent)}>Record purchase</button>
        </div>
      )}
      {isPurchased && !isReceived && currentRole !== "Staff" && (
        <div className="p2-card-actions">
          <button className="p2-button primary" onClick={() => receiveStock(indent)}>
            {indent.type === "Inventory" ? "Stock In" : "Mark received"}
          </button>
        </div>
      )}
    </div>
  );
}

function IndentCard({ indent, action, currentRole }) {
  return (
    <article className="p2-card">
      <div className="p2-card-head">
        <div><span className="p2-indent-id">{indent.id} · {indent.type}{indent.inventoryItemId ? ` · ${indent.inventoryItemId}` : ""}</span><h2>{indent.itemName}</h2><p>{indent.quantity} requested <i>·</i> {formatMoney(indent.amount)} <i>·</i> {indent.date}</p></div>
        <StatusBadge status={indent.status} />
      </div>
      <div className="p2-request-info">
        <div><span>Requested by</span><strong>{indent.requestedBy} · {indent.requesterRole}</strong></div>
        <div><span>Priority</span><strong>{indent.priority}</strong></div>
        <div><span>Reason</span><strong>{indent.reason}</strong></div>
        <div><span>System validation</span><strong>{indent.checks.summary}</strong></div>
        <div><span>Preferred vendor</span><strong>{indent.preferredVendor ? `${indent.preferredVendor.name} · ${indent.preferredVendor.phone} · ${indent.preferredVendor.email}` : "Not specified"}</strong></div>
      </div>
      {indent.checks.recommendation && (
        <div className={`p2-recommendation ${indent.checks.recommendation === "Issue from stock" ? "good" : ""}`}>
          <Package size={15} /> Suggestion: <strong>{indent.checks.recommendation}</strong>
        </div>
      )}
      {indent.photos.length > 0 && <div className="p2-photos">Photos: {indent.photos.join(", ")}</div>}
      {indent.autoApproved && <div className="p2-auto-approved"><CheckCircle2 size={15} /> Auto-approved by the admin requester-role rule.</div>}
      {!!indent.approvalSteps.length && (
        <div className="p2-steps">
          {indent.approvalSteps.map((step, index) => (
            <div className={`p2-step ${step.status.toLowerCase()} ${indent.status === "Pending" && indent.currentLevel === index ? "current" : ""}`} key={`${indent.id}-${index}`}>
              <span>Level {index + 1} · {step.approver}</span>
              <StatusBadge status={step.status} />
              {step.comment && <small>{step.comment}</small>}
              {step.timestamp && <small>{step.actor} · {new Date(step.timestamp).toLocaleString()}</small>}
            </div>
          ))}
        </div>
      )}
      {indent.closedAt && <div className="p2-closed">Closed {new Date(indent.closedAt).toLocaleString()}</div>}
      {action && <div className="p2-card-actions">{action}</div>}
      {indent.status === "Approved" && !action && currentRole === "Staff" && (
        <div className="p2-form-note"><ShieldCheck size={16} /> Admin or authorized committee members must close this indent.</div>
      )}
    </article>
  );
}

function ApprovalActions({ indent, decideIndent }) {
  const [comment, setComment] = useState("");

  return (
    <div className="p2-approval-actions">
      <label className="p2-field">
        <span>Approval comment / rejection note</span>
        <textarea
          aria-label={`Approval comment for ${indent.id}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows="2"
          placeholder="Add a note for the approval record"
        />
      </label>
      <div className="p2-action-row">
        <button
          className="p2-button danger"
          disabled={!comment.trim()}
          onClick={() => decideIndent(indent, "Rejected", comment)}
        >
          Reject
        </button>
        <button
          className="p2-button primary"
          onClick={() => decideIndent(indent, "Approved", comment)}
        >
          <Check size={15} /> Approve level
        </button>
      </div>
    </div>
  );
}

function ApprovalRules({ rules, updateRules, saveRules }) {
  const updateTier = (index, key, value) => {
    updateRules({
      amountTiers: rules.amountTiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, [key]: value } : tier,
      ),
    });
  };
  const setTypeApprover = (type, approver) => {
    updateRules({ typeApprovers: { ...rules.typeApprovers, [type]: approver } });
  };
  const admins = rules.selectedAdmins.join(", ");

  return (
    <>
      <PageHeader title="Approval Rules" description="Configure how amount, request type and requester role determine the approval path." />
      <form className="p2-rules-form" onSubmit={saveRules}>
        <section className="p2-panel">
          <PanelHeading title="By amount" description="The first matching amount limit sets the minimum approval count." />
          <div className="p2-rule-list">
            {rules.amountTiers.map((tier, index) => (
              <div className="p2-rule-row" key={`amount-${index}`}>
                <strong>{index === 0 ? "₹0 –" : index === 1 ? `Above ${formatMoney(rules.amountTiers[0].maxAmount)} –` : `Above ${formatMoney(rules.amountTiers[1].maxAmount)}`}</strong>
                {index < 2 ? (
                  <label className="p2-rule-field"><span>Up to (₹)</span><input type="number" min="0" value={tier.maxAmount} onChange={(event) => updateTier(index, "maxAmount", Number(event.target.value))} /></label>
                ) : <span className="p2-unlimited">No upper limit</span>}
                <label className="p2-rule-field"><span>Approvals</span>
                  <select value={tier.approvals} onChange={(event) => updateTier(index, "approvals", Number(event.target.value))}>
                    {[0, 1, 2, 3].map((count) => <option value={count} key={count}>{count}</option>)}
                  </select>
                </label>
              </div>
            ))}
          </div>
          <p className="p2-inline-help">₹2,000 or less uses the first band; values above a limit use the next band.</p>
        </section>

        <section className="p2-panel">
          <PanelHeading title="By request type" description="Select the default approver group for each type." />
          <div className="p2-rule-list">
            {Object.entries(rules.typeApprovers).map(([type, approver]) => (
              <div className="p2-rule-row" key={type}>
                <strong>{type}</strong>
                <label className="p2-rule-field"><span>Approver</span>
                  <select value={approver} onChange={(event) => setTypeApprover(type, event.target.value)}>
                    {["Admin", "Committee", "Committee rules"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="p2-panel">
          <PanelHeading title="By requester role" description="Role rules combine with amount and type requirements; the largest approval count applies." />
          <div className="p2-rule-list">
            <div className="p2-rule-row"><strong>Staff request</strong>
              <label className="p2-rule-field"><span>Minimum admin approvals</span>
                <select value={rules.staffApprovals} onChange={(event) => updateRules({ staffApprovals: Number(event.target.value) })}>
                  {[1, 2, 3].map((count) => <option value={count} key={count}>{count}</option>)}
                </select>
              </label>
            </div>
            <div className="p2-rule-row"><strong>Committee request</strong>
              <label className="p2-rule-field"><span>Selected admin approvals</span>
                <select value={rules.committeeApprovals} onChange={(event) => updateRules({ committeeApprovals: Number(event.target.value) })}>
                  {[1, 2, 3].map((count) => <option value={count} key={count}>{count}</option>)}
                </select>
              </label>
            </div>
            <label className="p2-rule-field p2-admin-list"><span>Approval admins (comma-separated; distinct admins approve each level)</span>
              <input value={admins} placeholder="Society Admin 1, Society Admin 2" onChange={(event) => updateRules({ selectedAdmins: event.target.value.split(",") })} />
            </label>
            <label className="p2-toggle-row"><span><strong>Admin request</strong><small>Allow eligible admin requests to be auto-approved.</small></span>
              <input type="checkbox" checked={rules.adminAutoApprove} onChange={(event) => updateRules({ adminAutoApprove: event.target.checked })} />
            </label>
          </div>
        </section>
        <div className="p2-save-row"><span>Rule changes apply to new indents only.</span><button className="p2-button primary" type="submit">Save approval rules</button></div>
      </form>
    </>
  );
}

function RolesPermissions({
  currentRole,
  setCurrentRole,
  currentAdmin,
  setCurrentAdmin,
  selectedAdmins,
}) {
  return (
    <>
      <PageHeader title="Roles & Permissions" description="Access policy for admins, staff and committee members." />
      <section className="p2-panel p2-active-role">
        <div><h2>Active demo role</h2><p>Switch roles to test access in the approval queue.</p></div>
        <div className="p2-active-role-controls">
          <select aria-label="Active role" value={currentRole} onChange={(event) => setCurrentRole(event.target.value)}>
            {rolePermissions.map(({ role }) => <option key={role}>{role}</option>)}
          </select>
          {currentRole === "Admin" && (
            <select aria-label="Active admin" value={currentAdmin} onChange={(event) => setCurrentAdmin(event.target.value)}>
              {selectedAdmins.map((admin) => <option key={admin}>{admin}</option>)}
            </select>
          )}
        </div>
      </section>
      <section className="p2-panel p2-permission-panel">
        <PanelHeading title="Permission matrix" description="Permissions enforced by the Phase 2 demo workflow." />
        <div className="p2-table-scroll">
          <table className="p2-table">
            <thead><tr><th>Action</th>{rolePermissions.map(({ role }) => <th key={role}>{role}</th>)}</tr></thead>
            <tbody>
              {[
                ["Raise Indent", "raiseIndent"],
                ["Approve", "approve"],
                ["Issue Stock", "issueStock"],
                ["View Reports", "viewReports"],
              ].map(([label, key]) => (
                <tr key={key}><th>{label}</th>
                  {rolePermissions.map((role) => (
                    <td key={role.role}><span className={`p2-permission ${role[key] === "Not allowed" ? "denied" : ""}`}>{role[key]}</span></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p2-form-note"><ShieldCheck size={16} /> Staff must request stock through an indent and cannot approve it. Committee members can approve assigned committee requests and issue stock when authorized to approve.</div>
      </section>
    </>
  );
}

function PanelHeading({ title, description }) {
  return <div className="p2-panel-heading"><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function Stat({ label, value }) {
  return <div className="p2-stat"><span>{label}</span><strong>{value}</strong></div>;
}

function EmptyCard({ text }) {
  return <div className="p2-panel p2-empty"><ClipboardList size={23} /><strong>Nothing to show yet</strong><span>{text}</span></div>;
}

export default Phase2App;
