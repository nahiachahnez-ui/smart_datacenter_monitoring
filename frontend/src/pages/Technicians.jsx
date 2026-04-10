import { useEffect, useState } from "react";
import API from "../api/api";
import MainLayout from "../layouts/MainLayout";
import { toast } from "react-toastify";

function Technicians() {

  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("technician");

  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  /* LOAD */
  const loadTechnicians = async () => {
    try {
      const res = await API.get("/users/technicians");
      setTechnicians(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  /* ADD */
  const addTechnician = async (e) => {
    e.preventDefault();

    try {
      await API.post("/users/technicians", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role
      });

      toast.success("Technician created");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");

      loadTechnicians();

    } catch (err) {
      toast.error("Failed to create technician");
    }
  };

  /* DELETE */
  const deleteTechnician = async (id) => {
    if (!window.confirm("Delete this technician?")) return;

    try {
      await API.delete(`/users/technicians/${id}`);
      toast.success("Technician deleted");
      loadTechnicians();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* TOGGLE */
  const toggleTechnician = async (id) => {
    try {
      await API.patch(`/users/technicians/${id}/toggle`);
      toast.success("Status updated");
      loadTechnicians();
    } catch {
      toast.error("Failed");
    }
  };

  /* OPEN EDIT */
  const openEditModal = (tech) => {
    setEditingUser(tech);

    setEditForm({
      first_name: tech.first_name,
      last_name: tech.last_name,
      email: tech.email,
      phone: tech.phone,
      role: tech.role
    });
  };

  /* UPDATE */
  const updateTechnician = async () => {
    try {
      await API.put(`/users/technicians/${editingUser.id}`, editForm);
      toast.success("Technician updated");
      setEditingUser(null);
      loadTechnicians();
    } catch {
      toast.error("Update failed");
    }
  };

  /* SEARCH */
  const filteredTechnicians = technicians.filter((t) =>
    (t.first_name + " " + t.last_name)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <MainLayout>

      <div className="space-y-8">

        <h2 className="text-3xl font-bold">
          Technician Management
        </h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search technician..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded border w-80"
        />

        {/* ADD FORM */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-xl shadow">

          <h3 className="font-semibold mb-4">
            Add Technician
          </h3>

          <form
            onSubmit={addTechnician}
            className="grid grid-cols-2 gap-4"
          >

            <input placeholder="First Name" value={firstName}
              onChange={(e)=>setFirstName(e.target.value)}
              className="p-3 border rounded-lg" required />

            <input placeholder="Last Name" value={lastName}
              onChange={(e)=>setLastName(e.target.value)}
              className="p-3 border rounded-lg" required />

            <input type="email" placeholder="Email" value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="p-3 border rounded-lg" required />

            <input placeholder="Phone" value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              className="p-3 border rounded-lg" />

            <select value={role}
              onChange={(e)=>setRole(e.target.value)}
              className="p-3 border rounded-lg">
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>

            <button className="bg-gray-900 text-white rounded-lg p-3">
              Create
            </button>

          </form>

        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-[#111827] shadow rounded-xl overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th>Email</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredTechnicians.map((t) => (

                <tr key={t.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">

                  <td className="p-4 font-semibold">
                    {t.first_name} {t.last_name}
                  </td>

                  <td>{t.email}</td>

                  {/* STATUS CLEAN */}
                  <td>
                    <span className={`
                      text-sm font-medium
                      ${t.active ? "text-green-600" : "text-gray-400"}
                    `}>
                      ● {t.active ? "active" : "disabled"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="flex justify-center gap-2 p-4">

                    <button
                      onClick={() => openEditModal(t)}
                      className="hover:bg-gray-200 p-2 rounded"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => toggleTechnician(t.id)}
                      className="hover:bg-yellow-200 p-2 rounded"
                    >
                      ⚡
                    </button>

                    <button
                      onClick={() => deleteTechnician(t.id)}
                      className="hover:bg-red-200 p-2 rounded"
                    >
                      🗑
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">

          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-xl shadow-lg">

            <div className="p-6">
              <h3 className="text-xl font-semibold">Edit Technician</h3>
              <p className="text-sm text-gray-500">Update information</p>
            </div>

            <div className="px-6 space-y-4">

              <input value={editForm.first_name}
                onChange={(e)=>setEditForm({...editForm,first_name:e.target.value})}
                className="w-full p-3 border rounded-lg" />

              <input value={editForm.last_name}
                onChange={(e)=>setEditForm({...editForm,last_name:e.target.value})}
                className="w-full p-3 border rounded-lg" />

              <input value={editForm.email}
                onChange={(e)=>setEditForm({...editForm,email:e.target.value})}
                className="w-full p-3 border rounded-lg" />

              <input value={editForm.phone}
                onChange={(e)=>setEditForm({...editForm,phone:e.target.value})}
                className="w-full p-3 border rounded-lg" />

            </div>

            <div className="flex gap-3 p-6">

              <button
                onClick={()=>setEditingUser(null)}
                className="w-full border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-500 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={updateTechnician}
                className="w-full bg-gray-900 text-white py-2 rounded-lg"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}

    </MainLayout>
  );
}

export default Technicians;