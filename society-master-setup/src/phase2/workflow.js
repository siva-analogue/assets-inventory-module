export const initialApprovalRules = {
  amountTiers: [
    { maxAmount: 2000, approvals: 0 },
    { maxAmount: 10000, approvals: 1 },
    { maxAmount: Infinity, approvals: 2 },
  ],
  typeApprovers: {
    Inventory: "Admin",
    Asset: "Committee",
    Repair: "Committee rules",
  },
  staffApprovals: 1,
  committeeApprovals: 2,
  selectedAdmins: ["Society Admin 1", "Society Admin 2", "Society Admin 3"],
  adminAutoApprove: true,
};

export const initialInventory = [
  { id: "INV-001", name: "LED Bulb 12W", stock: 42, unit: "Nos", location: "Store Room A" },
  { id: "INV-002", name: "Floor Cleaner", stock: 8, unit: "Liters", location: "Housekeeping Store" },
  { id: "INV-003", name: "PVC Pipe 1 inch", stock: 65, unit: "Meters", location: "Store Room B" },
];

export const initialAssets = [
  { id: "AST-001", name: "Passenger Lift - Tower A", warranty: "12 Feb 2027", amc: "Yes" },
  { id: "AST-002", name: "CCTV Camera Set", warranty: "08 Jun 2026", amc: "No" },
  { id: "AST-003", name: "Water Pump - Main", warranty: "17 Nov 2024", amc: "Yes" },
];

export const rolePermissions = [
  { role: "Admin", raiseIndent: "Allowed", approve: "Allowed", issueStock: "Full access", viewReports: "Allowed" },
  { role: "Staff", raiseIndent: "Allowed", approve: "Not allowed", issueStock: "Admin approval required", viewReports: "Not allowed" },
  { role: "Committee Member", raiseIndent: "Allowed", approve: "Allowed", issueStock: "If authorized to approve", viewReports: "Allowed" },
];

export const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export function nextInventoryId(inventory) {
  const usedIds = new Set(inventory.map((item) => item.id));
  let number = 1;
  while (usedIds.has(`INV-${String(number).padStart(3, "0")}`)) {
    number += 1;
  }
  return `INV-${String(number).padStart(3, "0")}`;
}

export function getApprovalPlan(type, requesterRole, amount, rules) {
  if (requesterRole === "Admin" && rules.adminAutoApprove) return [];

  const amountApprovals =
    rules.amountTiers.find((tier) => amount <= tier.maxAmount)?.approvals ??
    rules.amountTiers[rules.amountTiers.length - 1]?.approvals ??
    0;
  const typeApprover = rules.typeApprovers[type];
  let approverGroup = typeApprover;
  let roleMinimum = 0;

  if (requesterRole === "Staff") {
    approverGroup = "Admin";
    roleMinimum = rules.staffApprovals;
  } else if (requesterRole === "Committee Member") {
    approverGroup = "Selected admins";
    roleMinimum = rules.committeeApprovals;
  }

  const numberOfApprovals = Math.max(amountApprovals, roleMinimum);

  if (!numberOfApprovals) return [];

  const fallbackGroup = approverGroup || "Admin";
  const selectedAdmins = rules.selectedAdmins.length
    ? rules.selectedAdmins
    : ["Society Admin"];

  if (fallbackGroup === "Selected admins" || fallbackGroup === "Admin") {
    return selectedAdmins.slice(0, numberOfApprovals);
  }

  const approver = "Committee";
  return Array.from({ length: numberOfApprovals }, () => approver);
}

export function validateIndent({ type, itemName, quantity }, inventory, assets) {
  const normalizedName = itemName.trim().toLocaleLowerCase();

  if (type === "Inventory") {
    const item = inventory.find(
      (record) => record.name.toLocaleLowerCase() === normalizedName,
    );
    if (!item) {
      return {
        summary: "No matching inventory item found; purchase is needed.",
        recommendation: "Move to purchase",
        purchaseQuantity: quantity,
      };
    }
    if (item.stock >= quantity) {
      return {
        summary: `${item.stock} ${item.unit} available in ${item.location}.`,
        recommendation: "Issue from stock",
        inventoryId: item.id,
      };
    }
    return {
      summary: `Only ${item.stock} ${item.unit} available; purchase the remaining quantity.`,
      recommendation: "Move to purchase",
      inventoryId: item.id,
      availableStock: item.stock,
      purchaseQuantity: quantity - item.stock,
    };
  }

  if (type === "Asset" || type === "Repair") {
    const asset = assets.find(
      (record) => record.name.toLocaleLowerCase() === normalizedName,
    );
    if (!asset) {
      return {
        summary: "No matching asset is registered.",
        assetExists: false,
        ...(type === "Asset" && {
          recommendation: "Move to purchase",
          purchaseQuantity: quantity,
        }),
      };
    }

    const warrantyActive =
      asset.warranty && new Date(asset.warranty).getTime() >= Date.now();
    return {
      summary: `Already exists: ${asset.id}. Warranty ${
        warrantyActive ? "active" : "expired"
      }; AMC ${asset.amc === "Yes" ? "active" : "not active"}.`,
      assetExists: true,
      assetId: asset.id,
      warrantyActive: Boolean(warrantyActive),
      amcActive: asset.amc === "Yes",
    };
  }

  return { summary: "No additional checks required." };
}
