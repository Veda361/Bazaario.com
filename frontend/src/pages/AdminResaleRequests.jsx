import { useEffect, useState } from "react";
import { auth } from "../firebase";

const BASE_URL = "https://bazaario-com.onrender.com/api";

const AdminResaleRequests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch(`${BASE_URL}/resale/admin/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approve = async (id) => {
    const price = prompt("Enter resale price:");
    if (!price) return;

    const token = await auth.currentUser.getIdToken();

    await fetch(
      `${BASE_URL}/resale/admin/approve/${id}?admin_price=${price}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchRequests();
  };

  const reject = async (id) => {
    const token = await auth.currentUser.getIdToken();

    await fetch(`${BASE_URL}/resale/admin/reject/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h2 className="text-3xl font-bold mb-8">Resale Requests</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {requests.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 p-5 rounded-xl border border-white/10"
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="h-40 object-contain mb-3"
            />

            <h3>{item.title}</h3>
            <p>Expected: ₹{item.expected_price}</p>
            <p>Status: {item.status}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => approve(item.id)}
                className="bg-green-600 px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => reject(item.id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminResaleRequests;