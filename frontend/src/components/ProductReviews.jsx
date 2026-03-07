import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

const ProductReviews = ({ productId }) => {

  const auth = getAuth();

  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const fetchReviews = async () => {

    if (!productId) return;

    try {
      const data = await apiRequest(`/reviews/${productId}`);
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    if (!productId) return;

    fetchReviews();

    const interval = setInterval(fetchReviews, 4000);

    return () => clearInterval(interval);

  }, [productId]);

  const submitReview = async () => {

    const user = auth.currentUser;

    if (!user) {
      toast.error("Login to review");
      return;
    }

    try {

      await apiRequest("/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: user.uid,
          username: user.email,
          rating,
          comment
        })
      });

      setComment("");

      toast.success("Review added ⭐");

      fetchReviews();

    } catch (err) {

      console.error(err);
      toast.error("Failed to add review");

    }
  };

  /* =====================
     Rating Calculations
  ===================== */

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : (
          reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1);

  const ratingCounts = [5,4,3,2,1].map(star =>
    reviews.filter(r => r.rating === star).length
  );

  return (

    <div className="bg-netflixBlack text-white py-20">

      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}

        <h2 className="text-4xl font-black mb-10 border-b-2 border-white pb-4">
          Customer Reviews
        </h2>

        {/* =======================
            RATING SUMMARY
        ======================= */}

        <div className="grid md:grid-cols-2 gap-10 mb-14">

          {/* Average */}

          <div className="border-4 border-white bg-netflixDark p-8 shadow-[10px_10px_0px_#E50914]">

            <h3 className="text-5xl font-black mb-3">
              {averageRating} ⭐
            </h3>

            <p className="text-gray-400">
              Based on {totalReviews} reviews
            </p>

          </div>

          {/* Rating Bars */}

          <div className="border-4 border-white bg-netflixDark p-8 shadow-[10px_10px_0px_#E50914]">

            {[5,4,3,2,1].map((star, i) => {

              const percent =
                totalReviews === 0
                  ? 0
                  : (ratingCounts[i] / totalReviews) * 100;

              return (

                <div
                  key={star}
                  className="flex items-center gap-4 mb-3"
                >

                  <span className="w-12">{star} ⭐</span>

                  <div className="flex-1 bg-gray-700 h-3">

                    <div
                      className="bg-netflixRed h-3"
                      style={{ width: `${percent}%` }}
                    />

                  </div>

                  <span className="w-10 text-sm text-gray-400">
                    {ratingCounts[i]}
                  </span>

                </div>

              );
            })}

          </div>

        </div>

        {/* =======================
           ADD REVIEW
        ======================= */}

        <div className="border-4 border-white bg-netflixDark p-6 mb-12 shadow-[10px_10px_0px_#E50914]">

          <div className="flex flex-wrap gap-4 items-center">

            <select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="bg-black border-2 border-white px-3 py-2"
            >
              {[5,4,3,2,1].map(r => (
                <option key={r}>{r} ⭐</option>
              ))}
            </select>

            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
              className="flex-1 bg-black border-2 border-white px-4 py-2"
            />

            <button
              onClick={submitReview}
              className="bg-netflixRed px-6 py-2 border-2 border-white font-bold hover:bg-red-700 transition"
            >
              Submit
            </button>

          </div>

        </div>

        {/* =======================
           REVIEW LIST
        ======================= */}

        <div className="space-y-8">

          {reviews.length === 0 && (
            <p className="text-gray-400">
              No reviews yet. Be the first to review!
            </p>
          )}

          {reviews.map((r) => (

            <div
              key={r.id}
              className="border-4 border-white bg-netflixDark p-6
              shadow-[8px_8px_0px_#E50914]
              transition hover:-translate-x-1 hover:-translate-y-1
              hover:shadow-[12px_12px_0px_#E50914]"
            >

              <div className="flex justify-between items-center mb-3">

                <span className="font-bold text-lg">
                  {r.username}
                </span>

                <span className="text-yellow-400 text-lg">
                  {"⭐".repeat(r.rating)}
                </span>

              </div>

              <p className="text-gray-300 leading-relaxed">
                {r.comment}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default ProductReviews;