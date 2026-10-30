import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Boxes,
  Package,
  Truck,
  Search,
  Bell,
  Plus,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  Filter,
  Info,
  Menu,
  MapPin,
  CalendarDays,
  ClipboardList,
  ShoppingCart,
  Pencil,
  Trash2,
  Minus,
  UserRound,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";
import "./styles.css";
import Phase2App from "./phase2/Phase2App.jsx";
import "./phase2/phase2.css";

const initialAssets = [
  {
    id: "AST-001",
    name: "Passenger Lift - Tower A",
    category: "Electrical",
    sub: "Lift",
    assigned: "Facilities Team",
    location: "Tower A · Ground floor",
    purchase: "12 Feb 2024",
    cost: 850000,
    vendor: "Otis Elevators",
    warranty: "12 Feb 2027",
    amc: "Yes",
    status: "Active",
  },
  {
    id: "AST-002",
    name: "CCTV Camera Set",
    category: "Security",
    sub: "CCTV Camera",
    assigned: "Security Team",
    location: "Main Gate",
    purchase: "08 Jun 2023",
    cost: 42000,
    vendor: "SecureVision Systems",
    warranty: "08 Jun 2026",
    amc: "No",
    status: "Under Maintenance",
  },
  {
    id: "AST-003",
    name: "Water Pump - Main",
    category: "Plumbing",
    sub: "Motor",
    assigned: "Maintenance Team",
    location: "Basement · Pump room",
    purchase: "17 Nov 2022",
    cost: 68000,
    vendor: "AquaFlow Services",
    warranty: "17 Nov 2024",
    amc: "Yes",
    status: "Active",
  },
  {
    id: "AST-004",
    name: "Fire Extinguisher Set",
    category: "Safety",
    sub: "Fire Safety",
    assigned: "Safety Officer",
    location: "Tower B · Floor 1",
    purchase: "04 Mar 2025",
    cost: 18500,
    vendor: "SafeHome Supplies",
    warranty: "04 Mar 2027",
    amc: "No",
    status: "Active",
  },
  {
    id: "AST-005",
    name: "DG Set 125 KVA",
    category: "Electrical",
    sub: "Generator",
    assigned: "Facilities Team",
    location: "Service yard",
    purchase: "22 Aug 2021",
    cost: 640000,
    vendor: "PowerGrid Equipments",
    warranty: "22 Aug 2023",
    amc: "Yes",
    status: "Damaged",
  },
];
const initialInventory = [
  {
    id: "INV-001",
    name: "LED Bulb 12W",
    category: "Electrical",
    unit: "Nos",
    stock: 42,
    min: 20,
    location: "Store Room A",
    vendor: "SafeHome Supplies",
    approval: "Yes",
    active: true,
  },
  {
    id: "INV-002",
    name: "Floor Cleaner",
    category: "Cleaning",
    unit: "Liters",
    stock: 8,
    min: 15,
    location: "Housekeeping Store",
    vendor: "CleanPro Distributors",
    approval: "No",
    active: true,
  },
  {
    id: "INV-003",
    name: "PVC Pipe 1 inch",
    category: "Plumbing",
    unit: "Meters",
    stock: 65,
    min: 25,
    location: "Store Room B",
    vendor: "AquaFlow Services",
    approval: "Yes",
    active: true,
  },
  {
    id: "INV-004",
    name: "Garbage Bags - Large",
    category: "Cleaning",
    unit: "Packs",
    stock: 12,
    min: 15,
    location: "Housekeeping Store",
    vendor: "CleanPro Distributors",
    approval: "No",
    active: true,
  },
  {
    id: "INV-005",
    name: "Electrical Tape",
    category: "Electrical",
    unit: "Rolls",
    stock: 31,
    min: 10,
    location: "Store Room A",
    vendor: "PowerGrid Equipments",
    approval: "No",
    active: false,
  },
];
const initialVendors = [
  {
    id: "VEN-001",
    name: "Otis Elevators",
    type: "Service Provider",
    service: "Electrical",
    contact: "Ramesh Kumar",
    phone: "+91 98765 43210",
    email: "service@otis.example",
    address: "Madhapur, Hyderabad",
    gst: "36ABCDE1234F1Z5",
    rating: 4.8,
  },
  {
    id: "VEN-002",
    name: "AquaFlow Services",
    type: "Maintenance",
    service: "Plumbing",
    contact: "Srinivas Rao",
    phone: "+91 98480 11223",
    email: "support@aquaflow.example",
    address: "Kukatpally, Hyderabad",
    gst: "36FGHIJ5678K1Z2",
    rating: 4.5,
  },
  {
    id: "VEN-003",
    name: "SafeHome Supplies",
    type: "Supplier",
    service: "Safety",
    contact: "Priya Sharma",
    phone: "+91 91234 56780",
    email: "sales@safehome.example",
    address: "Secunderabad, Hyderabad",
    gst: "—",
    rating: 4.2,
  },
  {
    id: "VEN-004",
    name: "CleanPro Distributors",
    type: "Supplier",
    service: "Cleaning",
    contact: "Mohammed Imran",
    phone: "+91 99887 76655",
    email: "orders@cleanpro.example",
    address: "LB Nagar, Hyderabad",
    gst: "36KLMNO9012P1Z3",
    rating: 4.6,
  },
  {
    id: "VEN-005",
    name: "PowerGrid Equipments",
    type: "Service Provider",
    service: "Electrical",
    contact: "Vijay Reddy",
    phone: "+91 90000 12345",
    email: "hello@powergrid.example",
    address: "Gachibowli, Hyderabad",
    gst: "36QRSTU3456V1Z8",
    rating: 4.4,
  },
];

