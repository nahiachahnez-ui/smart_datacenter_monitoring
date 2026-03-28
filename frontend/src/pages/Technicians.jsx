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

  /* LOAD TECHNICIANS */

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

  /* ADD TECHNICIAN */

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

  /* ENABLE / DISABLE */

  const toggleTechnician = async (id) => {

    try {

      await API.patch(`/users/technicians/${id}/toggle`);

      toast.success("Status updated");

      loadTechnicians();

    } catch {

      toast.error("Failed");

    }

  };

  /* OPEN EDIT MODAL */

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

  /* UPDATE TECHNICIAN */

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

        {/* ADD TECHNICIAN */}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">

          <h3 className="font-semibold mb-4">
            Add Technician
          </h3>

          <form
            onSubmit={addTechnician}
            className="grid grid-cols-2 gap-4"
          >

            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e)=>setFirstName(e.target.value)}
              className="p-3 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e)=>setLastName(e.target.value)}
              className="p-3 border rounded"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="p-3 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              className="p-3 border rounded"
            />

            <select
              value={role}
              onChange={(e)=>setRole(e.target.value)}
              className="p-3 border rounded"
            >
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>

            <button
              className="bg-green-600 text-white rounded p-3"
            >
              Create Technician
            </button>

          </form>

        </div>

        {/* TABLE */}

        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">

          <table className="w-full">

            <thead className="border-b">

              <tr>

                <th className="p-4 text-left">ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th className="text-center">Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredTechnicians.map((t) => (

                <tr
                  key={t.id}
                  onClick={() => setSelectedTechnician(t)}
                  className="border-b hover:bg-gray-100 cursor-pointer"
                >

                  <td className="p-4">{t.id}</td>

                  <td>
                    {t.first_name} {t.last_name}
                  </td>

                  <td>{t.email}</td>

                  <td>

                    <span
                      className={`px-2 py-1 text-xs rounded text-white ${
                        t.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {t.active ? "Active" : "Disabled"}
                    </span>

                  </td>

                  <td className="p-4 flex gap-2 justify-center">

                    <button
                      onClick={(e)=>{
                        e.stopPropagation();
                        openEditModal(t);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e)=>{
                        e.stopPropagation();
                        toggleTechnician(t.id);
                      }}
                      className="bg-yellow-500 px-3 py-1 rounded text-white"
                    >
                      {t.active ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={(e)=>{
                        e.stopPropagation();
                        deleteTechnician(t.id);
                      }}
                      className="bg-red-500 px-3 py-1 rounded text-white"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* DETAILS MODAL */}

      {selectedTechnician && (

        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">

            <h3 className="text-xl font-bold mb-4">
              Technician Details
            </h3>

            <p><strong>Name:</strong> {selectedTechnician.first_name} {selectedTechnician.last_name}</p>

            <p><strong>Email:</strong> {selectedTechnician.email}</p>

            <p><strong>Phone:</strong> {selectedTechnician.phone}</p>

            <p><strong>Role:</strong> {selectedTechnician.role}</p>

            <p><strong>Status:</strong> {selectedTechnician.active ? "Active" : "Disabled"}</p>

            <p>
              <strong>Created:</strong>{" "}
              {new Date(selectedTechnician.created_at).toLocaleDateString()}
            </p>

            <button
              onClick={() => setSelectedTechnician(null)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* EDIT MODAL */}

      {editingUser && (

        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">

            <h3 className="text-xl font-bold mb-4">
              Edit Technician
            </h3>

            <div className="space-y-3">

              <input
                value={editForm.first_name}
                onChange={(e)=>setEditForm({...editForm,first_name:e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="First Name"
              />

              <input
                value={editForm.last_name}
                onChange={(e)=>setEditForm({...editForm,last_name:e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Last Name"
              />

              <input
                value={editForm.email}
                onChange={(e)=>setEditForm({...editForm,email:e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Email"
              />

              <input
                value={editForm.phone}
                onChange={(e)=>setEditForm({...editForm,phone:e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Phone"
              />

            </div>

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={()=>setEditingUser(null)}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancel
              </button>

              <button
                onClick={updateTechnician}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Update
              </button>

            </div>

          </div>

        </div>

      )}

    </MainLayout>

  );

}

export default Technicians;