import { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";

function Technicians() {

  const currentUserRole = localStorage.getItem("role");

  if (currentUserRole !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "technician"
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedTech, setSelectedTech] = useState(null);

  /* LOAD */
  const loadTechnicians = async () => {
    try {
      const res = await API.get("/users/technicians");
      setTechnicians(res.data);
    } catch {
      toast.error("Failed to load technicians");
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  /* ADD */
  const addTechnician = async (e) => {
    e.preventDefault();

    try {
      await API.post("/users/technicians", form);

      toast.success(
        `${form.role === "admin" ? "Admin" : "Technician"} created successfully`
      );

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "technician"
      });

      setShowForm(false);
      loadTechnicians();

    } catch {
      toast.error("Failed to create user");
    }
  };

  /* DELETE */
  const deleteTechnician = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/users/technicians/${id}`);
      toast.success("Deleted");
      loadTechnicians();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* TOGGLE */
  const toggleTechnician = async (id) => {
    try {
      await API.patch(`/users/technicians/${id}/toggle`);
      loadTechnicians();
    } catch {
      toast.error("Failed");
    }
  };

  /* EDIT */
  const openEdit = (t) => {
    setEditingUser(t);
    setEditForm({
      first_name: t.first_name || "",
      last_name: t.last_name || "",
      email: t.email || "",
      phone: t.phone || "",
      role: t.role || "technician"
    });
  };

  const updateTechnician = async () => {
    try {
      await API.put(`/users/technicians/${editingUser.id}`, editForm);
      toast.success("Updated");
      setEditingUser(null);
      loadTechnicians();
    } catch {
      toast.error("Update failed");
    }
  };

  /* FILTER */
  const filtered = technicians.filter((t) => {
    const matchesSearch =
      (t.first_name + " " + t.last_name)
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || t.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const countAll = technicians.length;
  const countAdmin = technicians.filter(t => t.role === "admin").length;
  const countTech = technicians.filter(t => t.role === "technician").length;

  return (
    <div className="space-y-8 text-gray-900 dark:text-gray-100">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Technicians</h2>

        <button
          onClick={() => setShowForm(prev => !prev)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? "Close" : "+ Add User"}
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search || ""}
        onChange={(e) => setSearch(e.target.value)}
        className="p-3 rounded-lg border w-80 bg-white dark:bg-gray-800"
      />

      {/* FILTER */}
      <div className="flex gap-3">
        <FilterCard title="All" count={countAll}
          active={roleFilter === "all"}
          onClick={()=>setRoleFilter("all")}
        />
        <FilterCard title="Technicians" count={countTech}
          active={roleFilter === "technician"}
          onClick={()=>setRoleFilter("technician")}
        />
        <FilterCard title="Admins" count={countAdmin}
          active={roleFilter === "admin"}
          onClick={()=>setRoleFilter("admin")}
        />
      </div>

      {/* 🔥 FIXED FORM */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Add New User</h3>
            <button onClick={()=>setShowForm(false)}>✕</button>
          </div>

          <form onSubmit={addTechnician} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.first_name}
                onChange={(v)=>setForm({...form, first_name:v})} />
              <Input label="Last Name" value={form.last_name}
                onChange={(v)=>setForm({...form, last_name:v})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" value={form.email}
                onChange={(v)=>setForm({...form, email:v})} />
              <Input label="Phone" value={form.phone}
                onChange={(v)=>setForm({...form, phone:v})} />
            </div>

            {/* ROLE */}
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Role Selection
              </label>

              <div className="grid grid-cols-2 gap-4">

                <div
                  onClick={()=>setForm(prev=>({...prev, role:"technician"}))}
                  className={`p-4 rounded-xl border cursor-pointer ${
                    form.role === "technician"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <h4 className="font-semibold">Technician</h4>
                </div>

                <div
                  onClick={()=>setForm(prev=>({...prev, role:"admin"}))}
                  className={`p-4 rounded-xl border cursor-pointer ${
                    form.role === "admin"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <h4 className="font-semibold">Admin</h4>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={()=>setShowForm(false)}
                className="px-4 py-2 border rounded">
                Cancel
              </button>

              <button type="submit"
                className="px-4 py-2 bg-gray-900 text-white rounded">
                Create
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border shadow overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-100 dark:hover:bg-gray-800">

                <td className="p-4">{t.first_name} {t.last_name}</td>
                <td>{t.email}</td>

                <td className={t.active ? "text-green-500" : "text-gray-400"}>
                  ● {t.active ? "active" : "disabled"}
                </td>

                <td>{t.role}</td>

                <td className="flex justify-center gap-2 p-4">
                  <button onClick={()=>setSelectedTech(t)}>👁</button>
                  <button onClick={()=>openEdit(t)}>✏️</button>
                  <button onClick={()=>toggleTechnician(t.id)}>⚡</button>
                  <button onClick={()=>deleteTechnician(t.id)}>🗑</button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* DETAILS */}
      {selectedTech && (
        <Modal title="Details" onClose={()=>setSelectedTech(null)}>
          <div className="space-y-2">

  <p>
    <span className="font-semibold">Full Name:</span>{" "}
    {selectedTech.first_name} {selectedTech.last_name}
  </p>

  <p>
    <span className="font-semibold">Email:</span>{" "}
    {selectedTech.email}
  </p>

  <p>
    <span className="font-semibold">Phone:</span>{" "}
    {selectedTech.phone || "Not provided"}
  </p>

</div>
        </Modal>
      )}

      {/* EDIT */}
      {editingUser && (
        <Modal title="Edit" onClose={()=>setEditingUser(null)}>
          <Input value={editForm.first_name}
            onChange={(v)=>setEditForm({...editForm, first_name:v})}/>
          <button onClick={updateTechnician}>Save</button>
        </Modal>
      )}

    </div>
  );
}

/* INPUT */
function Input({ label, value, onChange }) {
  return (
    <div>
      {label && <label className="text-sm">{label}</label>}
      <input
        value={value || ""}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full p-3 border rounded bg-white dark:bg-gray-800"
      />
    </div>
  );
}

/* FILTER */
function FilterCard({ title, count, active, onClick }) {
  return (
    <div onClick={onClick}
      className={`p-4 border rounded cursor-pointer ${
        active ? "bg-gray-900 text-white" : ""
      }`}>
      {title} ({count})
    </div>
  );
}

/* MODAL */
function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded w-[400px]">
        <h3>{title}</h3>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Technicians;