const initialCategories = [
  { name: "Electrical", subcategories: ["Lift", "Motor", "Generator"] },
  { name: "Plumbing", subcategories: ["Water Pump", "Pipe", "Motor"] },
  { name: "Security", subcategories: ["CCTV Camera", "Access Control"] },
  { name: "Safety", subcategories: ["Fire Safety", "Fire Extinguisher"] },
  { name: "HVAC", subcategories: ["Air Conditioner", "Ventilation"] },
  { name: "Cleaning", subcategories: ["Cleaning Equipment"] },
  { name: "Other", subcategories: [] },
];

const nextId = (prefix, records) => {
  const usedIds = new Set(records.map((record) => record.id));
  let number = 1;

  while (usedIds.has(`${prefix}-${String(number).padStart(3, "0")}`)) {
    number++;
  }

  return `${prefix}-${String(number).padStart(3, "0")}`;
};



const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
function App() {
  const [section, setSection] = useState("Overview");
  const [currentRole, setCurrentRole] = useState("Admin");
  const [assets, setAssets] = useState(initialAssets);
  const [inventory, setInventory] = useState(initialInventory);
  const [vendors, setVendors] = useState(initialVendors);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stockItem, setStockItem] = useState(null);
  const [stockQty, setStockQty] = useState("");
  const [stockMode, setStockMode] = useState("in");
  const [categories, setCategories] = useState(initialCategories);
  const [categorySubcategoryDrafts, setCategorySubcategoryDrafts] = useState([]);
  const [assetCategory, setAssetCategory] = useState("Electrical");
  const subcategoryName = (subcategory) =>
    typeof subcategory === "string" ? subcategory : subcategory.name;
  const subcategoryIsActive = (subcategory) =>
    typeof subcategory === "string" || subcategory.active !== false;

  const notify = (s) => {
    setToast(s);
    setTimeout(() => setToast(""), 2600);
  };
  const nav = [
    {
      label: "WORKSPACE",
      items: [
        ["Overview", LayoutDashboard],
        ["Asset Master", Boxes],
        ["Inventory Master", Package],
        ["Vendor Master", Truck],
        ["Category Management", Bell],
      ],
    },
    {
      label: "OPERATIONS",
      items: [
        ["Indent Management", ClipboardList],
        ["Purchases", ShoppingCart],
      ],
    },
  ];
  const filteredAssets = useMemo(
    () =>
      assets.filter((a) =>
        [a.id, a.name, a.category, a.sub, a.assigned, a.location, a.vendor]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [assets, search],
  );
  const filteredInventory = useMemo(
    () =>
      inventory.filter((a) =>
        [a.id, a.name, a.category, a.location, a.vendor]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [inventory, search],
  );
  const filteredVendors = useMemo(
    () =>
      vendors.filter((a) =>
        [a.id, a.name, a.type, a.service, a.contact, a.email]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [vendors, search],
  );

  const openNew = (type) => {
    setEditing(null);
    if (type === "category") setCategorySubcategoryDrafts([""]);
    setModal(type);
  };
  const openEdit = (type, item) => {
    setEditing(item);
    if (type === "category") {
      setCategorySubcategoryDrafts(
        item.subcategories.length
          ? item.subcategories.map(subcategoryName)
          : [""],
      );
    }
    setModal(type);
  };
  const removeCategory = (category) => {
    const inUse =
      assets.some((asset) => asset.category === category.name) ||
      inventory.some((item) => item.category === category.name) ||
      vendors.some((vendor) => vendor.service === category.name);

    if (inUse) {
      notify("Category is in use and cannot be removed");
      return;
    }

    if (!window.confirm(`Remove the "${category.name}" category?`)) return;

    setCategories((previous) =>
      previous.filter((item) => item.name !== category.name),
    );
    notify("Category removed successfully");
  };
  const toggleSubcategory = (categoryName, subcategoryNameValue) => {
    const category = categories.find((item) => item.name === categoryName);
    const currentSubcategory = category?.subcategories.find(
      (item) => subcategoryName(item) === subcategoryNameValue,
    );
    const nextActive = !subcategoryIsActive(currentSubcategory);

    setCategories((previous) =>
      previous.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              subcategories: category.subcategories.map((subcategory) => {
                const name = subcategoryName(subcategory);
                const active = subcategoryIsActive(subcategory);
                return {
                  name,
                  active:
                    name === subcategoryNameValue ? nextActive : active,
                };
              }),
            }
          : category,
      ),
    );

    notify(
      nextActive
        ? "Sub-category activated"
        : "Sub-category deactivated",
    );
  };
  const saveForm = (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const values = Object.fromEntries(formData.entries());

  if (modal === "asset") {
    const item = {
      ...values,
      cost: Number(values.cost || 0),
      id: editing?.id || nextId("AST", assets),
    };

    setAssets((previous) =>
      editing
        ? previous.map((asset) =>
            asset.id === editing.id ? item : asset
          )
        : [item, ...previous]
    );

    notify(editing ? "Asset updated" : "Asset created");
  }

  if (modal === "inventory") {
    const item = {
      ...values,
      stock: Number(values.stock || 0),
      min: Number(values.min || 0),
      active: values.active === "true",
      id: editing?.id || nextId("INV", inventory),
    };

    setInventory((previous) =>
      editing
        ? previous.map((record) =>
            record.id === editing.id
              ? { ...record, ...item, stock: record.stock }
              : record
          )
        : [item, ...previous]
    );

    notify(editing ? "Item details updated" : "Inventory item added");
  }

  if (modal === "vendor") {
    const item = {
      ...values,
      rating: Number(values.rating || 0),
      id: editing?.id || nextId("VEN", vendors),
    };

    setVendors((previous) =>
      editing
        ? previous.map((vendor) =>
            vendor.id === editing.id ? item : vendor
          )
        : [item, ...previous]
    );

    notify(editing ? "Vendor updated" : "Vendor added");
  }

  if (modal === "assign") {
    setAssets((previous) =>
      previous.map((asset) =>
        asset.id === editing.id
          ? {
              ...asset,
              assigned: values.assigned,
              location: values.location,
            }
          : asset
      )
    );

    notify("Asset assignment updated");
  }

  if (modal === "category") {
    const name = values.name.trim();
    const previousSubcategories = editing?.subcategories || [];
    const subcategories = [
      ...new Map(
        formData
          .getAll("subcategory")
          .map((subcategory) => subcategory.trim())
          .filter(Boolean)
          .map((subcategory) => {
            const previous = previousSubcategories.find(
              (item) =>
                subcategoryName(item).toLowerCase() ===
                subcategory.toLowerCase(),
            );
            return [
              subcategory.toLowerCase(),
              {
                name: subcategory,
                active: previous ? subcategoryIsActive(previous) : true,
              },
            ];
          }),
      ).values(),
    ];

    if (!name) {
      notify("Category name is required");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() &&
        category.name !== editing?.name,
    );

    if (duplicate) {
      notify("Category already exists");
      return;
    }

    if (editing) {
      setCategories((previous) =>
        previous.map((category) =>
          category.name === editing.name
            ? { ...category, name, subcategories }
            : category,
        ),
      );

      if (editing.name !== name) {
        setAssets((previous) =>
          previous.map((asset) =>
            asset.category === editing.name
              ? { ...asset, category: name }
              : asset,
          ),
        );
        setInventory((previous) =>
          previous.map((item) =>
            item.category === editing.name
              ? { ...item, category: name }
              : item,
          ),
        );
        setVendors((previous) =>
          previous.map((vendor) =>
            vendor.service === editing.name
              ? { ...vendor, service: name }
              : vendor,
          ),
        );
        setAssetCategory((previous) =>
          previous === editing.name ? name : previous,
        );
      }

      notify("Category updated successfully");
    } else {
      setCategories((previous) => [
        { name, subcategories },
        ...previous,
      ]);
      notify("Category added successfully");
    }
  }

  setModal(null);
  setEditing(null);
};
  const changeStock = (e) => {
    e.preventDefault();
    const qty = Number(stockQty);
    if (!qty || qty < 1) return;
    if (stockMode === "out" && currentRole !== "Admin") {
      notify(
        currentRole === "Staff"
          ? "Staff stock issues require an indent approved by an admin."
          : "Committee stock issues must use an indent approved by an authorized committee member.",
      );
      return;
    }
    setInventory((old) =>
      old.map((i) =>
        i.id === stockItem.id
          ? {
              ...i,
              stock: Math.max(0, i.stock + (stockMode === "in" ? qty : -qty)),
            }
          : i,
      ),
    );
    notify(`Stock ${stockMode === "in" ? "received" : "issued"} successfully`);
    setStockItem(null);
    setStockQty("");
  };
  const statusClass = (s) => s.toLowerCase().replaceAll(" ", "-");
  const statusPill = (s) => (
    <span className={`pill ${statusClass(s)}`}>{s}</span>
  );
  const Field = ({
    label,
    name,
    defaultValue = "",
    required = false,
    type = "text",
    placeholder = "",
    children,
  }) => (
    <label className="field">
      <span>
        {label}
        {required && <b className="req"> *</b>}
      </span>
      {children || (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
        />
      )}
    </label>
  );
 const assetForm = () => {
  const selectedCategory = categories.find(
    (category) => category.name === assetCategory
  );

  const assetId = editing?.id || nextId("AST", assets);

  return (
    <form onSubmit={saveForm} className="form-grid">
      <div className="form-section">Basic information</div>

      <Field label="Asset ID">
        <input name="assetIdPreview" value={assetId} readOnly />
      </Field>

      <Field
        label="Asset name"
        name="name"
        defaultValue={editing?.name}
        required
        placeholder="e.g. Passenger Lift - Tower A"
      />

      <Field
        label="Assigned to"
        name="assigned"
        defaultValue={editing?.assigned}
        required
        placeholder="Team or staff member"
      />

      <Field label="Category">
        <select
          name="category"
          value={assetCategory}
          onChange={(event) => setAssetCategory(event.target.value)}
          required
        >
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sub-category">
        <select
          name="sub"
          key={`${assetCategory}-${editing?.id || "new"}`}
          defaultValue={editing?.sub || ""}
        >
          <option value="">Select sub-category</option>

          {selectedCategory?.subcategories
            .filter(
              (subcategory) =>
                subcategoryIsActive(subcategory) ||
                subcategoryName(subcategory) === editing?.sub,
            )
            .map((subcategory) => (
              <option
                key={subcategoryName(subcategory)}
                value={subcategoryName(subcategory)}
              >
                {subcategoryName(subcategory)}
              </option>
            ))}
        </select>
      </Field>

      <Field
        label="Block / Tower / Floor"
        name="block"
        defaultValue={editing?.block}
        placeholder="Tower A · Floor 1"
      />

      <Field
        label="Exact location"
        name="location"
        defaultValue={editing?.location}
        required
        placeholder="Basement, terrace, main gate"
      />

      <div className="form-section">Procurement details</div>

      <Field
        label="Purchase date"
        name="purchase"
        type="date"
        defaultValue={editing?.purchase}
      />

      <Field
        label="Purchase cost (₹)"
        name="cost"
        type="number"
        defaultValue={editing?.cost ?? ""}
        placeholder="0"
      />

      <Field label="Vendor" name="vendor">
        <select
          name="vendor"
          defaultValue={editing?.vendor || vendors[0]?.name || ""}
        >
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.name}>
              {vendor.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Invoice upload" name="invoice">
        <input
          type="file"
          name="invoice"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </Field>

      <div className="form-section">Lifecycle and status</div>

      <Field
        label="Warranty expiry"
        name="warranty"
        type="date"
        defaultValue={editing?.warranty}
      />

      <Field label="AMC available?" name="amc">
        <select name="amc" defaultValue={editing?.amc || "No"}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </Field>

      <Field label="AMC / local vendor" name="amcVendor">
        <select
          name="amcVendor"
          defaultValue={editing?.amcVendor || editing?.vendor || ""}
        >
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.name}>
              {vendor.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="AMC start date"
        name="amcStart"
        type="date"
        defaultValue={editing?.amcStart}
      />

      <Field
        label="AMC end date"
        name="amcEnd"
        type="date"
        defaultValue={editing?.amcEnd}
      />

      <Field label="Status" name="status">
        <select name="status" defaultValue={editing?.status || "Active"}>
          {[
            "Active",
            "Inactive",
            "Under Maintenance",
            "Damaged",
            "Scrapped",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Field>

      <div className="modal-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() => setModal(null)}
        >
          Cancel
        </button>

        <button className="btn primary" type="submit">
          {editing ? "Save changes" : "Create asset"}
        </button>
      </div>
    </form>
  );
};
  const inventoryForm = () => (
    <form onSubmit={saveForm} className="form-grid">
      <div className="form-section">Item details</div>
      <Field
        label="Item name"
        name="name"
        defaultValue={editing?.name}
        required
        placeholder="e.g. LED Bulb 12W"
      />
      <Field label="Category" name="category">
        <select
          name="category"
          defaultValue={editing?.category || categories[0]?.name || ""}
        >
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Unit type" name="unit">
        <select name="unit" defaultValue={editing?.unit || "Nos"}>
          {["Nos", "Liters", "Kg", "Meters", "Rolls", "Packs", "Boxes"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </Field>
      <Field
        label="Opening stock"
        name="stock"
        type="number"
        defaultValue={editing?.stock ?? 0}
        required
      />
      <Field
        label="Minimum threshold"
        name="min"
        type="number"
        defaultValue={editing?.min ?? 0}
        required
      />
      <Field
        label="Storage location"
        name="location"
        defaultValue={editing?.location}
        required
        placeholder="Store room / floor"
      />
      <Field label="Preferred vendor" name="vendor">
        <select
          name="vendor"
          defaultValue={editing?.vendor || vendors[0]?.name}
        >
          {vendors.map((v) => (
            <option key={v.id}>{v.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Approval required?" name="approval">
        <select name="approval" defaultValue={editing?.approval || "No"}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </Field>
      <Field label="Active status" name="active">
        <select
          name="active"
          defaultValue={editing?.active === false ? "false" : "true"}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </Field>
      {editing && (
        <p className="form-note span-two">
          <ShieldCheck size={16} /> Current stock is locked after initial setup.
          Use Stock In / Stock Out to change quantities.
        </p>
      )}
      <div className="modal-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() => setModal(null)}
        >
          Cancel
        </button>
        <button className="btn primary" type="submit">
          {editing ? "Save item details" : "Add item"}
        </button>
      </div>
    </form>
  );
  const vendorForm = () => (
    <form onSubmit={saveForm} className="form-grid">
      <div className="form-section">Vendor profile</div>
      <Field
        label="Vendor name"
        name="name"
        defaultValue={editing?.name}
        required
        placeholder="Company / vendor name"
      />
      <Field label="Vendor type" name="type">
        <select name="type" defaultValue={editing?.type || "Supplier"}>
          <option>Supplier</option>
          <option>Service Provider</option>
          <option>Maintenance</option>
          <option>Contractor</option>
        </select>
      </Field>
      <Field label="Service type" name="service">
        <select name="service" defaultValue={editing?.service || "Electrical"}>
          {[...new Set([...categories.map((category) => category.name), "General", editing?.service].filter(Boolean))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field
        label="Contact person"
        name="contact"
        defaultValue={editing?.contact}
        required
      />
      <Field
        label="Phone"
        name="phone"
        defaultValue={editing?.phone}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={editing?.email}
      />
      <Field
        label="Address"
        name="address"
        defaultValue={editing?.address}
        required
      />
      <Field
        label="GST number (optional)"
        name="gst"
        defaultValue={editing?.gst}
        placeholder="GSTIN"
      />
      <Field
        label="Internal rating (1–5)"
        name="rating"
        type="number"
        defaultValue={editing?.rating ?? 4}
      >
        <input
          name="rating"
          type="number"
          min="1"
          max="5"
          step="0.1"
          defaultValue={editing?.rating ?? 4}
        />
      </Field>
      <div className="modal-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() => setModal(null)}
        >
          Cancel
        </button>
        <button className="btn primary" type="submit">
          {editing ? "Save vendor" : "Add vendor"}
        </button>
      </div>
    </form>
  );
  const categoryForm = () => (
    <form onSubmit={saveForm} className="form-grid category-form">
      <div className="form-section">Category details</div>
      <Field
        label="Category name"
        name="name"
        defaultValue={editing?.name}
        required
        placeholder="e.g. Landscaping"
      />
      <div className="field span-two">
        <div className="category-subcategory-heading">
          <span>Sub-categories</span>
          <small>Add one or more sub-categories for this category.</small>
        </div>
        <div className="category-subcategory-fields">
          {categorySubcategoryDrafts.map((subcategory, index) => (
            <div className="category-subcategory-row" key={index}>
              <input
                name="subcategory"
                value={subcategory}
                onChange={(event) =>
                  setCategorySubcategoryDrafts((previous) =>
                    previous.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
                placeholder={`Sub-category ${index + 1}`}
              />
              <button
                type="button"
                className="category-subcategory-button remove"
                aria-label="Remove sub-category field"
                title="Remove sub-category"
                onClick={() =>
                  setCategorySubcategoryDrafts((previous) =>
                    previous.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn secondary category-subcategory-add"
            onClick={() =>
              setCategorySubcategoryDrafts((previous) => [...previous, ""])
            }
          >
            <Plus size={16} /> Add sub-category
          </button>
        </div>
      </div>
      {editing && (
        <p className="form-note span-two">
          Renaming a category also updates linked assets, inventory items and
          vendor service types.
        </p>
      )}
      <div className="modal-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() => setModal(null)}
        >
          Cancel
        </button>
        <button className="btn primary" type="submit">
          {editing ? "Save changes" : "Add category"}
        </button>
      </div>
    </form>
  );
  const tableToolbar = (placeholder, buttonLabel, onClick) => (
    <div className="table-toolbar">
      <div className="searchbox">
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <button
        className="btn secondary filter-btn"
        onClick={() => notify("Showing all records")}
      >
        <Filter size={16} /> Filter
      </button>
    </div>
  );
  const renderOverview = () => (
    <>
      <div className="welcome">
        <div></div>
        <button
          className="btn secondary"
          onClick={() => notify("Your master data is up to date")}
        >
          <CalendarDays size={16} /> Oct 29, 2026 <ChevronDown size={15} />
        </button>
      </div>
      <div className="stats-grid">
        <Stat
          icon={Boxes}
          tint="violet"
          label="Total assets"
          value={assets.length}
          meta="Across all society locations"
        />
        <Stat
          icon={Package}
          tint="blue"
          label="Inventory items"
          value={inventory.length}
          meta={`${inventory.filter((i) => i.stock <= i.min).length} need restocking`}
          alert={inventory.filter((i) => i.stock <= i.min).length > 0}
        />
        <Stat
          icon={Truck}
          tint="orange"
          label="Active vendors"
          value={vendors.length}
          meta="Suppliers & service partners"
        />
        <Stat
          icon={Wrench}
          tint="green"
          label="Assets in service"
          value={assets.filter((a) => a.status === "Active").length}
          meta="Currently operational"
        />
      </div>
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent assets</h2>
              <p>Latest assets registered in the system</p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setSection("Asset Master");
                setSearch("");
              }}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="mini-list">
            {assets.slice(0, 4).map((a) => (
              <div className="mini-row" key={a.id}>
                <div className="item-icon asset">
                  <Boxes size={19} />
                </div>
                <div className="mini-main">
                  <strong>{a.name}</strong>
                  <span>
                    {a.id} · {a.location}
                  </span>
                </div>
                {statusPill(a.status)}
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Inventory alerts</h2>
              <p>Items at or below minimum threshold</p>
            </div>
            <span className="alert-count">
              {inventory.filter((i) => i.stock <= i.min).length} alerts
            </span>
          </div>
          <div className="mini-list">
            {inventory
              .filter((i) => i.stock <= i.min)
              .map((i) => (
                <div className="mini-row" key={i.id}>
                  <div className="item-icon inventory">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="mini-main">
                    <strong>{i.name}</strong>
                    <span>
                      {i.stock} {i.unit} remaining · Min {i.min}
                    </span>
                  </div>
                  <span className="pill low-stock">Low stock</span>
                </div>
              ))}
            {inventory.every((i) => i.stock > i.min) && (
              <div className="empty">All inventory levels look healthy.</div>
            )}
          </div>
          <button
            className="wide-link"
            onClick={() => {
              setSection("Inventory Master");
              setSearch("");
            }}
          >
            Manage inventory <ArrowUpRight size={15} />
          </button>
        </section>
      </div>
      <section className="panel quick-panel">
        <div className="panel-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Common master setup tasks</p>
          </div>
        </div>
        <div className="quick-grid">
          <Quick
            icon={Boxes}
            title="Register an asset"
            text="Add society-owned equipment"
            onClick={() => openNew("asset")}
          />
          <Quick
            icon={Package}
            title="Add inventory item"
            text="Set stock and reorder threshold"
            onClick={() => openNew("inventory")}
          />
          <Quick
            icon={Truck}
            title="Add a vendor"
            text="Create a supplier profile"
            onClick={() => openNew("vendor")}
          />
          <Quick
            icon={ClipboardList}
            title="Assign an asset"
            text="Update team or location"
            onClick={() => {
              setEditing(assets[0]);
              setModal("assign");
            }}
          />
        </div>
      </section>
    </>
  );
  const renderAssets = () => (
    <>
      <PageHead
        title="Asset Master"
        desc="Track fixed assets owned by your society, from procurement to lifecycle."
        button="Create asset"
        onClick={() => openNew("asset")}
      />
      <div className="stats-inline">
        <SmallStat label="Total assets" value={assets.length} />
        <SmallStat
          label="Active"
          value={assets.filter((a) => a.status === "Active").length}
        />
        <SmallStat
          label="Maintenance"
          value={assets.filter((a) => a.status === "Under Maintenance").length}
        />
      </div>
      {tableToolbar(
        "Search assets by name, ID, category...",
        "Create asset",
        () => openNew("asset"),
      )}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Asset details</th>
                <th>Category</th>
                <th>Assigned to</th>
                <th>Location</th>
                <th>Purchase cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="table-primary">
                      <div className="table-icon">
                        <Boxes size={18} />
                      </div>
                      <div>
                        <strong>{a.name}</strong>
                        <span>
                          {a.id} · {a.sub}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{a.category}</span>
                  </td>
                  <td>{a.assigned || "—"}</td>
                  <td>
                    <span className="location-cell">
                      <MapPin size={14} />
                      {a.location}
                    </span>
                  </td>
                  <td className="amount">{money(a.cost)}</td>
                  <td>{statusPill(a.status)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        title="Assign asset"
                        onClick={() => openEdit("assign", a)}
                      >
                        <UserRound size={16} />
                      </button>
                      <button
                        title="Edit asset"
                        onClick={() => openEdit("asset", a)}
                      >
                        <Pencil size={16} />
                      </button>
                     {/* <button
  className="icon-button"
  title="View asset details"
  onClick={() =>
    notify(
      `${a.name} · ${a.vendor} · Warranty: ${a.warranty}`
    )
  }
>
  <Info size={17} />
</button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssets.length === 0 && (
            <EmptyState text="No assets match your search." />
          )}
        </div>
        <div className="table-footer">
          Showing <b>{filteredAssets.length}</b> of {assets.length} assets{" "}
          <span>Static demo data · Changes stay in this browser session</span>
        </div>
      </div>
    </>
  );
  const renderInventory = () => (
    <>
      <PageHead
        title="Inventory Master"
        desc="Monitor consumables, stock levels and supplier preferences."
        button="Add item"
        onClick={() => openNew("inventory")}
      />
      <div className="stats-inline">
        <SmallStat label="Total item types" value={inventory.length} />
        <SmallStat
          label="Low stock alerts"
          value={inventory.filter((i) => i.stock <= i.min).length}
          warn
        />
        <SmallStat
          label="Active items"
          value={inventory.filter((i) => i.active !== false).length}
        />
        <SmallStat
          label="Inactive items"
          value={inventory.filter((i) => i.active === false).length}
        />
      </div>
      {tableToolbar("Search items, categories, vendors...", "Add item", () =>
        openNew("inventory"),
      )}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item details</th>
                <th>Category</th>
                <th>Current stock</th>
                <th>Min. threshold</th>
                <th>Storage location</th>
                <th>Preferred vendor</th>
                <th>Status</th>
                <th>Stock update</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="table-primary">
                      <div className="table-icon inventory">
                        <Package size={18} />
                      </div>
                      <div>
                        <strong>{i.name}</strong>
                        <span>
                          {i.id} · {i.unit}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{i.category}</span>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <strong className={i.stock <= i.min ? "danger-text" : ""}>
                        {i.stock} {i.unit}
                      </strong>
                      {i.stock <= i.min && (
                        <span className="stock-warning">Low stock</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {i.min} {i.unit}
                  </td>
                  <td>{i.location}</td>
                  <td>{i.vendor}</td>
                  <td>
                    {i.active === false ? (
                      <span className="pill inactive">Inactive</span>
                    ) : (
                      <span className="pill active">Active</span>
                    )}
                  </td>
                  <td>
                    <div className="stock-actions">
                      <button
                        className="stock-update"
                        onClick={() => {
                          setStockItem(i);
                          setStockMode("in");
                          setStockQty("");
                        }}
                      >
                        <Package size={14} /> Stock update
                      </button>
                      <button
                        className="icon-button"
                        title="Edit item details"
                        onClick={() => openEdit("inventory", i)}
                      >
                        <Pencil size={15} />
                      </button>
                     <button
  className={`btn ${i.active === false ? "primary" : "secondary"}`}
  title={i.active === false ? "Activate item" : "Deactivate item"}
  onClick={() => {
    setInventory((old) =>
      old.map((x) =>
        x.id === i.id ? { ...x, active: x.active === false } : x
      )
    );

    notify(
      i.active === false
        ? "Item activated"
        : "Item deactivated"
    );
  }}
>
  {i.active === false ? "Activate" : "Deactivate"}
</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
            <EmptyState text="No inventory items match your search." />
          )}
        </div>
        <div className="table-footer">
          <span>
            <ShieldCheck size={14} /> Stock updates support both Stock In and
            Stock Out.
          </span>
          <span>{filteredInventory.length} item types</span>
        </div>
      </div>
    </>
  );
  const renderVendors = () => (
    <>
      <PageHead
        title="Vendor Master"
        desc="One directory for suppliers, service providers and maintenance partners."
        button="Add vendor"
        onClick={() => openNew("vendor")}
      />
      <div className="stats-inline">
        <SmallStat label="Total vendors" value={vendors.length} />
        <SmallStat
          label="Suppliers"
          value={vendors.filter((v) => v.type === "Supplier").length}
        />
        <SmallStat
          label="Service providers"
          value={vendors.filter((v) => v.type !== "Supplier").length}
        />
        <SmallStat
          label="Average rating"
          value={
            (
              vendors.reduce((s, v) => s + Number(v.rating || 0), 0) /
              (vendors.length || 1)
            ).toFixed(1) + " / 5"
          }
        />
      </div>
      {tableToolbar(
        "Search vendors, service type, contact...",
        "Add vendor",
        () => openNew("vendor"),
      )}
      <div className="vendor-grid">
        {filteredVendors.map((v) => (
          <div className="vendor-card" key={v.id}>
            <div className="vendor-top">
              <div className="vendor-avatar">
                {v.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <button
                className="icon-button"
                onClick={() => openEdit("vendor", v)}
              >
                <Pencil size={16} />
              </button>
            </div>
            <h3>{v.name}</h3>
            <div className="vendor-tags">
              <span className="category-tag">{v.type}</span>
              <span className="category-tag muted-tag">{v.service}</span>
            </div>
            <div className="vendor-rating">
              ★ <b>{Number(v.rating).toFixed(1)}</b>
              <span>Internal rating</span>
            </div>
            <div className="vendor-details">
              <div>
                <UserRound size={15} />
                <span>{v.contact}</span>
              </div>
              <div>
                <Truck size={15} />
                <span>{v.phone}</span>
              </div>
              <div>
                <span className="email-icon">@</span>
                <span>{v.email || "—"}</span>
              </div>
              <div>
                <MapPin size={15} />
                <span>{v.address}</span>
              </div>
            </div>
            <div className="vendor-links">
              <button
                onClick={() => {
                  setSection("Asset Master");
                  setSearch(v.name);
                  notify(`Assets filtered for ${v.name}`);
                }}
              >
                <Boxes size={15} /> Linked assets
              </button>
              <button
                onClick={() => {
                  setSection("Inventory Master");
                  setSearch(v.name);
                  notify(`Inventory filtered for ${v.name}`);
                }}
              >
                <Package size={15} /> Supplied items
              </button>
            </div>
          </div>
        ))}
        {filteredVendors.length === 0 && (
          <EmptyState text="No vendors match your search." />
        )}
      </div>
    </>
  );
  const renderCategory = () => (
    <>
      <PageHead
        title="Category Management"
        desc="Organize asset and inventory groups with reusable categories and sub-categories."
        button="Add category"
        onClick={() => openNew("category")}
      />
      <div className="stats-inline">
        <SmallStat label="Total categories" value={categories.length} />
        <SmallStat
          label="Sub-categories"
          value={categories.reduce(
            (total, category) => total + category.subcategories.length,
            0,
          )}
        />
        <SmallStat
          label="Asset groups"
          value={new Set(assets.map((asset) => asset.category)).size}
        />
      </div>
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Master categories</h2>
            <p>Keep your asset and inventory taxonomy consistent.</p>
          </div>
        </div>
        <div className="category-list">
          {categories.map((category) => (
            <div className="category-card" key={category.name}>
              <div className="category-card-head">
                <strong>{category.name}</strong>
                <div className="category-card-actions">
                  <span>{category.subcategories.length} sub-items</span>
                  <button
                    className="icon-button"
                    title={`Edit ${category.name}`}
                    aria-label={`Edit ${category.name}`}
                    onClick={() => openEdit("category", category)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-button danger-action"
                    title={`Remove ${category.name}`}
                    aria-label={`Remove ${category.name}`}
                    onClick={() => removeCategory(category)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="subcategory-stack">
                {category.subcategories.length > 0 ? (
                  category.subcategories.map((sub) => (
                    <div
                      className="subcategory-entry"
                      key={`${category.name}-${subcategoryName(sub)}`}
                    >
                      <span
                        className={`category-tag ${subcategoryIsActive(sub) ? "" : "muted-tag"}`}
                      >
                        {subcategoryName(sub)}
                      </span>
                      <button
                        className={`subcategory-status-toggle ${subcategoryIsActive(sub) ? "is-active" : "is-inactive"}`}
                        aria-label={`${subcategoryIsActive(sub) ? "Deactivate" : "Activate"} ${subcategoryName(sub)}`}
                        title={`${subcategoryIsActive(sub) ? "Deactivate" : "Activate"} sub-category`}
                        onClick={() =>
                          toggleSubcategory(
                            category.name,
                            subcategoryName(sub),
                          )
                        }
                      >
                        {subcategoryIsActive(sub) ? "Active" : "Inactive"}
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="empty-inline">No sub-categories added yet.</span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="society-switch">
          <div className="society-logo">GS</div>
          <div>
            <strong>Asset And Inventory Management</strong>
          </div>
          <ChevronDown size={16} />
        </div>
        {nav.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items
              .filter(([label]) => label !== "Overview" || currentRole !== "Staff")
              .map(([label, Icon]) => (
              <button
                key={label}
                className={`nav-item ${section === label ? "selected" : ""}`}
                onClick={() => {
                  setSection(label);
                  setSearch("");
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {label === "Inventory Master" &&
                  inventory.some((i) => i.stock <= i.min) && (
                    <i className="nav-dot" />
                  )}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <strong>{section}</strong>
          </div>
        </header>
        <div className="content">
          {section === "Overview" ? (
            renderOverview()
          ) : section === "Asset Master" ? (
            renderAssets()
          ) : section === "Inventory Master" ? (
            renderInventory()
          ) : section === "Vendor Master" ? (
            renderVendors()
          ) : section === "Category Management" ? (
            renderCategory()
          ) : null}
          <div className={section === "Indent Management" || section === "Purchases" ? "" : "phase2-hidden"}>
            <Phase2App
              embedded
              section={section}
              currentRole={currentRole}
              onCurrentRoleChange={setCurrentRole}
              workspaceAssets={assets}
              workspaceInventory={inventory}
              workspaceCategories={categories}
              workspaceVendors={vendors}
              onInventoryChange={setInventory}
            />
          </div>
        </div>
      </main>
      {sidebarOpen && (
        <div className="scrim" onClick={() => setSidebarOpen(false)} />
      )}{" "}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {(modal === "asset" ||
        modal === "inventory" ||
        modal === "vendor" ||
        modal === "category" ||
        modal === "assign"
      ) && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className={`modal ${modal === "category" ? "category-modal" : ""}`}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">MASTER SETUP</div>
                <h2>
                  {modal === "asset"
                    ? editing
                      ? "Edit asset"
                      : "Create asset"
                    : modal === "inventory"
                      ? editing
                        ? "Edit item details"
                        : "Add inventory item"
                      : modal === "vendor"
                        ? editing
                          ? "Edit vendor"
                          : "Add vendor"
                        : modal === "category"
                          ? editing
                            ? "Edit category"
                            : "Add category"
                        : "Assign asset"}
                </h2>
                <p>
                  {modal === "asset"
                    ? "Record asset information, procurement and lifecycle details."
                    : modal === "inventory"
                      ? "Set up item details and define the initial stock level."
                      : modal === "vendor"
                        ? "Add contact details and service information for a vendor."
                        : modal === "category"
                          ? "Create or update a category used across your masters."
                        : "Update who is responsible for this asset and where it is located."}
                </p>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={19} />
              </button>
            </div>
            {modal === "asset" ? (
              assetForm()
            ) : modal === "inventory" ? (
              inventoryForm()
            ) : modal === "vendor" ? (
              vendorForm()
            ) : modal === "category" ? (
              categoryForm()
            ) : (
              <form onSubmit={saveForm} className="form-grid">
                <div className="form-section">Assignment details</div>
                <Field label="Asset" name="assetName">
                  <input value={editing?.name || ""} readOnly />
                </Field>
                <Field
                  label="Assigned to"
                  name="assigned"
                  defaultValue={editing?.assigned}
                  required
                  placeholder="Team or staff member"
                />
                <Field
                  label="Location"
                  name="location"
                  defaultValue={editing?.location}
                  required
                  placeholder="Block, floor, exact location"
                />
                <div className="form-note span-two">
                  <UserRound size={16} /> Assignment changes are reflected in
                  the asset record.
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn primary" type="submit">
                    Save assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {stockItem && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setStockItem(null);
          }}
        >
          <div className="modal stock-modal">
            <div className="modal-head">
              <div>
                <div className="eyebrow">INVENTORY MOVEMENT</div>
                <h2>Stock {stockMode === "in" ? "In" : "Out"}</h2>
                <p>
                  {stockItem.name} · {stockItem.id}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setStockItem(null)}
              >
                <X size={19} />
              </button>
            </div>
            <div className="stock-current">
              <span>Current stock</span>
              <strong>
                {stockItem.stock} {stockItem.unit}
              </strong>
              <small>
                Minimum threshold: {stockItem.min} {stockItem.unit}
              </small>
            </div>
            <form onSubmit={changeStock} className="stock-form">
              <div className="movement-toggle">
                <button
                  type="button"
                  className={stockMode === "in" ? "chosen" : ""}
                  onClick={() => setStockMode("in")}
                >
                  <Plus size={16} /> Stock In
                </button>
                <button
                  type="button"
                  className={stockMode === "out" ? "chosen" : ""}
                  onClick={() => setStockMode("out")}
                >
                  − Stock Out
                </button>
              </div>
              <Field label="Quantity" name="quantity" type="number" required>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  max={stockMode === "out" ? stockItem.stock : undefined}
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder={`Enter quantity in ${stockItem.unit}`}
                  required
                />
              </Field>
              <p className="form-note">
                <ShieldCheck size={16} /> Stock changes are recorded through
                movements, not direct edits.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setStockItem(null)}
                >
                  Cancel
                </button>
                <button className="btn primary" type="submit">
                  Confirm stock {stockMode === "in" ? "in" : "out"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function Stat({ icon: Icon, tint, label, value, meta, alert }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tint}`}>
        <Icon size={20} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-meta ${alert ? "meta-alert" : ""}`}>
        {alert && <AlertTriangle size={13} />} {meta}
      </div>
      <div className="stat-corner">
        <ArrowUpRight size={16} />
      </div>
    </div>
  );
}
function SmallStat({ label, value, warn }) {
  return (
    <div className="small-stat">
      <span>{label}</span>
      <strong className={warn ? "danger-text" : ""}>{value}</strong>
    </div>
  );
}
function PageHead({ title, desc, button, onClick }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">MASTER SETUP</div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <button className="btn primary" onClick={onClick}>
        <Plus size={17} />
        {button}
      </button>
    </div>
  );
}
function Quick({ icon: Icon, title, text, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <div className="quick-icon">
        <Icon size={19} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <ArrowUpRight size={16} className="quick-arrow" />
    </button>
  );
}
function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div>
        <Search size={21} />
      </div>
      <strong>No results found</strong>
      <span>{text}</span>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
