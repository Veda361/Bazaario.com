import React, { useEffect, useState } from "react";
import { auth, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";

const Profile = () => {
  const [data, setData] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch("http://localhost:8000/api/profile/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dashboardData = await res.json();
      setData(dashboardData);
    };

    fetchDashboard();
  }, []);

  const handleUpload = async () => {
    if (!image) {
      toast.error("Select an image first");
      return;
    }

    try {
      setUploading(true);

      const storageRef = ref(storage, `profileImages/${user.uid}`);

      await uploadBytes(storageRef, image);

      const imageUrl = await getDownloadURL(storageRef);

      await updateProfile(user, {
        photoURL: imageUrl,
      });

      toast.success("Profile image updated 🎉");

      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!data)
    return (
      <div className="min-h-screen bg-netflixBlack flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-10 py-14 text-white">

        {/* PROFILE SECTION */}

        <div
          className="flex items-center gap-10 mb-14 border-4 border-white bg-netflixDark p-8
          shadow-[10px_10px_0px_#E50914]"
        >
          <div className="flex flex-col items-center gap-4">

            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white flex items-center justify-center bg-black">

              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}

            </div>

            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-sm"
            />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-5 py-2 bg-netflixRed border-2 border-white font-bold hover:bg-red-700 transition"
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>

          </div>

          <div>
            <h2 className="text-2xl font-black mb-2">{user.email}</h2>
            <p className="text-gray-400 text-sm">User ID: {user.uid}</p>
          </div>
        </div>

        {/* DASHBOARD TITLE */}

        <h1 className="text-4xl font-black uppercase mb-12 border-b-4 border-white pb-4">
          My Dashboard
        </h1>

        {/* STATS */}

        <div className="flex flex-wrap gap-10 mb-14">
          <StatCard title="Total Orders" value={data.stats.total_orders} />
          <StatCard title="Paid Orders" value={data.stats.paid_orders} />
          <StatCard title="Pending" value={data.stats.pending_orders} />
          <StatCard title="Failed" value={data.stats.failed_payments} />
          <StatCard
            title="Total Spent"
            value={`₹${Number(data.stats.total_spent || 0).toLocaleString(
              "en-IN"
            )}`}
            highlight
          />
        </div>

        {/* ORDERS */}

        <h2 className="text-2xl font-black uppercase mb-6">
          Order History
        </h2>

        <div className="space-y-8">
          {data.orders.map((order) => (
            <div
              key={order.id}
              className="border-4 border-white bg-netflixDark p-6
              shadow-[8px_8px_0px_#E50914]
              flex justify-between items-center"
            >
              <div>
                <p className="font-black">Order #{order.id}</p>

                <p className="text-netflixRed font-bold mt-2">
                  ₹{Number(order.amount || 0).toLocaleString("en-IN")}
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Status: {order.shipping_status || order.status}
                </p>
              </div>

              <button
                onClick={() => navigate(`/orders/${order.id}`)}
                className="px-6 py-3 uppercase font-bold
                border-4 border-white
                bg-netflixRed
                shadow-[6px_6px_0px_#000]
                hover:bg-red-700
                active:translate-x-2 active:translate-y-2 active:shadow-none"
              >
                View
              </button>
            </div>
          ))}
        </div>

      </div>
    </PageWrapper>
  );
};

const StatCard = ({ title, value, highlight }) => (
  <div
    className={`w-[220px] border-4 border-white p-6 bg-netflixDark
    shadow-[8px_8px_0px_#E50914]
    ${highlight ? "text-netflixRed" : ""}`}
  >
    <h3 className="text-sm uppercase mb-2">{title}</h3>
    <p className="text-2xl font-black">{value}</p>
  </div>
);

export default Profile;