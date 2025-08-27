import React, { useState } from "react";
import ProfileCard from "./ProfileCard";
import PhotoUpload from "./PhotoUpload";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { adduser } from "../utils/userSlice";

const EditProfile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [firstName, setfirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [about, setAbout] = useState(user.about || "");
  const [gender, setGender] = useState(user.gender || "");
  const [age, setAge] = useState(user.age || 0);
  const [photourl, setPhotourl] = useState(user.photourl);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");
  const [isSelf, setIsSelf] = useState(true);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoUpdate = (newPhotoUrl, updatedUser) => {
    setPhotourl(newPhotoUrl);
    if (updatedUser) {
      dispatch(adduser(updatedUser));
    }
    setToastMessage("Photo uploaded successfully!");
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 3000);
  };

  const handlePhotoError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleSave = async (e) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          about,
          gender,
          age,
          photourl,
        },
        {
          withCredentials: true,
        }
      );
      dispatch(adduser(res?.data?.body));
      setToastMessage("Profile updated successfully!");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
    } catch (err) {
      console.log(err);
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-primary p-4">
        <div className="max-w-6xl mx-auto">
          {/* Verification Status Banner */}
          {user && !user.verified && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 mb-1">
                      Email Verification Required
                    </h3>
                    <p className="text-sm text-amber-700">
                      Please check your email and click the verification link to
                      access all features.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors duration-200"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Edit Form */}
            <div className="w-full lg:w-1/2 text-slate-900">
              <div className="card">
                <div className="bg-slate-900 p-6 rounded-t-xl">
                  <h2 className="text-2xl font-bold text-white text-center">
                    Edit Your Profile
                  </h2>
                  <p className="text-slate-300 text-center mt-2">
                    Update your information to make a great impression
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your first name"
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-white"
                          value={firstName}
                          onChange={(e) => setfirstName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your last name"
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-white"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        About Yourself
                      </label>
                      <textarea
                        placeholder="Tell us about yourself..."
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 h-24 resize-none bg-white"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Gender
                        </label>
                        <select
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-white"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          placeholder="Enter your age"
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-white"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-4">
                        Profile Photo
                      </label>
                      <PhotoUpload
                        currentPhoto={photourl}
                        onPhotoUpdate={handlePhotoUpdate}
                        onError={handlePhotoError}
                        disabled={loading}
                      />

                      {/* Manual URL Input (Optional) */}
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                          Or enter photo URL manually:
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/photo.jpg"
                          className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-white"
                          value={photourl || ""}
                          onChange={(e) => setPhotourl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">
                        {error}
                      </p>
                    </div>
                  )}
                  <button
                    className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save Profile"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="w-full lg:w-1/2">
              <div className="sticky top-20">
                <div className="card p-4 mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 text-center">
                    Profile Preview
                  </h3>
                  <p className="text-slate-600 text-sm text-center mt-1">
                    This is how others will see your profile
                  </p>
                </div>
                <ProfileCard
                  user={{ firstName, lastName, about, gender, age, photourl }}
                  isSelf={isSelf}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-600 text-white p-4 rounded-xl shadow-lg max-w-sm">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
